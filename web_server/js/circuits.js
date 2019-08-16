import { Coord, Transform } from '/js/transform-2d.js';
import { arrayRemove, pushUnique } from '/js/utils.js';

class Conductor extends Uint32Array {
	constructor(bitLength, buffer, index) {
		if (buffer !== undefined) {
			super(buffer, index << 2, 1);
		} else {
			super(1);
		}
		this.bitLength = bitLength;
	}
}

const getTree = (root, map) => {
	const {points, visited} = map;
	const {id, wires} = root;
	visited[id] = true;
	points.push(root);
	for (let i=wires.length; i--;) {
		const point = wires[i].other(root);
		if (visited[point.id] !== true) {
			getTree(point, map);
			map.wires.push(wire);
		}
	}
	return map;
};

class Point {
	constructor() {
		this.id = Symbol();
		this.coord = Coord();
		this.conductor = null;
		this.wires = [];
	}
	translate(x, y) {
		this.coord.translate(x, y);
		return this;
	}
	pos(coord) {
		return coord.set(this.coord);
	}
	getNeighbor(array) {
		const {wires} = this;
		if (array === undefined) {
			array = new Array(wires.length);
		}
		for (let i=wires.length; i--;) {
			const {a, b} = wire[i];
			array[i] = a === this ? b : a;
		}
		return array;
	}
	getTree() {
		return getTree(this, {
			points: [],
			wires: [],
			visited: {}
		});
	}
}

class IOPoint extends Point {
	constructor(type) {
		super();
		this.type = type;
	}
}

class InnerIOPoint extends IOPoint {
	constructor(type) {
		super(type);
	}
}

class OuterIOPoint extends IOPoint {
	constructor(type, component, conductor) {
		super(type);
		this.component = component;
		this.conductor = conductor || null;
		this.isSource = !!conductor;
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
}

class Wire {
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
}

class Circuit {
	constructor(component) {
		this.component = component;
		this.wires = [];
		this.points = [];
		this.iopoints = [];
		this.components = [];
	}
}

class ComposedComponent {
	constructor() {
		this.circuit = new Circuit();
		this.outerPoints = [];

		// Componentes do circuito interno conectados a ao menos um InnerIOPoint do tipo input
		this.inputLayer = [];

		// Componentes do circuito interno não contidos no vetor inputLayer
		this.nonInput = [];

		// Flag que indica que há alterações na entrada do componente ainda não processadas
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
		for (let i=inputLayer.length; i--;) {
			const item = inputLayer[i];
			inputChanged |= item.readInputs();
			if (item.inputChanged === 1 || item.stateChanged === 1) {
				buffer[n++] = item;
			}
		}
		this.bufferLength = n;
		return this.inputChanged = inputChanged;
	}
	tic() {
		let {inputChanged, stateChanged} = this;
		if (inputChanged === 0 && stateChanged === 0) return 0;
		const {nonInput, buffer} = this;
		let n = this.bufferLength;
		for (let = nonInput.length; i--;) {
			const item = nonInput[i];
			item.readInputs();
			if (item.inputChanged === 1 || item.stateChanged === 1) {
				buffer[n++] = item;
			}
		}
		for (let i=n; i--;) {
			buffer[i].tic();
		}
		this.stateChanged = 1;
		this.bufferLength = 0;
	}
}