import {
	Conductor,
	Point,
	Wire
} from '/js/conduction.js';
import {
	IOPoint,
	InnerIOPoint,
	OuterIOPoint,
} from '/js/circuit.js';
import { Component } from '/js/component.js'
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
		const {workspace} = this;
		workspace[1] = ~workspace[0];
		return 0;
	}
}

export class NotLGate extends Component {
	constructor() {
		super();
		this.hitbox = [-15, -10, 15, 10];

		const workspace = new Uint32Array(2);
		const {buffer} = workspace;
		this.workspace = workspace;

		this.addIO(-20, 0, 'input', 'input');
		const output = this.addIO(20, 0, 'output', new Conductor(32, buffer, 1));
		output.conductor[0] = 1;

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
		const {workspace} = this;
		workspace[1] = (workspace[0] === 0)|0;
		return 0;
	}
}

export class BufferGate extends Component {
	constructor() {
		super();
		this.hitbox = [-15, -10, 15, 10];

		const workspace = new Uint32Array(2);
		const {buffer} = workspace;
		this.workspace = workspace;

		this.addIO(-20, 0, 'input', 'input');
		const output = this.addIO(20, 0, 'output', new Conductor(32, buffer, 1));
		output.conductor[0] = 0;

		this.draw = Drawings.bufferGate;
	}
	clone() {
		const item = new BufferGate();
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
		const {workspace} = this;
		workspace[1] = workspace[0];
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
		const {workspace} = this;
		workspace[2] = ~(workspace[0] & workspace[1]);
		return 0;
	}
}

export class NorGate extends Component {
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

		this.draw = Drawings.norGate;
	}
	clone() {
		const item = new NorGate();
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
		const {workspace} = this;
		workspace[2] = ~(workspace[0] | workspace[1]);
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
		const {workspace} = this;
		workspace[2] = workspace[0] | workspace[1];
		return 0;
	}
}