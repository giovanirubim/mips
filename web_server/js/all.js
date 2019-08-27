import {
	Conductor,
	Point,
	Wire
} from '/js/conduction.js';
import {
	IOPoint,
	InnerIOPoint,
	OuterIOPoint,
	Component
} from '/js/circuit.js';
import * as Drawings from '/js/drawings.js';

export class NotGate extends Component {
	constructor() {
		super();
		this.hitbox = [-15, -10, 15, 10];

		const workspace = new Uint32Array(2);
		const {buffer} = workspace;
		this.workspace = workspace;

		this.addIO(-20, 0, 'input', 'input');
		const output = this.addIO(20, 0, 'output', new Conductor(32, buffer, 1));
		output.conductor[0] = ~0;

		this.draw = Drawings.notGate;
	}
	clone() {
		const item = new NotGate();
		item.transform.set(this.transform);
		return item;
	}
	readInputs() {
		const {input, workspace} = this;
		const val = input[0];
		let inputChanged = 0;
		if (workspace[0] !== val) {
			inputChanged = 1;
			workspace[0] = val;
		}
		return this.inputChanged = inputChanged;
	}
	tic() {
		if (this.inputChanged === 0) return 0;
		const {workspace} = this;
		workspace[1] = ~workspace[0];
		return 0;
	}
}

export class XorGate extends Component {
	constructor() {
		super();
		this.hitbox = [-15, -20, 35, 20];

		const workspace = new Uint32Array(3);
		const {buffer} = workspace;
		this.workspace = workspace;

		this.addIO(-20, -20, 'input', 'input0');
		this.addIO(-20, +20, 'input', 'input1');
		const output = this.addIO(40, 0, 'output', new Conductor(32, buffer, 2));

		this.draw = Drawings.xorGate;
	}
	clone() {
		const item = new XorGate();
		item.transform.set(this.transform);
		return item;
	}
	readInputs() {
		const {input0, input1, workspace} = this;
		const val0 = input0[0];
		const val1 = input1[0];
		let inputChanged = 0;
		inputChanged |= val0 !== workspace[0];
		inputChanged |= val1 !== workspace[1];
		workspace[0] = val0;
		workspace[1] = val1;
		// console.log(inputChanged);
		return this.inputChanged = inputChanged;
	}
	tic() {
		if (this.inputChanged === 0) return 0;
		const {workspace} = this;
		workspace[2] = workspace[0] ^ workspace[1];
		return 0;
	}
}

export class AndGate extends Component {
	constructor() {
		super();
		this.hitbox = [-15, -20, 35, 20];

		const workspace = new Uint32Array(3);
		const {buffer} = workspace;
		this.workspace = workspace;

		this.addIO(-20, -20, 'input', 'input0');
		this.addIO(-20, +20, 'input', 'input1');
		const output = this.addIO(40, 0, 'output', new Conductor(32, buffer, 2));

		this.draw = Drawings.andGate;
	}
	clone() {
		const item = new AndGate();
		item.transform.set(this.transform);
		return item;
	}
	readInputs() {
		const {input0, input1, workspace} = this;
		const val0 = input0[0];
		const val1 = input1[0];
		let inputChanged = 0;
		inputChanged |= val0 !== workspace[0];
		inputChanged |= val1 !== workspace[1];
		workspace[0] = val0;
		workspace[1] = val1;
		return this.inputChanged = inputChanged;
	}
	tic() {
		if (this.inputChanged === 0) return 0;
		const {workspace} = this;
		workspace[2] = workspace[0] & workspace[1];
		return 0;
	}
}

export class NandGate extends Component {
	constructor() {
		super();
		this.hitbox = [-15, -20, 35, 20];

		const workspace = new Uint32Array(3);
		const {buffer} = workspace;
		this.workspace = workspace;

		this.addIO(-20, -20, 'input', 'input0');
		this.addIO(-20, +20, 'input', 'input1');
		const output = this.addIO(40, 0, 'output', new Conductor(32, buffer, 2));
		output.conductor[0] = ~0;

		this.draw = Drawings.nandGate;
	}
	clone() {
		const item = new NandGate();
		item.transform.set(this.transform);
		return item;
	}
	readInputs() {
		const {input0, input1, workspace} = this;
		const val0 = input0[0];
		const val1 = input1[0];
		let inputChanged = 0;
		inputChanged |= val0 !== workspace[0];
		inputChanged |= val1 !== workspace[1];
		workspace[0] = val0;
		workspace[1] = val1;
		return this.inputChanged = inputChanged;
	}
	tic() {
		if (this.inputChanged === 0) return 0;
		const {workspace} = this;
		workspace[2] = ~(workspace[0] & workspace[1]);
		return 0;
	}
}

export class OrGate extends Component {
	constructor() {
		super();
		this.hitbox = [-15, -20, 35, 20];

		const workspace = new Uint32Array(3);
		const {buffer} = workspace;
		this.workspace = workspace;

		this.addIO(-20, -20, 'input', 'input0');
		this.addIO(-20, +20, 'input', 'input1');
		const output = this.addIO(40, 0, 'output', new Conductor(32, buffer, 2));

		this.draw = Drawings.orGate;
	}
	clone() {
		const item = new OrGate();
		item.transform.set(this.transform);
		return item;
	}
	readInputs() {
		const {input0, input1, workspace} = this;
		const val0 = input0[0];
		const val1 = input1[0];
		let inputChanged = 0;
		inputChanged |= val0 !== workspace[0];
		inputChanged |= val1 !== workspace[1];
		workspace[0] = val0;
		workspace[1] = val1;
		return this.inputChanged = inputChanged;
	}
	tic() {
		if (this.inputChanged === 0) return 0;
		const {workspace} = this;
		workspace[2] = workspace[0] | workspace[1];
		return 0;
	}
}import { Coord, Transform } from '/js/transform-2d.js'
import { Conductor, Point, Wire } from '/js/conduction.js'
import { arrayRemove, pushUnique, calcDistance, lineDistance } from '/js/utils.js';
import {
	POINT_PICK_RADIUS,
	WIRE_PICK_DIST
} from '/js/config.js'

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
	constructor(component) {
		this.component = component;
		this.wires = [];
		this.points = [];
		this.iopoints = [];
		this.components = [];

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

	// Função para ser usada apenas na criação automática de componentes, pois é possível assegurar
	// que os condutores serão atualizados posteriormente. Não deve ser usada em ações originadas
	// pelo usuário.
	createWireFast(a, b) {
		const wire = new Wire(a, b);
		this.wires.push(wire);
		return wire;
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
		return this.createWireFast(a, b);
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
			const neighbors = point.getNeighbors();
			const {wires} = point;
			while (wires.length !== 0) {
				this.removeWire(wires[0]);
			}
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
				const {wires} = outerPoints[i];
				while (wires.length) {
					this.removeWire(wires[0]);
				}
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

export class Component {
	constructor() {
		this.id = Symbol();
		this.transform = Transform();
		this.outerPoints = [];
		this.inputChanged = 0;
		this.stateChanged = 0;
		this.hitbox = null;
		this.args = '';

		// Auxiliares
		this.pos_a = Coord();
		this.pos_b = Coord();
	}
	addIO(x, y, type, third) {
		const point = new OuterIOPoint(type, this, third);
		if (point.attrName) {
			this[point.attrName] = new Conductor(32);
		}
		point.component = this;
		point.translate(x, y);
		this.outerPoints.push(point);
		return point;
	}
	pos(coord) {
		const {transform} = this;
		coord[0] = transform[4];
		coord[1] = transform[5];
		return coord;
	}
	translate(x, y) {
		this.transform.translate(x, y);
		return this;
	}
	rotate(ang) {
		this.transform.rotate(ang);
		return this;
	}
	hits(coord) {
		const {pos_a, pos_b} = this;
		this.getHitbox(pos_a, pos_b);
		const [x, y] = coord;
		const [ax, ay] = pos_a;
		const [bx, by] = pos_b;
		if (x < ax) return false;
		if (y < ay) return false;
		if (x > bx) return false;
		if (y > by) return false;
		return true;
	}
	getHitbox(a, b) {
		const {transform} = this;
		const [ax, ay, bx, by] = this.hitbox;
		const [x0, y0] = a.set(ax, ay).apply(transform);
		const [x1, y1] = b.set(bx, by).apply(transform);
		const x = Math.min(x0, x1);
		const y = Math.min(y0, y1);
		const sx = Math.abs(x0 - x1);
		const sy = Math.abs(y0 - y1);
		a.set(x, y);
		b.set(x + sx, y + sy);
		return this;
	}
	readInputs() { return 0; }
	tic() { return 0; }
}

export class ComposedComponent extends Component {
	constructor() {
		super();
		this.circuit = new Circuit();

		// Componentes do circuito interno conectados a ao menos um InnerIOPoint do tipo input
		this.inputLayer = [];

		// Componentes do circuito interno não contidos no vetor inputLayer
		this.nonInput = [];

		this.inputChanged = 0;

		// Indica que algum componente interno teve sua entrada ou estado interno alterado no último
		// ciclo. Inicia em 1 para forçar a inicialização de todos os componentes internos
		this.stateChanged = 1;

		// Elementos que devem ser atualizados no ciclo atual
		// Um ciclo se inicia com a chamada do "readInputs" e termina ao final da chamada do "tic"
		this.buffer = [];
		this.bufferLength = 0;
	}
	readInputs() {
		let inputChanged = 0, n = 0;
		const {inputLayer, buffer} = this;

		// Faz a leitura de entrada dos componentes internos que estão na camada de entrada
		// (inputLayer) e envia ao buffer os que possuem alguma alteração
		for (let i=inputLayer.length; i--;) {
			const item = inputLayer[i];
			inputChanged |= item.readInputs();
			if (item.inputChanged === 1 || item.stateChanged === 1) {
				buffer[n++] = item;
			}
		}

		// Por questões de eficiência é armazenada a quantidade de objetos a serem atualizados no
		// buffer ao envés de redimensioná-lo
		this.bufferLength = n;
		return this.inputChanged = inputChanged;
	}
	tic() {

		let {inputChanged, stateChanged} = this;

		// Nada a atualizar
		if (inputChanged === 0 && stateChanged === 0) return 0;

		const {nonInput, buffer} = this;
		let n = this.bufferLength;

		// Leitura das entradas dos componentes restantes
		for (let i = nonInput.length; i--;) {
			const item = nonInput[i];
			item.readInputs();
			if (item.inputChanged === 1 || item.stateChanged === 1) {
				buffer[n++] = item;
			}
		}

		// Tic de todos os componentes
		for (let i=n; i--;) {
			buffer[i].tic();
		}

		// Como houve alguma alteração é considerado que seu estado interno mudou
		this.stateChanged = 1;
	}
}import { Coord, Transform } from '/js/transform-2d.js';
import { arrayRemove, pushUnique } from '/js/utils.js';

export class Conductor extends Uint32Array {
	constructor(bitLength, buffer, index) {
		if (buffer !== undefined) {
			super(buffer, index << 2, 1);
		} else {
			super(1);
		}
		this.bitLength = bitLength;
	}
}

window.Conductor = Conductor;
export class Point {
	constructor() {
		this.id = Symbol();
		this.coord = Coord();
		this.conductor = null;
		this.isSource = 0;
		this.wires = [];
	}
	translate(x, y) {
		this.coord.translate(x, y);
		return this;
	}
	moveTo(x, y) {
		this.coord.set(x, y);
		return this;
	}
	pos(coord) {
		return coord.set(this.coord);
	}
	val() {
		const {conductor} = this;
		return conductor === null ? null : conductor[0];
	}
	getNeighbors(array) {
		const {wires} = this;
		if (array === undefined) {
			array = [];
		}
		for (let i=wires.length; i--;) {
			array.push(wires[i].other(this));
		}
		return array;
	}
	setConductor(conductor) {
		this.conductor = conductor;
		return this;
	}
}

export class Wire {
	constructor(a, b) {
		this.id = Symbol();
		this.a = a;
		this.b = b;
		pushUnique(a.wires, this);
		pushUnique(b.wires, this);
	}
	other(point) {
		const {a, b} = this;
		return point === a ? b : a;
	}
	disconnect() {
		arrayRemove(this.a.wires, this);
		arrayRemove(this.b.wires, this);
		return this;
	}
}export const POINT_RADIUS = 3;
export const POINT_PICK_RADIUS = 6;
export const IO_POINT_RADIUS = 5;
export const WIRE_PICK_DIST = 3;
export const WIRE_WIDTH = 2;
export const MIN_DRAG_DIST = 10;
export const GRID = 20;
export const GRID_WIDTH = 1;
export const BACKGROUND_COLOR = '#000';
export const GRID_COLOR = '#111';
export const SELECTION_SQUARE_BORDER_WIDTH = 1;
export const SELECTION_SQUARE_BORDER_COLOR = '#07f';
export const SELECTION_SQUARE_COLOR = 'rgba(0, 119, 255, 0.2)';
export const SELECTED_FILL_COLOR = '#37a';
export const SELECTED_STROKE_COLOR = '#7bf';
export const COMPONENT_LINE_COLOR = '#ddd';
export const COMPONENT_COLOR = '#333';
export const CURSOR_COLOR = 'rgba(255, 255, 255, 0.25)';
export const ANIMATION_ROTATION_DURATION = 150;
export const COMPONENT_LINE_WIDTH = 2;import { Coord, Transform } from '/js/transform-2d.js';
import { arrayRemove, calcDistance } from '/js/utils.js';
import {
	MIN_DRAG_DIST,
	GRID,
	ANIMATION_ROTATION_DURATION
} from '/js/config.js';
import { Point, Wire } from '/js/conduction.js';
import {
	Component,
	IOPoint,
	InnerIOPoint
} from '/js/circuit.js';
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
const ES_ROTATING_VIEW = 0x7;
const selection = [];
const prev = Coord();
const history = [];
const keyHandlerMap = {};

let eventState = ES_NONE;
const setEvent = code => {
	// switch (code) {
	// 	case 0x1: console.log('NONE'); break;
	// 	case 0x2: console.log('CLICKED'); break;
	// 	case 0x3: console.log('TRANSLATING_VIEW'); break;
	// 	case 0x4: console.log('SELECTING_SQUARE'); break;
	// 	case 0x5: console.log('WIRING'); break;
	// 	case 0x6: console.log('TRANSLATING_OBJECT'); break;
	// }
	eventState = code;
};
const eventEnded = () => {
	setEvent(ES_NONE);
};
const recordAction = action => {
	history.push(action);
};
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
		Render.drawCircuit();
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
	if (eventState !== ES_NONE) return;
	setEvent(ES_CLICKED);
};
export const handleMousemove = mouseInfo => {
	const {scrPos0, scrPos1} = mouseInfo;
	if (eventState === ES_CLICKED) {
		const [ax, ay] = scrPos0;
		const [bx, by] = scrPos1;
		if (calcDistance(ax, ay, bx, by) >= MIN_DRAG_DIST) {
			const {button} = mouseInfo;
			if (button === 0) {
				if (mouseInfo.shift) {
					setEvent(ES_SELECTING_SQUARE);
				} else if (mouseInfo.ctrl) {
					setEvent(ES_TRANSLATING_VIEW);
				} else {
					const [x, y] = mouseInfo.pos0;
					const circuit = Shared.getCircuit();
					let obj = circuit.getAt(x, y, {
						point: true,
						innerio: true,
						component: true
					});
					if (obj !== null) {
						mouseInfo.obj = obj;
						setEvent(ES_TRANSLATING_OBJECT);
						const rx = Math.round(x/GRID)*GRID;
						const ry = Math.round(y/GRID)*GRID;
						prev.set(rx, ry);
					} else {
						setEvent(ES_TRANSLATING_VIEW);
					}
				}
			} else if (button === 1) {
				setEvent(ES_TRANSLATING_VIEW);
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
				setEvent(ES_WIRING);
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
		const points = circuit.getIn(x, y, x + sx, y + sy, {
			point: true,
			innerio: true
		});
		const components = circuit.getIn(x, y, x + sx, y + sy, {
			component: true
		});
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
	eventEnded();
};
let animation = null;
const animateRotation = mouseInfo => {
	let zoom = mouseInfo.zoom.clone();
	const ini = new Date();
	const ang = mouseInfo.scroll < 0 ? Math.PI*0.5 : - Math.PI*0.5;
	animation = setInterval(() => {
		let t = (new Date() - ini)/ANIMATION_ROTATION_DURATION;
		if (t >= 1) {
			t = 1;
		} else {
			t = (1 - Math.cos(t*Math.PI))*0.5;
		}
		Render.setZoom(zoom);
		Render.rotateView(t*ang);
		Render.drawCircuit();
		if (t === 1) {
			clearInterval(animation);
			animation = null;
			eventEnded();
		}
	}, 0);
};
export const handleScroll = mouseInfo => {
	if (eventState !== ES_NONE) return;
	if (mouseInfo.ctrl === true && mouseInfo.shift === true) {
		setEvent(ES_ROTATING_VIEW)
		animateRotation(mouseInfo);
	} else {
		const {x, y, sx, sy} = Shared.getViewport();
		const [mx, my] = mouseInfo.scrPos1;
		const dx = mx - (x + sx/2);
		const dy = my - (y + sy/2);
		Render.translateView(-dx, -dy);
		Render.scaleView(1 - mouseInfo.scroll*0.03);
		Render.translateView(dx, dy);
		Render.drawCircuit();
	}
};
import { NandGate } from '/js/atomic-components.js';
export const handleDblclick = mouseInfo => {
	if (eventState !== ES_NONE) return;
	let [x, y] = mouseInfo.pos1;
	x = Math.round(x/GRID)*GRID;
	y = Math.round(y/GRID)*GRID;
	Shared.setCursor(x, y);
	Render.drawCircuit();
};
export const handleKeydown = e => {
	if (eventState !== ES_NONE) return;
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
});
addKeyHandler('s', 1, 0, () => {
	const circuit = Shared.getCircuit();
	let code = Encoder.encodeCircuit(circuit);
	console.clear();
	console.log(code);
});
addKeyHandler('d', 0, 0, () => {
	removeDoubles();
});
addKeyHandler('t', 0, 0, () => {
	trim();
});
addKeyHandler('i', 0, 0, () => {
	const point = new InnerIOPoint('input');
	const [x, y] = Shared.getCursor();
	point.translate(x, y);
	Shared.getCircuit().add(point);
	Render.drawCircuit();
});
addKeyHandler('o', 0, 0, () => {
	const point = new InnerIOPoint('output');
	const [x, y] = Shared.getCursor();
	point.translate(x, y);
	Shared.getCircuit().add(point);
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
			item.transform.round();
		}
	}
});
addKeyHandler('a', 1, 0, () => {
	const circuit = Shared.getCircuit();
	const {points, iopoints, components} = circuit;
	for (let i=points.length; i;) {
		addToSelection(points[--i]);
	}
	for (let i=iopoints.length; i;) {
		addToSelection(iopoints[--i]);
	}
	for (let i=components.length; i;) {
		addToSelection(components[--i]);
	}
});
addKeyHandler('a', 0, 0, () => {
	const circuit = Shared.getCircuit();
	const gate = new NandGate();
	const [x, y] = Shared.getCursor();
	gate.translate(x, y);
	circuit.add(gate);
	addToSelection(gate);
});
addKeyHandler('left', 0, 0, () => {
	for (let i=selection.length; i--;) {
		const item = selection[i];
		if (!(item instanceof Wire)) {
			item.translate(-GRID, 0);
		}
	}
});
addKeyHandler('right', 0, 0, () => {
	for (let i=selection.length; i--;) {
		const item = selection[i];
		if (!(item instanceof Wire)) {
			item.translate(+GRID, 0);
		}
	}
});
addKeyHandler('up', 0, 0, () => {
	for (let i=selection.length; i--;) {
		const item = selection[i];
		if (!(item instanceof Wire)) {
			item.translate(0, -GRID);
		}
	}
});
addKeyHandler('down', 0, 0, () => {
	for (let i=selection.length; i--;) {
		const item = selection[i];
		if (!(item instanceof Wire)) {
			item.translate(0, +GRID);
		}
	}
});
addKeyHandler('escape', 0, 0, () => {
	clearSelection();
});import {
	SELECTED_FILL_COLOR,
	SELECTED_STROKE_COLOR,
	COMPONENT_LINE_COLOR,
	COMPONENT_COLOR
} from '/js/config.js';

class Drawing {
	constructor() {
		this.idMap = {};
		this.array = [];
	}
	point(id, x, y) {
		this.idMap[id] = {x, y, point: true};
		return this;
	}
	copy(src, dst, dx, dy) {
		const {idMap} = this;
		const {x, y} = idMap[src];
		idMap[dst] = {
			x: x + (dx || 0),
			y: y + (dy || 0),
			point: true
		};
		return this;
	}
	val(id, value) {
		this.idMap[id] = {value};
		return this;
	}
	mirror(src, dst, axis) {
		const {idMap} = this;
		const point = idMap[dst] = {...idMap[src]};
		point[axis] *= -1;
		return this;
	}
	begin() {
		this.array.push({type: 'begin'});
		return this;
	}
	move(id) {
		const {idMap, array} = this;
		this.array.push({
			type: 'move',
			point: idMap[id]
		});
		return this;
	}
	line(id) {
		const {idMap, array} = this;
		this.array.push({
			type: 'line',
			point: idMap[id]
		});
		return this;
	}
	close(id) {
		const {idMap, array} = this;
		this.array.push({
			type: 'close',
			point: idMap[id]
		});
		return this;
	}
	bezier(a, b, c) {
		const {idMap, array} = this;
		this.array.push({
			type: 'bezier',
			a: idMap[a],
			b: idMap[b],
			c: idMap[c]
		});
		return this;
	}
	arc(center, rad, a, b) {
		a *= Math.PI*2;
		b *= Math.PI*2;
		const {idMap, array} = this;
		this.array.push({
			type: 'arc',
			center: idMap[center],
			rad: idMap[rad],
			a, b
		});
		return this;
	}
	fill() {
		this.array.push({type: 'fill'});
		return this;
	}
	stroke() {
		this.array.push({type: 'stroke'});
		return this;
	}
	fcolor(color) {
		this.array.push({
			type: 'fcolor',
			color
		});
		return this;
	}
	scolor(color) {
		this.array.push({
			type: 'scolor',
			color
		});
		return this;
	}
	scale(value) {
		const {idMap} = this;
		for (let id in idMap) {
			const point = idMap[id];
			point.x *= value;
			point.y *= value;
			point.value *= value;
		}
		return this;
	}
	translate(x, y) {
		const {idMap} = this;
		for (let id in idMap) {
			const point = idMap[id];
			point.x += x;
			point.y += y;
		}
		return this;
	}
	inspect(ctx) {
		ctx.fillStyle = '#037';
		ctx.strokeStyle = '#fff';
		this.array.forEach(item => {
			const {type} = item;
			if (type === 'move') {
				const {x, y} = item.point;
				ctx.moveTo(x, y);
			} else if (type === 'line') {
				const {x, y} = item.point;
				ctx.lineTo(x, y);
			} else if (type === 'bezier') {
				const {a, b, c} = item;
				ctx.bezierCurveTo(a.x, a.y, b.x, b.y, c.x, c.y);
			} else if (type === 'arc') {
				const {center, rad, a, b} = item;
				ctx.arc(center.x, center.y, rad.value, a, b);
			} else if (type === 'begin') {
				ctx.beginPath();
			} else if (type === 'close') {
				ctx.closePath();
			} else if (type === 'fill') {
				ctx.fill();
			} else if (type === 'stroke') {
				ctx.stroke();
			}
		});
		const {idMap} = this;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		for (let id in idMap) {
			const point = idMap[id];
			const {x, y} = point;
			ctx.fillStyle = '#f70';
			ctx.beginPath();
			ctx.arc(x, y, 3, 0, Math.PI*2);
			ctx.fill();
			ctx.fillStyle = '#fff';
			ctx.fillText(id, x, y - 6);
		}
		return this;
	}
	draw(ctx) {
		this.array.forEach(item => {
			const {type} = item;
			if (type === 'move') {
				const {x, y} = item.point;
				ctx.moveTo(x, y);
			} else if (type === 'line') {
				const {x, y} = item.point;
				ctx.lineTo(x, y);
			} else if (type === 'bezier') {
				const {a, b, c} = item;
				ctx.bezierCurveTo(a.x, a.y, b.x, b.y, c.x, c.y);
			} else if (type === 'arc') {
				const {center, rad, a, b} = item;
				ctx.arc(center.x, center.y, rad.value, a, b);
			} else if (type === 'begin') {
				ctx.beginPath();
			} else if (type === 'close') {
				ctx.closePath();
			} else if (type === 'fill') {
				ctx.fill();
			} else if (type === 'stroke') {
				ctx.stroke();
			} else if (type === 'fcolor') {
				ctx.fillStyle = item.color;
			} else if (type === 'scolor') {
				ctx.strokeStyle = item.color;
			}
		});
		return this;
	}
	code() {
		let code = '';
		const {idMap} = this;
		const rnd = x => Math.round(x*2)/2;
		this.array.forEach(item => {
			const {type} = item;
			if (type === 'move') {
				const {x, y} = item.point;
				code += `ctx.moveTo(${ rnd(x) }, ${ rnd(y) });\n`;
			} else if (type === 'line') {
				const {x, y} = item.point;
				code += `ctx.lineTo(${ rnd(x) }, ${ rnd(y) });\n`;
			} else if (type === 'bezier') {
				const {a, b, c} = item;
				code += `ctx.bezierCurveTo(${
					rnd(a.x) }, ${ rnd(a.y)
				}, ${
					rnd(b.x) }, ${ rnd(b.y)
				}, ${
					rnd(c.x) }, ${ rnd(c.y)
				});\n`;
			} else if (type === 'arc') {
				const {center, rad, a, b} = item;
				const x = rnd(center.x);
				const y = rnd(center.y);
				code += `ctx.arc(${x}, ${y}, ${rnd(rad.value)}, ${a}, ${b});\n`;
			} else if (type === 'begin') {
				code += 'ctx.beginPath();\n'
			} else if (type === 'close') {
				code += 'ctx.closePath();\n';
			} else if (type === 'fill') {
				code += 'ctx.fill();\n';
			} else if (type === 'stroke') {
				code += 'ctx.stroke();\n';
			} else if (type === 'fcolor') {
				code += `ctx.fillStyle = ${item.color};\n`;
			} else if (type === 'scolor') {
				code += `ctx.strokeStyle = ${item.color};\n`;
			}
		});
		return code;
	}
}
export const notGate = (ctx, item) => {
	if (item.selected) {
		ctx.strokeStyle = SELECTED_STROKE_COLOR;
		ctx.fillStyle = SELECTED_FILL_COLOR;
	} else {
		ctx.strokeStyle = COMPONENT_LINE_COLOR;
		ctx.fillStyle = COMPONENT_COLOR;
	}
	// new Drawing()
	// 	.point('a', -100, -80)
	// 	.point('b', 80, 0)
	// 	.mirror('a', 'c', 'y')
	// 	.point('d', 120, 0)
	// 	.val('rad', 40)
	// 	.begin()
	// 	.arc('d', 'rad', 0.5, 1.5)
	// 	.move('a')
	// 	.line('b')
	// 	.line('c')
	// 	.close()
	// 	.fill()
	// 	.stroke()
	// 	.translate(-30, 0)
	// 	.scale(0.11);
	ctx.beginPath();
	ctx.arc(10, 0, 4.5, 3.141592653589793, 9.42477796076938);
	ctx.moveTo(-14.5, -9);
	ctx.lineTo(5.5, 0);
	ctx.lineTo(-14.5, 9);
	ctx.closePath();
	ctx.fill();
	ctx.stroke();
};
export const xorGate = (ctx, item) => {
	if (item.selected) {
		ctx.strokeStyle = SELECTED_STROKE_COLOR;
		ctx.fillStyle = SELECTED_FILL_COLOR;
	} else {
		ctx.strokeStyle = COMPONENT_LINE_COLOR;
		ctx.fillStyle = COMPONENT_COLOR;
	}
	// new Drawing()
	// 	.point('a', -100, -80)
	// 	.copy('a', 'b', 40, 0)
	// 	.copy('b', 'c', 50, 0)
	// 	.copy('c', 'd', 50, 30)
	// 	.point('e', 80, 0)
	// 	.mirror('d', 'f', 'y')
	// 	.mirror('c', 'g', 'y')
	// 	.mirror('b', 'h', 'y')
	// 	.mirror('a', 'i', 'y')
	// 	.begin()
	// 	.move('a')
	// 	.line('b')
	// 	.bezier('c', 'd', 'e')
	// 	.bezier('f', 'g', 'h')
	// 	.line('i')
	// 	.copy('i', 'j', 20, -50)
	// 	.mirror('j', 'k', 'y')
	// 	.bezier('j', 'k', 'a')
	// 	.fill()
	// 	.copy('a', 'l', -30, 0)
	// 	.copy('k', 'm', -30, 0)
	// 	.copy('j', 'n', -30, 0)
	// 	.copy('i', 'o', -30, 0)
	// 	.move('l')
	// 	.bezier('m', 'n', 'o')
	// 	.stroke()
	// 	.translate(70, 0)
	// 	.scale(0.23)
	// 	.draw(ctx);
	ctx.beginPath();
	ctx.moveTo(-7, -18.5);
	ctx.lineTo(2.5, -18.5);
	ctx.bezierCurveTo(14, -18.5, 25.5, -11.5, 34.5, 0);
	ctx.bezierCurveTo(25.5, 11.5, 14, 18.5, 2.5, 18.5);
	ctx.lineTo(-7, 18.5);
	ctx.bezierCurveTo(-2.5, 7, -2.5, -7, -7, -18.5);
	ctx.fill();
	ctx.moveTo(-14, -18.5);
	ctx.bezierCurveTo(-9, -7, -9, 7, -14, 18.5);
	ctx.stroke();
};
export const orGate = (ctx, item) => {
	if (item.selected) {
		ctx.strokeStyle = SELECTED_STROKE_COLOR;
		ctx.fillStyle = SELECTED_FILL_COLOR;
	} else {
		ctx.strokeStyle = COMPONENT_LINE_COLOR;
		ctx.fillStyle = COMPONENT_COLOR;
	}
	// let d = new Drawing()
	// 	.point('a', -110, -80)
	// 	.copy('a', 'b', 50, 0)
	// 	.copy('b', 'c', 50, 0)
	// 	.copy('c', 'd', 50, 30)
	// 	.point('e', 80, 0)
	// 	.mirror('d', 'f', 'y')
	// 	.mirror('c', 'g', 'y')
	// 	.mirror('b', 'h', 'y')
	// 	.mirror('a', 'i', 'y')
	// 	.begin()
	// 	.move('a')
	// 	.line('b')
	// 	.bezier('c', 'd', 'e')
	// 	.bezier('f', 'g', 'h')
	// 	.line('i')
	// 	.copy('i', 'j', 20, -50)
	// 	.mirror('j', 'k', 'y')
	// 	.bezier('j', 'k', 'a')
	// 	.fill()
	// 	.stroke()
	// 	.translate(60, 0)
	// 	.scale(0.23)
	// 	.draw(ctx);
	// console.log(d.code());
	ctx.beginPath();
	ctx.moveTo(-11.5, -18.5);
	ctx.lineTo(0, -18.5);
	ctx.bezierCurveTo(11.5, -18.5, 23, -11.5, 32, 0);
	ctx.bezierCurveTo(23, 11.5, 11.5, 18.5, 0, 18.5);
	ctx.lineTo(-11.5, 18.5);
	ctx.bezierCurveTo(-7, 7, -7, -7, -11.5, -18.5);
	ctx.fill();
	ctx.stroke();
};
export const andGate = (ctx, item) => {
	if (item.selected) {
		ctx.strokeStyle = SELECTED_STROKE_COLOR;
		ctx.fillStyle = SELECTED_FILL_COLOR;
	} else {
		ctx.strokeStyle = COMPONENT_LINE_COLOR;
		ctx.fillStyle = COMPONENT_COLOR;
	}
	// console.log(new Drawing()
	// 		.point('a', -40, -75)
	// 		.copy('a', 'b', 100, 0)
	// 		.copy('b', 'c', 100, 0)
	// 		.mirror('c', 'd', 'y')
	// 		.mirror('b', 'e', 'y')
	// 		.mirror('a', 'f', 'y')
	// 		.begin()
	// 		.move('a')
	// 		.line('b')
	// 		.bezier('c', 'd', 'e')
	// 		.line('f')
	// 		.close()
	// 		.fill()
	// 		.stroke()
	// 		.translate(-5, 0)
	// 		.scale(0.25)
	// 		.code());
	ctx.beginPath();
	ctx.moveTo(-11, -18.5);
	ctx.lineTo(14, -18.5);
	ctx.bezierCurveTo(39, -18.5, 39, 19, 14, 19);
	ctx.lineTo(-11, 19);
	ctx.closePath();
	ctx.fill();
	ctx.stroke();
};

// const nand = new Drawing()
// 	.point('a', -50, -75)
// 	.copy('a', 'b', 85, 0)
// 	.copy('b', 'c', 100, 0)
// 	.mirror('c', 'd', 'y')
// 	.mirror('b', 'e', 'y')
// 	.mirror('a', 'f', 'y')
// 	.val('rad', 15)
// 	.begin()
// 	.move('a')
// 	.line('b')
// 	.bezier('c', 'd', 'e')
// 	.line('f')
// 	.close()
// 	.fill()
// 	.stroke()
// 	.begin()
// 	.point('g', 126, 0)
// 	.arc('g', 'rad', 0, Math.PI*2)
// 	.fill()
// 	.stroke()
// 	.translate(-5, 0)
// 	.scale(0.25);
// console.log(nand.code());
export const nandGate = (ctx, item) => {
	if (item.selected) {
		ctx.strokeStyle = SELECTED_STROKE_COLOR;
		ctx.fillStyle = SELECTED_FILL_COLOR;
	} else {
		ctx.strokeStyle = COMPONENT_LINE_COLOR;
		ctx.fillStyle = COMPONENT_COLOR;
	}
	ctx.beginPath();
	ctx.moveTo(-13.5, -18.5);
	ctx.lineTo(7.5, -18.5);
	ctx.bezierCurveTo(32.5, -18.5, 32.5, 19, 7.5, 19);
	ctx.lineTo(-13.5, 19);
	ctx.closePath();
	ctx.fill();
	ctx.stroke();
	ctx.beginPath();
	ctx.arc(30.5, 0, 4, 0, 6.283185307179586);
	ctx.fill();
	ctx.stroke();
};
export const component = (ctx, item) => {
	if (item.selected) {
		ctx.strokeStyle = SELECTED_STROKE_COLOR;
		ctx.fillStyle = SELECTED_FILL_COLOR;
	} else {
		ctx.strokeStyle = COMPONENT_LINE_COLOR;
		ctx.fillStyle = COMPONENT_COLOR;
	}
	const [ax, ay, bx, by] = item.hitbox;
	ctx.beginPath();
	ctx.rect(ax, ay, bx - ax, by - ay);
	ctx.fill();
	ctx.stroke();
};import { Coord } from '/js/transform-2d.js';
export const encodeCircuit = circuit => {
	let code = '';
	let tabs = '';
	const coord = Coord();
	const {points, iopoints, wires, components} = circuit;
	const add = line => {
		line = line.trim();
		if (line[0] === '}') {
			tabs = tabs.substr(1);
		}
		code += tabs + line + '\n';
		if (line[line.length-1] === '{') {
			tabs += '\t';
		}
	};
	let last_id = 0;
	const createId = () => '_' + (++last_id).toString(16);
	const objMap = {};
	const newIdMap = {};
	const giveId = item => {
		const newId = createId();
		objMap[newId] = item;
		newIdMap[item.id] = newId;
		return newId;
	};
	const getNewId = item => {
		const {component} = item;
		if (component) {
			const parent = getNewId(component);
			const array = component.outerPoints;
			const index = array.indexOf(item);
			return `${ parent }.outerPoints[${ index }]`;
		} else {
			return newIdMap[item.id];
		}
	}
	for (let i=points.length; i--;) {
		const point = points[i];
		const id = giveId(point);
		point.pos(coord);
		add(`const ${ id } = circuit.createPoint(${ coord.join(', ') });`);
	}
	for (let i=components.length; i--;) {
		const item = components[i];
		const id = giveId(item);
		add(`const ${ id } = new ${ item.constructor.name }(${ item.args });`);
		add(`circuit.add(${ id });`);
		item.pos(coord);
		add(`${ id }.translate(${ coord.join(', ') });`);
	}
	for (let i=wires.length; i--;) {
		const wire = wires[i];
		const {a, b} = wire;
		const id_a = getNewId(a);
		const id_b = getNewId(b);
		add(`circuit.createWire(${ id_a }, ${ id_b });`);
	}
	return code;
};import { Coord, Transform } from '/js/transform-2d.js';
import { Circuit, ComposedComponent } from '/js/circuit.js';
import * as Shared from '/js/shared.js';
import * as Render from '/js/render.js';
import * as Controls from '/js/controls.js';

let canvas, sx, sy;
const mouseInfo = {
	button: null,
	scroll: null,
	ctrl: null,
	shift: null,
	scrPos0: Coord(),
	scrPos1: Coord(),
	pos0: Coord(),
	pos1: Coord(),
	zoom: Transform()
};
const clearMouseInfo = () => {
	mouseInfo.button = null;
	mouseInfo.scroll = null;
};
const updateCanvasSize = () => {
	const new_sx = window.innerWidth;
	const new_sy = window.innerHeight;
	if (sx !== new_sx || sy !== new_sy) {
		canvas.width  = sx = new_sx;
		canvas.height = sy = new_sy;
		Shared.setViewport(0, 0, sx, sy);
	}
	Render.drawCircuit();
};
const prevent = e => {
	e.preventDefault();
	e.stopPropagation();
};
const buttonToMask = value => {
	switch (value) {
		case 0: return 0b001;
		case 1: return 0b100;
		case 2: return 0b010;
	}
};
const bindCanvas = () => {
	canvas.addEventListener('contextmenu', prevent);
	canvas.addEventListener('mousedown', e => {
		prevent(e);
		if (mouseInfo.button !== null) return;
		const {button, ctrlKey, shiftKey} = e;
		const x = e.offsetX;
		const y = e.offsetY;
		mouseInfo.button = button;
		mouseInfo.ctrl = ctrlKey;
		mouseInfo.shift = shiftKey;
		const {scrPos0, scrPos1, pos0, pos1} = mouseInfo;
		scrPos0.set(x, y);
		scrPos1.set(x, y);
		pos0.set(x, y);
		Render.trackPosition(pos0);
		pos1.set(pos0);
		Render.getZoom(mouseInfo.zoom);
		Controls.handleMousedown(mouseInfo);
	});
	canvas.addEventListener('mousemove', e => {
		if (mouseInfo.button === null) return;
		if ((e.buttons & buttonToMask(mouseInfo.button)) === 0) {
			Controls.handleMouseup(mouseInfo);
		}
		const {scrPos1, pos1} = mouseInfo;
		const x = e.offsetX;
		const y = e.offsetY;
		scrPos1.set(x, y);
		pos1.set(x, y);
		Render.trackPosition(pos1);
		Controls.handleMousemove(mouseInfo);
	});
	canvas.addEventListener('mouseup', e => {
		if (mouseInfo.button !== e.button) return;
		const x = e.offsetX;
		const y = e.offsetY;
		const {scrPos1, pos1} = mouseInfo;
		const [px, py] = scrPos1;
		if (px !== x || py !== y) {
			scrPos1.set(x, y);
			pos1.set(x, y);
			Render.trackPosition(pos1);
			Controls.handleMousemove(mouseInfo);
		}
		Controls.handleMouseup(mouseInfo);
		clearMouseInfo();
	});
	canvas.addEventListener('wheel', e => {
		prevent(e);
		if (mouseInfo.button !== null) return;
		const {deltaY, ctrlKey, shiftKey} = e;
		const x = e.offsetX;
		const y = e.offsetY;
		const {scrPos0, scrPos1, pos0, pos1} = mouseInfo;
		mouseInfo.ctrl = ctrlKey;
		mouseInfo.shift = shiftKey;
		mouseInfo.scroll = deltaY;
		scrPos0.set(x, y);
		scrPos1.set(x, y);
		pos0.set(x, y);
		Render.trackPosition(pos0);
		pos1.set(pos0);
		Render.getZoom(mouseInfo.zoom);
		Controls.handleScroll(mouseInfo);
		clearMouseInfo();
	});
	canvas.addEventListener('dblclick', e => {
		prevent(e);
		if (mouseInfo.button !== null) return;
		const {button, ctrlKey, shiftKey} = e;
		const x = e.offsetX;
		const y = e.offsetY;
		const {scrPos0, scrPos1, pos0, pos1} = mouseInfo;
		mouseInfo.button = button;
		mouseInfo.ctrl = ctrlKey;
		mouseInfo.shift = shiftKey;
		scrPos0.set(x, y);
		scrPos1.set(x, y);
		pos0.set(x, y);
		Render.trackPosition(pos0);
		pos1.set(pos0);
		Controls.handleDblclick(mouseInfo);
		clearMouseInfo();
	});
};
window.addEventListener('load', () => {
	canvas = document.querySelector('canvas');
	const circuit = new Circuit();
	Shared.setCircuit(circuit);
	Shared.setCanvas(canvas);
	bindCanvas();
	updateCanvasSize();
	setInterval(() => {
		circuit.tic();
		Render.drawCircuit();
	}, 100);
	window.addEventListener('resize', updateCanvasSize);
	window.addEventListener('keydown', e => {
		Controls.handleKeydown(e);
	});
});import * as Shared from '/js/shared.js';
import * as Drawings from '/js/drawings.js';
import { Coord, Transform } from '/js/transform-2d.js';
import {
	POINT_RADIUS,
	IO_POINT_RADIUS,
	WIRE_WIDTH,
	GRID,
	GRID_WIDTH,
	BACKGROUND_COLOR,
	GRID_COLOR,
	SELECTION_SQUARE_BORDER_WIDTH,
	SELECTION_SQUARE_BORDER_COLOR,
	SELECTION_SQUARE_COLOR,
	SELECTED_FILL_COLOR,
	SELECTED_STROKE_COLOR,
	COMPONENT_LINE_COLOR,
	COMPONENT_COLOR,
	CURSOR_COLOR,
	COMPONENT_LINE_WIDTH
} from '/js/config.js';

let ctx = null;

// Viewport
let x = null;
let y = null;
let sx = null;
let sy = null;
let scale = null;

let circuit = null;

// Auxiliares
const pos = Coord();
const pos_a = Coord();
const pos_b = Coord();

// Matrizes de transformação
const zoom = Transform().set(2.2, 0, 0, 2.2, 0, 0);
const screenMap = Transform();
const transform = Transform();

// Constantes numéricas
const PI = Math.PI;
const ROT_0 = PI*0.0;
const ROT_1 = PI*0.5;
const ROT_2 = PI*1.0;
const ROT_3 = PI*1.5;
const ROT_4 = PI*2.0;

let screenMapUpdated = false;
let transformUpdated = false;

const updateScreenMap = () => {
	if (screenMapUpdated === true) return;
	screenMap[4] = sx*0.5;
	screenMap[5] = sy*0.5;
	screenMapUpdated = true;
	transformUpdated = false;
};
const updateTransform = () => {
	updateScreenMap();
	if (transformUpdated === true) return;
	transform.clear().apply(zoom).apply(screenMap);
	transformUpdated = true;
};
const useTransform = () => {
	updateTransform();
	const [a, b, c, d, e, f] = transform;
	ctx.setTransform(a, b, c, d, e, f);
};
const valueToColor = value => {
	if (value === null) return '#d32';
	if (value === 0) return '#345';
	return '#0f7';
};
const drawPoint = point => {
	if (point.selected === true) {
		ctx.fillStyle = SELECTED_STROKE_COLOR;
	} else {
		ctx.fillStyle = valueToColor(point.val());
	}
	const [x, y] = point.coord;
	ctx.beginPath();
	if (point.wires.length !== 2) {
		ctx.arc(x, y, POINT_RADIUS, ROT_0, ROT_4);
	} else {
		ctx.arc(x, y, WIRE_WIDTH*0.75, ROT_0, ROT_4);
	}
	ctx.fill();
};
const drawWire = wire => {
	const {a, b} = wire;
	if (wire.selected === true) {
		ctx.strokeStyle = SELECTED_STROKE_COLOR;
	} else {
		ctx.strokeStyle = valueToColor(a.val());
	}
	a.pos(pos_a);
	b.pos(pos_b);
	const [ax, ay] = pos_a;
	const [bx, by] = pos_b;
	ctx.beginPath();
	ctx.moveTo(ax, ay);
	ctx.lineTo(bx, by);
	ctx.stroke();
};
const loadViewport = () => {
	const viewport = Shared.getViewport();
	if (viewport.sx !== sx || viewport.sy !== sy || viewport.x !== x || viewport.y !== y) {
		x  = viewport.x;
		y  = viewport.y;
		sx = viewport.sx;
		sy = viewport.sy;
		screenMapUpdated = false;
	}
};
const calcCurrentScale = () => {
	const [x, y] = zoom;
	scale = Math.sqrt(x*x + y*y);
};
const drawGrid = () => {
	let x0, y0, x1, y1, x, y;
	[x0, y0] = pos.set(0, 0).reverse(transform);
	[x1, y1] = pos;
	[x, y] = pos.set(sx, 0).reverse(transform);
	x0 = Math.min(x0, x);
	y0 = Math.min(y0, y);
	x1 = Math.max(x1, x);
	y1 = Math.max(y1, y);
	[x, y] = pos.set(0, sy).reverse(transform);
	x0 = Math.min(x0, x);
	y0 = Math.min(y0, y);
	x1 = Math.max(x1, x);
	y1 = Math.max(y1, y);
	[x, y] = pos.set(sx, sy).reverse(transform);
	x0 = Math.min(x0, x);
	y0 = Math.min(y0, y);
	x1 = Math.max(x1, x);
	y1 = Math.max(y1, y);
	x0 = Math.floor(x0/GRID)*GRID;
	y0 = Math.floor(y0/GRID)*GRID;
	x1 = Math.ceil(x1/GRID)*GRID;
	y1 = Math.ceil(y1/GRID)*GRID;
	const nx = (x1 - x0)/GRID;
	const ny = y1 - y0;
	ctx.lineWidth = GRID_WIDTH;
	ctx.strokeStyle = GRID_COLOR;
	ctx.beginPath();
	for (let i=1; i<nx; ++i) {
		const x = x0 + i*GRID;
		ctx.moveTo(x, y0);
		ctx.lineTo(x, y1);
	}
	for (let i=1; i<ny; ++i) {
		const y = y0 + i*GRID;
		ctx.moveTo(x0, y);
		ctx.lineTo(x1, y);
	}
	ctx.stroke();
	ctx.lineWidth = GRID_WIDTH*2;
	ctx.beginPath();
	ctx.moveTo(x0, 0);
	ctx.lineTo(x1, 0);
	ctx.moveTo(0, y0);
	ctx.lineTo(0, y1);
	ctx.stroke();
};
const drawOuterPoint = point => {
	ctx.save();
	const [a, b, c, d, e, f] = point.transform;
	ctx.transform(a, b, c, d, e, f);
	ctx.lineWidth = 1;
	ctx.setLineDash([IO_POINT_RADIUS*ROT_1*0.5]);
	if (point.component.selected === true) {
		ctx.strokeStyle = SELECTED_STROKE_COLOR;
	} else if (point.type === 'input') {
		ctx.strokeStyle = '#f70';
	} else {
		ctx.strokeStyle = '#07f';
	}
	ctx.beginPath();
	ctx.arc(0, 0, IO_POINT_RADIUS, ROT_0 + ROT_1*0.25, ROT_4 + ROT_1*0.25);
	ctx.stroke();
	ctx.restore();
};
const drawInnerPoint = point => {
	ctx.lineWidth = 1;
	ctx.setLineDash([IO_POINT_RADIUS*ROT_1*0.5]);
	if (point.selected === true) {
		ctx.strokeStyle = SELECTED_STROKE_COLOR;
	} else if (point.type === 'input') {
		ctx.strokeStyle = '#f70';
	} else {
		ctx.strokeStyle = '#07f';
	}
	const [x, y] = point.coord;
	ctx.beginPath();
	ctx.arc(x, y, IO_POINT_RADIUS, ROT_0 + ROT_1*0.25, ROT_4 + ROT_1*0.25);
	ctx.stroke();
	ctx.setLineDash([]);
};
const drawHitbox = item => {
	const {hitbox} = item;
	const [ax, ay, bx, by] = hitbox;
	ctx.lineWidth = 1;
	ctx.strokeStyle = 'rgba(0, 119, 255, 0.5)';
	ctx.beginPath();
	ctx.rect(ax, ay, bx - ax, by - ay);
	ctx.stroke();
};
const drawComponent = item => {
	ctx.save();
	ctx.transform(...item.transform);
	const {draw} = item;
	if (!draw) {
		Drawings.component(ctx, item);
	} else {
		draw(ctx, item);
	}
	const {outerPoints} = item;
	for (let i=outerPoints.length; i--;) {
		drawOuterPoint(outerPoints[i]);
	}
	// drawHitbox(item);
	ctx.restore();
};
const drawCursor = () => {
	const [x, y] = Shared.getCursor();
	ctx.lineWidth = 1;
	ctx.strokeStyle = CURSOR_COLOR;
	ctx.beginPath();
	ctx.arc(x, y, GRID*0.5, ROT_0, ROT_4);
	ctx.moveTo(x + GRID*0.4, y);
	ctx.lineTo(x + GRID*0.6, y);
	ctx.moveTo(x - GRID*0.4, y);
	ctx.lineTo(x - GRID*0.6, y);
	ctx.moveTo(x, y + GRID*0.4);
	ctx.lineTo(x, y + GRID*0.6);
	ctx.moveTo(x, y - GRID*0.4);
	ctx.lineTo(x, y - GRID*0.6);
	ctx.stroke();
};
export const translateView = (x, y) => {
	zoom.translate(x, y);
	transformUpdated = false;
};
export const scaleView = value => {
	zoom.scale(value);
	transformUpdated = false;
};
export const rotateView = ang => {
	zoom.rotate(ang);
	transformUpdated = false;
};
export const trackPosition = (pos) => {
	loadViewport();
	updateTransform();
	return pos.reverse(transform);
};
export const getZoom = dst => {
	dst.set(zoom);
	return dst;
};
export const setZoom = src => {
	zoom.set(src);
	transformUpdated = false;
	return src;
};
export const drawCircuit = () => {
	loadViewport();
	ctx = Shared.getCtx2D();
	ctx.save();
	ctx.fillStyle = BACKGROUND_COLOR;
	ctx.fillRect(x, y, sx, sy);
	circuit = Shared.getCircuit();
	useTransform();
	calcCurrentScale();
	drawGrid();
	const {points, iopoints, wires, components} = circuit;
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';
	ctx.lineWidth = WIRE_WIDTH;
	for (let i=wires.length; i--;) {
		drawWire(wires[i]);
	}
	for (let i=points.length; i--;) {
		drawPoint(points[i]);
	}
	for (let i=iopoints.length; i--;) {
		drawInnerPoint(iopoints[i]);
	}
	ctx.lineWidth = COMPONENT_LINE_WIDTH;
	for (let i=0; i<components.length; ++i) {
		drawComponent(components[i]);
	}
	const square = Shared.getSelectionSquare();
	if (square.x !== null) {
		const {x, y, sx, sy} = square;
		ctx.lineWidth = SELECTION_SQUARE_BORDER_WIDTH/scale;
		ctx.strokeStyle = SELECTION_SQUARE_BORDER_COLOR;
		ctx.fillStyle = SELECTION_SQUARE_COLOR;
		ctx.beginPath();
		ctx.rect(x, y, sx, sy);
		ctx.fill();
		ctx.stroke();
	}
	drawCursor();
	ctx.restore();
};import { Coord } from '/js/transform-2d.js';

let canvas = null;
let ctx2D = null;
export const setCanvas = arg => {
	canvas = arg;
	ctx2D = canvas.getContext('2d');
}
export const getCanvas = () => canvas;
export const getCtx2D = () => ctx2D;

const viewport = {x: null, y: null, sx: null, sy: null};
export const setViewport = (x, y, sx, sy) => {
	viewport.x = x;
	viewport.y = y;
	viewport.sx = sx;
	viewport.sy = sy;
};
export const getViewport = () => ({...viewport});

let circuit = null;
export const setCircuit = arg => {
	circuit = arg;
	window.circuit = circuit;
};
export const getCircuit = () => circuit;

const selectionSquare = {x: null, y: null, sx: null, sy: null};
export const setSelectionSquare = (x, y, sx, sy) => {
	selectionSquare.x = x;
	selectionSquare.y = y;
	selectionSquare.sx = sx;
	selectionSquare.sy = sy;
};
export const getSelectionSquare = () => ({...selectionSquare});

const cursor = Coord();
export const setCursor = (x, y) => {
	cursor.set(x, y);
};
export const getCursor = () => cursor;class CoordinateTransformation extends Float64Array {
	constructor() {
		super(6);
		this[0] = 1;
		this[3] = 1;
	}
	clear() {
		this[0] = 1;
		this[1] = 0;
		this[2] = 0;
		this[3] = 1;
		this[4] = 0;
		this[5] = 0;
		return this;
	}
	set(a, b, c, d, e, f) {
		if (a instanceof CoordinateTransformation) {
			[a, b, c, d, e, f] = a;
		}
		this[0] = a;
		this[1] = b;
		this[2] = c;
		this[3] = d;
		this[4] = e;
		this[5] = f;
		return this;
	}
	apply(mat) {
		const [a1, b1, c1, d1, e1, f1] = this;
		const [a2, b2, c2, d2, e2, f2] = mat;
		this[0] = a1*a2 + b1*c2;
		this[1] = a1*b2 + b1*d2;
		this[2] = c1*a2 + d1*c2;
		this[3] = c1*b2 + d1*d2;
		this[4] = e1*a2 + f1*c2 + e2;
		this[5] = e1*b2 + f1*d2 + f2;
		return this;
	}
	translate(x, y) {
		this[4] += x;
		this[5] += y;
		return this;
	}
	scale(value) {
		this[0] *= value;
		this[1] *= value;
		this[2] *= value;
		this[3] *= value;
		this[4] *= value;
		this[5] *= value;
		return this;
	}
	rotate(ang) {
		const [a1, b1, c1, d1, e1, f1] = this;
		const cos = Math.cos(ang);
		const sin = Math.sin(ang);
		this[0] = a1*cos - b1*sin;
		this[1] = a1*sin + b1*cos;
		this[2] = c1*cos - d1*sin;
		this[3] = c1*sin + d1*cos;
		this[4] = e1*cos - f1*sin;
		this[5] = e1*sin + f1*cos;
		return this;
	}
	coord(coord) {
		coord.set(this[4], this[5]);
		return coord;
	}
	round() {
		this[0] = Math.round(this[0]);
		this[1] = Math.round(this[1]);
		this[2] = Math.round(this[2]);
		this[3] = Math.round(this[3]);
		this[4] = Math.round(this[4]);
		this[5] = Math.round(this[5]);
		return this;
	}
	clone() {
		const clone = new CoordinateTransformation();
		clone[0] = this[0];
		clone[1] = this[1];
		clone[2] = this[2];
		clone[3] = this[3];
		clone[4] = this[4];
		clone[5] = this[5];
		return clone;
	}
}
class Coordinate extends Float64Array {
	constructor(buffer, index) {
		super(2);
	}
	clear() {
		this[0] = 0;
		this[1] = 0;
		return this;
	}
	set(a, b) {
		if (a instanceof Coordinate) {
			[a, b] = a;
		}
		this[0] = a;
		this[1] = b;
		return this;
	}
	apply(mat) {
		const [x, y] = this;
		const [a, b, c, d, e, f] = mat;
		this[0] = x*a + y*c + e;
		this[1] = x*b + y*d + f;
		return this;
	}
	translate(x, y) {
		this[0] += x;
		this[1] += y;
		return this;
	}
	reverse(mat) {
		const [x, y] = this;
		const [a, b, c, d, e, f] = mat;
		if (Math.abs(d) > Math.abs(c)) {
			const g = c/d;
			const h = y - f;
			this[0] = (x - e - h*g)/(a - b*g);
			this[1] = (h - this[0]*b)/d;
		} else {
			const g = d/c;
			const h = x - e;
			this[0] = (y - h*g - f)/(b - a*g);
			this[1] = (h - this[0]*a)/c;
		}
		return this;
	}
	round() {
		this[0] = Math.round(this[0]);
		this[1] = Math.round(this[1]);
		return this;
	}
}
export const Coord = () => new Coordinate();
export const Transform = () => new CoordinateTransformation();export const arrayRemove = (array, item) => {
	const index = array.indexOf(item);
	if (index !== -1) {
		array.splice(index, 1);
		return true;
	}
	return false;
};
export const pushUnique = (array, item) => {
	if (array.indexOf(item) === -1) {
		array.push(item);
		return true;
	}
	return false;
};
export const calcDistance = (ax, ay, bx, by) => {
	const dx = ax - bx;
	const dy = ay - by;
	return Math.sqrt(dx*dx + dy*dy);
};
export const lineDistance = (x, y, ax, ay, bx, by) => {
	const a = calcDistance(ax, ay,  x,  y);
	const b = calcDistance(bx, by,  x,  y);
	const d = calcDistance(ax, ay, bx, by);
	const a_sqr = a*a;
	const b_sqr = b*b;
	const d_sqr = d*d;
	const v1 = b_sqr - a_sqr - d_sqr;
	const v2 = a_sqr - b_sqr - d_sqr;
	if (v1 >= 0 && v2 < 0) return a;
	if (v2 >= 0 && v1 < 0) return b;
	const c = (b_sqr - d_sqr - a_sqr)/(d+d);
	return Math.sqrt(a_sqr - c*c);
};