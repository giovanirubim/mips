import { Coord } from '/js/transform-2d.js'
import { Conductor, Point, Wire } from '/js/conduction.js'
import { arrayRemove } from '/js/utils.js';

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
		if (third instanceof Conductor) {
			this.attrName  = null;
			this.conductor = third;
			this.isSource  = 1;
		} else {
			this.attrName  = third;
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
			point.conductor = conductor;
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
			if (px === x && py === y) {
				return point;
			}
		}
		return null;
	}
	getInnerIOPointAt(x, y) {
		const {iopoints} = this;
		for (let i=iopoints.length; i;) {
			const point = iopoints[--i];
			const [px, py] = point.coord;
			if (px === x && py === y) {
				return point;
			}
		}
		return null;
	}
	removeWire(wire) {
		wire.disconnect();
		arrayRemove(this.wires, wire);
		const {a, b} = wire;
		resetConductors(a);
		resetConductors(b);
		return this;
	}
	removePoint(point) {
		const neighbors = point.getNeighbors();
		const {wires} = point;
		while (wires.length !== 0) {
			this.removeWire(wires[0]);
		}
		arrayRemove(this.points, point);
		const visited = {};
		for (let i=neighbors.length; i--;) {
			const rootPoint = neighbors[i];
			const array = [];
			getConnectedPoints(rootPoint, array, visited);
			setConductor(array, getSourceConductor(array));
		}
		return this;
	}
}

export class ComposedComponent {
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
}