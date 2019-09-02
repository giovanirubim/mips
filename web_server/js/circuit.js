import { Coord, Transform } from '/js/transform-2d.js'
import { Conductor, Point, Wire } from '/js/conduction.js'
import { Component } from '/js/component.js'
import { arrayRemove, pushUnique, calcDistance, lineDistance } from '/js/utils.js';
import { POINT_PICK_RADIUS, WIRE_PICK_DIST } from '/js/config.js'

export class IOPoint extends Point {
	constructor(type) {
		super();
		this.type = type;
	}
}

export class InnerIOPoint extends IOPoint {
	constructor(type) {
		super(type);
	}
}

export class OuterIOPoint extends IOPoint {
	constructor(type, component, third) {
		super(type);
		this.component = component;
		this.defaultCond = null;
		if (third instanceof Conductor) {
			this.isSource  = 1;
			this.attrName  = null;
			this.conductor = third;
		} else {
			this.isSource  = 0;
			this.attrName  = third || null;
			this.conductor = null;
			if (third) {
				this.defaultCond = new Conductor(32);
			}
		}
		this.transform = Transform();
	}
	translate(x, y) {
		this.transform.translate(x, y);
		return this;
	}
	pos(coord) {
		coord.set(0, 0);
		coord.apply(this.transform);
		coord.apply(this.component.transform);
		return coord;
	}
	setConductor(conductor) {
		const {attrName} = this;
		if (attrName !== null) {
			const {component, defaultCond} = this;
			if (conductor === null) {
				component[attrName] = defaultCond;
			} else {
				component[attrName] = conductor;
			}
		}
		this.conductor = conductor;
		return this;
	}
}

const getConnectedPoints = (rootPoint, array, visited) => {
	const {id, wires} = rootPoint;
	visited[id] = true;
	array.push(rootPoint);
	for (let i=wires.length; i--;) {
		const point = wires[i].other(rootPoint);
		if (visited[point.id] !== true) {
			getConnectedPoints(point, array, visited);
		}
	}
};
const setConductor = (points, conductor) => {
	const {length} = points;
	for (let i=length; i;) {
		const point = points[--i];
		if (point.isSource === 0) {
			point.setConductor(conductor);
		}
	}
};
const getSourceConductor = points => {
	const {length} = points;
	for (let i=length; i;) {
		const point = points[--i];
		if (point.isSource === 1) {
			return point.conductor;
		}
	}
	return null;
};
const resetConductors = rootPoint => {
	const array = [];
	getConnectedPoints(rootPoint, array, {});
	setConductor(array, getSourceConductor(array));
};

export class Circuit {
	constructor() {
		this.wires = [];
		this.points = [];
		this.iopoints = [];
		this.components = [];
		this.hiddenWires = [];

		// Auxiliares
		this.pos = Coord();
		this.pos_a = Coord();
		this.pos_b = Coord();
	}
	createPoint(x, y) {
		const point = new Point();
		point.coord.set(x, y);
		this.points.push(point);
		return point;
	}
	createIOPoint(type, x, y) {
		const point = new InnerIOPoint(type);
		point.coord.set(x, y);
		this.iopoints.push(point);
		return point;
	}

	// Assume que ambos os pontos possuem os condutores atualizados.
	// Verifica se ambos já estão conectados a uma fonte cada. Se estão o retorno é false. Se não
	// estão então seus condutores são atualizados e o novo fio é criado e retornado.
	createWire(a, b) {
		let cond_a = a.conductor;
		let cond_b = b.conductor;
		if (cond_a !== null && cond_b !== null && cond_a !== cond_b) return false;
		if (cond_a !== cond_b) {
			if (cond_a !== null) {
				const array = [];
				getConnectedPoints(b, array, {});
				setConductor(array, cond_a);
			} else if (cond_b !== null) {
				const array = [];
				getConnectedPoints(a, array, {});
				setConductor(array, cond_b);
			}
		}
		const wire = new Wire(a, b);
		this.wires.push(wire);
		return wire;
	}
	createHiddenWire(a, b) {
		const wire = this.createWire(a, b);
		if (wire === false) return false;
		arrayRemove(this.wires, wire);
		this.hiddenWires.push(wire);
		wire.hidden = true;
		return wire;
	}
	resetConductors(rootPoint) {
		resetConductors(rootPoint);
		return this;
	}
	getWire(a, b) {
		const {wires} = a;
		for (let i=wires.length; i--;) {
			const wire = wires[i];
			if (wire.other(a) === b) return wire;
		}
		return null;
	}
	getPointAt(x, y) {
		const {points} = this;
		for (let i=points.length; i;) {
			const point = points[--i];
			const [px, py] = point.coord;
			if (calcDistance(px, py, x, y) <= POINT_PICK_RADIUS) {
				return point;
			}
		}
		return null;
	}
	getInnerIOAt(x, y) {
		const {iopoints} = this;
		for (let i=iopoints.length; i;) {
			const point = iopoints[--i];
			const [px, py] = point.coord;
			if (calcDistance(px, py, x, y) <= POINT_PICK_RADIUS) {
				return point;
			}
		}
		return null;
	}
	getComponentAt(x, y) {
		const {pos} = this;
		pos.set(x, y);
		const {components} = this;
		for (let i=components.length; i;) {
			const item = components[--i];
			if (item.hits(pos)) {
				return item;
			}
		}
		return null;
	}
	getOuterIOAt(x, y) {
		const {components} = this;
		const coord = Coord();
		for (let i=components.length; i;) {
			const item = components[--i];
			const {outerPoints, transform} = item;
			for (let i=outerPoints.length; i;) {
				const point = outerPoints[--i];
				coord.set(0, 0);
				coord.apply(point.transform);
				coord.apply(transform);
				coord.round();
				const [px, py] = coord;
				if (calcDistance(px, py, x, y) <= POINT_PICK_RADIUS) {
					return point;
				}
			}
		}
		return null;
	}
	getWireAt(x, y) {
		const {wires, pos_a, pos_b} = this;
		for (let i=wires.length; i--;) {
			const wire = wires[i];
			const {a, b} = wire;
			const [ax, ay] = a.pos(pos_a);
			const [bx, by] = b.pos(pos_b);
			const d = lineDistance(x, y, ax, ay, bx, by);
			if (d <= WIRE_PICK_DIST) {
				return wire;
			}
		}
		return null;
	}
	getAt(x, y, {point, innerio, outerio, component, wire}) {
		if (point) {
			const item = this.getPointAt(x, y);
			if (item !== null) return item;
		}
		if (innerio) {
			const item = this.getInnerIOAt(x, y);
			if (item !== null) return item;
		}
		if (component) {
			const item = this.getComponentAt(x, y);
			if (item !== null) return item;
		}
		if (outerio) {
			const item = this.getOuterIOAt(x, y);
			if (item !== null) return item;
		}
		if (wire) {
			const item = this.getWireAt(x, y);
			if (item !== null) return item;
		}
		return null;
	}
	getPointsIn(ax, ay, bx, by, array) {
		const {points} = this;
		if (array === undefined) {
			array = [];
		}
		for (let i=points.length; i;) {
			const point = points[--i];
			const [x, y] = point.coord;
			if (x < ax) continue;
			if (y < ay) continue;
			if (x > bx) continue;
			if (y > by) continue;
			array.push(point);
		}
		return array;
	}
	getComponentsIn(ax, ay, bx, by, array) {
		const {components, pos_a, pos_b} = this;
		if (array === undefined) {
			array = [];
		}
		for (let i=components.length; i;) {
			const item = components[--i];
			item.getHitbox(pos_a, pos_b);
			const [x0, y0] = pos_a;
			const [x1, y1] = pos_b;
			if (x1 < ax) continue;
			if (y1 < ay) continue;
			if (x0 > bx) continue;
			if (y0 > by) continue;
			array.push(item);
		}
		return array;
	}
	getInnerIOPointsIn(ax, ay, bx, by, array) {
		const {iopoints} = this;
		if (array === undefined) {
			array = [];
		}
		for (let i=iopoints.length; i;) {
			const point = iopoints[--i];
			const [x, y] = point.coord;
			if (x < ax) continue;
			if (y < ay) continue;
			if (x > bx) continue;
			if (y > by) continue;
			array.push(point);
		}
		return array;
	}
	getIn(ax, ay, bx, by, {point, innerio, component}) {
		const array = [];
		if (component) {
			this.getComponentsIn(ax, ay, bx, by, array);
		}
		if (point) {
			this.getPointsIn(ax, ay, bx, by, array);
		}
		if (innerio) {
			this.getInnerIOPointsIn(ax, ay, bx, by, array);
		}
		return array;
	}
	pointExists(point) {
		return this.points.indexOf(point) !== -1;
	}
	removeWire(wire) {
		if (arrayRemove(this.wires, wire) === true) {
			wire.disconnect();
			const {a, b} = wire;
			resetConductors(a);
			resetConductors(b);
		}
		return this;
	}
	removeWireFast(wire) {
		if (arrayRemove(this.wires, wire) === true) {
			wire.disconnect();
			const {a, b} = wire;
		}
		return this;
	}
	removePoint(point) {
		if (arrayRemove(this.points, point) === true) {
			const neighbors = point.getNeighbors();
			const {wires} = point;
			while (wires.length !== 0) {
				this.removeWire(wires[0]);
			}
		}
		return this;
	}
	removeInnerIOPoint(point) {
		if (arrayRemove(this.iopoints, point) === true) {
			this.disconnectPoint(point);
		}
		return this;
	}
	removePointFast(point) {
		if (arrayRemove(this.points, point) === true) {
			const neighbors = point.getNeighbors();
			const {wires} = point;
			while (wires.length !== 0) {
				this.removeWireFast(wires[0]);
			}
		}
		return this;
	}
	removeComponent(item) {
		if (arrayRemove(this.components, item) === true) {
			const {outerPoints} = item;
			for (let i=outerPoints.length; i--;) {
				this.disconnectPoint(outerPoints[i]);
			}
		}
		return this;
	}
	remove(item) {
		if (item instanceof Component) {
			this.removeComponent(item);
		} else if (item instanceof Wire) {
			this.removeWire(item);
		} else if (item instanceof InnerIOPoint) {
			this.removeInnerIOPoint(item);
		} else if (item instanceof Point) {
			this.removePoint(item);
		}
		return this;
	}
	disconnectPoint(point) {
		const {wires} = point;
		for (let i=wires.length; i;) {
			this.removeWire(wires[--i]);
		}
		return this;
	}
	add(item) {
		const {iopoints, components} = this;
		if (item instanceof IOPoint) {
			pushUnique(iopoints, item);
		} else if (item instanceof Component) {
			pushUnique(components, item);
		}
		return this;
	}
	tic() {
		const {components} = this;
		for (let i=components.length; i--;) {
			components[i].readInputs();
		}
		for (let i=components.length; i--;) {
			components[i].tic();
		}
		return this;
	}
}