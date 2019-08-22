import { Coord, Transform } from '/js/transform-2d.js';
import { arrayRemove, calcDistance } from '/js/utils.js';
import { MIN_DRAG_DIST, GRID } from '/js/config.js';
import { Component, IOPoint } from '/js/circuit.js';
import { Point, Wire } from '/js/conduction.js';
import * as AtomicComponent from '/js/atomic-components.js';
import * as Shared from '/js/shared.js';
import * as Render from '/js/render.js';
import * as Encoder from '/js/encoder.js';

const ES_NONE = 0x1;
const ES_CLICKED = 0x2;
const ES_TRANSLATING_VIEW = 0x3;
const ES_SELECTING_SQUARE = 0x4;
const ES_WIRING = 0x5;
const ES_TRANSLATING_OBJECT = 0x6;
const selection = [];
const prev = Coord();
const history = [];
const keyHandlerMap = {};

let eventState = ES_NONE;
const keyEventToStr = (key, ctrl, shift) => {
	return `${key}-${ ctrl|0 }-${ shift|0 }`;
};
const addKeyHandler = (key, ctrl, shift, handler) => {
	const str = keyEventToStr(key, ctrl, shift);
	keyHandlerMap[str] = handler;
};
const triggerKey = (key, ctrl, shift, info) => {
	const str = keyEventToStr(key, ctrl, shift);
	const handler = keyHandlerMap[str];
	if (handler) {
		handler(info);
		return true;
	}
	return false;
};
const addToSelection = item => {
	if (item.selected === true) return;
	item.selected = true;
	selection.push(item);
};
const removeFromSelection = item => {
	if (item.selected === false) return;
	item.selected = false;
	arrayRemove(selection, item);
};
const remove = item => {
	if (item.selected === true) {
		removeFromSelection(item);
	}
	Shared.getCircuit().remove(item);
};
const toggleSelection = item => {
	if (item.selected === true) {
		removeFromSelection(item);
	} else {
		addToSelection(item);
	}
};
const clearSelection = () => {
	for (let i=selection.length; i--;) {
		selection[i].selected = false;
	}
	selection.length = 0;
};
const handleClick = mouseInfo => {
	const {button} = mouseInfo;
	if (button === 0) {
		let [x, y] = mouseInfo.pos1;
		const circuit = Shared.getCircuit();
		let item = circuit.getAt(x, y, {
			point: true,
			innerio: true,
			component: true,
			wire: true
		});
		if (item !== null) {
			if (mouseInfo.shift) {
				toggleSelection(item);
			} else {
				clearSelection();
				addToSelection(item);
			}
		} else if (!mouseInfo.shift) {
			clearSelection();
		}
	}
	Render.drawCircuit();
};
const removeDoubles = () => {
	const coordMap = {};
	const coord = Coord();
	const groups = [];
	const add = item => {
		const pos = item.pos(coord).join(',');
		const group = coordMap[pos] || (coordMap[pos]=[]);
		group.push(item);
		if (group.length === 2) {
			group.x = pos[0];
			group.y = pos[1];
			groups.push(group);
		}
	};
	const circuit = Shared.getCircuit();
	const {components, points, iopoints} = circuit;
	for (let i=components.length; i--;) {
		const {outerPoints} = components[i];
		for (let i=outerPoints.length; i--;) {
			add(outerPoints[i]);
		}
	}
	for (let i=points.length; i--;) {
		add(points[i]);
	}
	for (let i=iopoints.length; i--;) {
		add(iopoints[i]);
	}
	for (let i=groups.length; i--;) {
		const group = groups[i];
		const points = [];
		const iopoints = [];
		const neighbors = [];
		let rootPoint = null;
		for (let i=group.length; i--;) {
			const point = group[i];
			point.getNeighbors(neighbors);
			if (point instanceof IOPoint) {
				rootPoint = point;
				neighbors.push(point);
				circuit.disconnectPoint(point);
			} else {
				points.push(point);
			}
		}
		for (let i=points.length; i--;) {
			if (i !== 0 || rootPoint !== null) {
				remove(points[i]);
			} else {
				rootPoint = points[0];
				circuit.disconnectPoint(rootPoint);
			}
		}
		const idMap = {};
		for (let i=neighbors.length; i--;) {
			const point = neighbors[i];
			const {id} = point;
			if (idMap[id] === true) {
				continue;
			}
			idMap[id] = true;
			if (circuit.pointExists(point) === true && point !== rootPoint) {
				circuit.createWire(point, rootPoint);
			}
		}
	}
};
const trim = () => {
	const circuit = Shared.getCircuit();
	const {points} = circuit;
	const array = [];
	for (let i=points.length; i--;) {
		const point = points[i];
		const {wires} = point;
		if (wires.length < 2) {
			array.push(point);
		}
	}
	for (let i=array.length; i--;) {
		remove(array[i]);
	}
};
export const handleMousedown = mouseInfo => {
	eventState = ES_CLICKED;
};
export const handleMousemove = mouseInfo => {
	const {scrPos0, scrPos1} = mouseInfo;
	if (eventState === ES_CLICKED) {
		const [ax, ay] = scrPos0;
		const [bx, by] = scrPos1;
		if (calcDistance(ax, ay, bx, by) >= MIN_DRAG_DIST) {
			eventState = ES_NONE;
			const {button} = mouseInfo;
			if (button === 0) {
				if (mouseInfo.shift) {
					eventState = ES_SELECTING_SQUARE;
				} else if (mouseInfo.ctrl) {
					eventState = ES_TRANSLATING_VIEW;
				} else {
					const [x, y] = mouseInfo.pos0;
					const circuit = Shared.getCircuit();
					let obj = circuit.getAt(x, y, {
						point: true,
						component: true
					});
					if (obj !== null) {
						mouseInfo.obj = obj;
						eventState = ES_TRANSLATING_OBJECT;
						const rx = Math.round(x/GRID)*GRID;
						const ry = Math.round(y/GRID)*GRID;
						prev.set(rx, ry);
					} else {
						eventState = ES_TRANSLATING_VIEW;
					}
				}
			} else if (button === 1) {
				eventState = ES_TRANSLATING_VIEW;
			} else if (button === 2) {
				const circuit = Shared.getCircuit();
				let [ax, ay] = mouseInfo.pos0;
				let [bx, by] = mouseInfo.pos1;
				ax = Math.round(ax/GRID)*GRID;
				ay = Math.round(ay/GRID)*GRID;
				bx = Math.round(bx/GRID)*GRID;
				by = Math.round(by/GRID)*GRID;
				const a = circuit.getAt(ax, ay, {
					point: true,
					innerio: true,
					outerio: true,
				}) || circuit.createPoint(ax, ay);
				const b = circuit.createPoint(ax, ay);
				mouseInfo.point_a = a;
				mouseInfo.point_b = b;
				circuit.createWire(a, b);
				eventState = ES_WIRING;
			}
		}
	}
	if (eventState === ES_CLICKED || eventState === ES_NONE) return;
	if (eventState === ES_TRANSLATING_VIEW) {
		const {zoom} = mouseInfo;
		const dx = scrPos1[0] - scrPos0[0];
		const dy = scrPos1[1] - scrPos0[1];
		Render.setZoom(zoom);
		Render.translateView(dx, dy);
	} else if (eventState === ES_SELECTING_SQUARE) {
		const {pos0, pos1} = mouseInfo;
		const [ax, ay] = pos0;
		const [bx, by] = pos1;
		const sx = Math.abs(bx - ax);
		const sy = Math.abs(by - ay);
		const x = Math.min(ax, bx);
		const y = Math.min(ay, by);
		Shared.setSelectionSquare(x, y, sx, sy);
	} else if (eventState === ES_WIRING) {
		const {pos1, point_b} = mouseInfo;
		let [x, y] = pos1;
		x = Math.round(x/GRID)*GRID;
		y = Math.round(y/GRID)*GRID;
		point_b.moveTo(x, y);
	} else if (eventState === ES_TRANSLATING_OBJECT) {
		const {pos1, obj} = mouseInfo;
		let [ax, ay] = prev;
		let [bx, by] = pos1;
		bx = Math.round(bx/GRID)*GRID;
		by = Math.round(by/GRID)*GRID;
		let dx = bx - ax;
		let dy = by - ay;
		if (obj.selected === true && selection.length > 1) {
			for (let i=selection.length; i--;) {
				const item = selection[i];
				if ((item instanceof Point) || (item instanceof Component)) {
					item.translate(dx, dy);
				}
			}
		} else if ((obj instanceof Point) || (obj instanceof Component)) {
			obj.translate(dx, dy);
		}
		prev.set(bx, by);
	}
	Render.drawCircuit();
};
export const handleMouseup = mouseInfo => {
	if (eventState === ES_CLICKED) {
		handleClick(mouseInfo);
	} else if (eventState === ES_SELECTING_SQUARE) {
		const circuit = Shared.getCircuit();
		const {x, y, sx, sy} = Shared.getSelectionSquare();
		const points = circuit.getPointsIn(x, y, x + sx, y + sy);
		const components = circuit.getComponentsIn(x, y, x + sx, y + sy);
		if (mouseInfo.ctrl === true) {
			for (let i=points.length; i--;) {
				removeFromSelection(points[i]);
			}
			for (let i=components.length; i--;) {
				removeFromSelection(components[i]);
			}
		} else {
			for (let i=points.length; i--;) {
				addToSelection(points[i]);
			}
			for (let i=components.length; i--;) {
				addToSelection(components[i]);
			}
		}
		Shared.setSelectionSquare(null, null, null, null);
		Render.drawCircuit();
	} else if (eventState === ES_WIRING) {
		const {point_a, point_b, pos1} = mouseInfo;
		const circuit = Shared.getCircuit();
		let [x, y] = pos1;
		x = Math.round(x/GRID)*GRID;
		y = Math.round(y/GRID)*GRID;
		remove(point_b);
		let point = circuit.getAt(x, y, {
			point: true,
			outerio: true,
			innerio: true
		}) || circuit.createPoint(x, y);
		const wire = circuit.getWire(point_a, point);
		if (wire === null && point_a !== point) {
			circuit.createWire(point_a, point);
		}
		removeDoubles();
		Render.drawCircuit();
	} else if (eventState === ES_TRANSLATING_OBJECT) {
		removeDoubles();
		Render.drawCircuit();	
	}
};
export const handleScroll = mouseInfo => {
	const {x, y, sx, sy} = Shared.getViewport();
	const [mx, my] = mouseInfo.scrPos1;
	const dx = mx - (x + sx/2);
	const dy = my - (y + sy/2);
	Render.translateView(-dx, -dy);
	Render.scaleView(1 - mouseInfo.scroll*0.03);
	Render.translateView(dx, dy);
	Render.drawCircuit();
};
import { NotGate, OrGate, AndGate, XorGate } from '/js/atomic-components.js';
export const handleDblclick = mouseInfo => {
	const gate = new [NotGate, OrGate, AndGate, XorGate][Math.floor(Math.random()*4)];
	let [x, y] = mouseInfo.pos1;
	x = Math.round(x/GRID)*GRID;
	y = Math.round(y/GRID)*GRID;
	gate.translate(x, y);
	Shared.getCircuit().add(gate);
	Render.drawCircuit();
};
export const handleKeydown = e => {
	const key = e.key.toLowerCase().replace('arrow', '');
	const ctrl = e.ctrlKey;
	const shift = e.shiftKey;
	if (triggerKey(key, ctrl, shift)) {
		e.preventDefault();
		e.stopPropagation();
	}
};
addKeyHandler('delete', 0, 0, () => {
	const circuit = Shared.getCircuit();
	for (let i=selection.length; i--;) {
		const item = selection[i];
		remove(item);
	}
	Render.drawCircuit();
});
addKeyHandler('d', 1, 0, () => {
	const oldToNew = {};
	const newToOld = {};
	const array = [];
	const circuit = Shared.getCircuit();
	for (let i=selection.length; i--;) {
		const item = selection[i];
		if (item instanceof Component) {
			const n = item.clone();
			if (n) {
				circuit.add(n);
				newToOld[n.id] = item;
				oldToNew[item.id] = n;
				array.push(n);
			}
		}
	}
	clearSelection();
	for (let i=array.length; i;) {
		addToSelection(array[--i]);
	}
	Render.drawCircuit();
});
addKeyHandler('s', 1, 0, () => {
	const circuit = Shared.getCircuit();
	console.log(Encoder.encodeCircuit(circuit));
});
addKeyHandler('d', 0, 0, () => {
	removeDoubles();
	Render.drawCircuit();
});
addKeyHandler('t', 0, 0, () => {
	trim();
	Render.drawCircuit();
});
addKeyHandler('r', 1, 0, () => {
	if (selection.length === 1) {
		const item = selection[0];
		if (item instanceof Component) {
			const coord = Coord();
			const [x, y] = item.pos(coord);
			item.translate(-x, -y);
			item.rotate(Math.PI/2);
			item.translate(x, y);
			Render.drawCircuit();
		}
	}
});