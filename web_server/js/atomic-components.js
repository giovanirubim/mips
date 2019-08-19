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