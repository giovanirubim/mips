import { Transform, Coord } from '/js/transform-2d.js';
import { Conductor } from '/js/conduction.js';
import { InnerIOPoint, OuterIOPoint, Circuit } from '/js/circuit.js';

export class Component {
	constructor() {
		this.id = Symbol();
		this.transform = Transform();
		this.outerPoints = [];
		this.inputChanged = 0;
		this.stateChanged = 0;
		this.hitbox = [-20, -20, 20, 20];
		this.args = '';
		this.label = '';
		this.selected = false;

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
	moveTo(x, y) {
		const {transform} = this;
		transform[4] = x;
		transform[5] = y;
		return this;
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
	clone() {
		const item = new this.constructor();
		item.transform.set(this.transform);
		return item;
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
}