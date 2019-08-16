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

const getConductiveTree = (root, map) => {
	const {points, visited} = map;
	const {id, wires} = root;
	visited[id] = true;
	points.push(root);
	for (let i=wires.length; i--;) {
		const point = wires[i].other(root);
		if (visited[point.id] !== true) {
			getConductiveTree(point, map);
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
	value() {
		const {conductor} = this;
		return conductor === null ? null : conductor[0];
	}
	getNeighbors(array) {
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
	getConductiveTree() {
		return getConductiveTree(this, {
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
	constructor(type, component, third) {
		super(type);
		this.component = component;
		if (third instanceof Conductor) {
			this.attrName  = null;
			this.conductor = third;
			this.isSource  = 1;
		} else {
			this.attrName  = third;
			this.conductor = null;
			this.isSource  = 0;
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
		for (let = nonInput.length; i--;) {
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
}