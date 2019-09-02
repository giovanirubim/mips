import * as AtomicComponent from '/js/atomic-components.js';
import { Circuit } from '/js/circuit.js';
import { ComposedComponent } from '/js/component.js';

for (let name in AtomicComponent) {
	window[name] = AtomicComponent[name];
}

export class BitAdder extends ComposedComponent {
	constructor() {
		super();
		const circuit = new Circuit();
		const inputLayer = [];
		const nonInput = [];
		this.circuit = circuit;
		this.inputLayer = inputLayer;
		this.nonInput = nonInput;
		this.label = "bit-adder";
		const _1 = circuit.createIOPoint('input', -40, -140);
		_1.label = "A";
		_1.labelProp.align = "right";
		_1.labelProp.baseline = "bottom";
		_1.labelProp.dx = -0.25;
		_1.labelProp.dy = -0.25;
		const _2 = circuit.createIOPoint('input', 80, -140);
		_2.label = "B";
		_2.labelProp.align = "right";
		_2.labelProp.baseline = "bottom";
		_2.labelProp.dx = -0.25;
		_2.labelProp.dy = -0.25;
		const _3 = circuit.createIOPoint('input', 160, -80);
		_3.label = "carry-in";
		_3.labelProp.align = "left";
		_3.labelProp.baseline = "bottom";
		_3.labelProp.dx = 0.25;
		_3.labelProp.dy = -0.25;
		const _4 = circuit.createIOPoint('output', 60, 180);
		_4.label = "result";
		_4.labelProp.align = "left";
		_4.labelProp.baseline = "top";
		_4.labelProp.dx = 0.25;
		_4.labelProp.dy = 0.25;
		const _5 = circuit.createIOPoint('output', -200, -80);
		_5.label = "carry-out";
		_5.labelProp.align = "right";
		_5.labelProp.baseline = "bottom";
		_5.labelProp.dx = -0.25;
		_5.labelProp.dy = -0.25;
		const _6 = circuit.createPoint(120, -80);
		const _7 = circuit.createPoint(120, -40);
		const _8 = circuit.createPoint(-40, 20);
		const _9 = circuit.createPoint(40, 20);
		const _a = circuit.createPoint(80, -80);
		const _b = circuit.createPoint(80, 60);
		const _c = circuit.createPoint(-100, 60);
		const _d = circuit.createPoint(-80, -60);
		const _e = circuit.createPoint(-20, -60);
		const _f = circuit.createPoint(-20, -100);
		const _10 = circuit.createPoint(100, 60);
		const _11 = new XorGate();
		circuit.add(_11);
		_11.transform.set(0, 1, -1, 0, 100, 0);
		inputLayer.push(_11);
		const _12 = new AndGate();
		circuit.add(_12);
		_12.transform.set(-1, 0, 0, -1, 40, -60);
		inputLayer.push(_12);
		const _13 = new XorGate();
		circuit.add(_13);
		_13.transform.set(0, 1, -1, 0, 60, 100);
		inputLayer.push(_13);
		const _14 = new AndGate();
		circuit.add(_14);
		_14.transform.set(0, -1, 1, 0, -80, 0);
		inputLayer.push(_14);
		const _15 = new OrGate();
		circuit.add(_15);
		_15.transform.set(-1, 0, 0, -1, -120, -80);
		nonInput.push(_15);
		circuit.createWire(_6, _3);
		circuit.createWire(_11.outerPoints[0], _7);
		circuit.createWire(_7, _6);
		circuit.createWire(_7, _12.outerPoints[0]);
		circuit.createWire(_1, _8);
		circuit.createWire(_8, _9);
		circuit.createWire(_9, _13.outerPoints[1]);
		circuit.createWire(_13.outerPoints[2], _4);
		circuit.createWire(_2, _a);
		circuit.createWire(_a, _11.outerPoints[1]);
		circuit.createWire(_a, _12.outerPoints[1]);
		circuit.createWire(_13.outerPoints[0], _b);
		circuit.createWire(_14.outerPoints[1], _8);
		circuit.createWire(_b, _c);
		circuit.createWire(_c, _14.outerPoints[0]);
		circuit.createWire(_15.outerPoints[0], _d);
		circuit.createWire(_d, _14.outerPoints[2]);
		circuit.createWire(_12.outerPoints[2], _e);
		circuit.createWire(_e, _f);
		circuit.createWire(_f, _15.outerPoints[1]);
		circuit.createWire(_b, _10);
		circuit.createWire(_10, _11.outerPoints[2]);
		circuit.createWire(_5, _15.outerPoints[2]);
		const _16 = this.addIO(0, -20, 'input');
		circuit.createHiddenWire(_16, _1)
		const _17 = this.addIO(20, -20, 'input');
		circuit.createHiddenWire(_17, _2)
		const _18 = this.addIO(40, 0, 'input');
		circuit.createHiddenWire(_18, _3)
		const _19 = this.addIO(0, 20, 'output');
		circuit.createHiddenWire(_19, _4)
		const _1a = this.addIO(-20, 0, 'output');
		circuit.createHiddenWire(_1a, _5)
		this.hitbox = [-14, -14, 34, 14];
	}
}
export class Latch extends ComposedComponent {
	constructor() {
		super();
		const circuit = new Circuit();
		const inputLayer = [];
		const nonInput = [];
		this.circuit = circuit;
		this.inputLayer = inputLayer;
		this.nonInput = nonInput;
		this.label = "latch";
		const _1 = circuit.createIOPoint('output', 120, 0);
		const _2 = circuit.createIOPoint('input', -120, -100);
		const _3 = circuit.createIOPoint('input', -120, 100);
		const _4 = circuit.createPoint(100, 0);
		const _5 = circuit.createPoint(100, 60);
		const _6 = circuit.createPoint(100, 80);
		const _7 = circuit.createPoint(100, -40);
		const _8 = circuit.createPoint(40, 40);
		const _9 = circuit.createPoint(40, -20);
		const _a = circuit.createPoint(-80, 100);
		const _b = circuit.createPoint(80, -20);
		const _c = circuit.createPoint(100, -60);
		const _d = circuit.createPoint(-20, -20);
		const _e = circuit.createPoint(-20, -40);
		const _f = circuit.createPoint(-20, 40);
		const _10 = circuit.createPoint(-20, 60);
		const _11 = circuit.createPoint(80, 40);
		const _12 = new BufferGate();
		circuit.add(_12);
		_12.transform.set(0, -1, 1, 0, -80, 60);
		inputLayer.push(_12);
		const _13 = new NotGate();
		circuit.add(_13);
		_13.transform.set(1, 0, 0, 1, -40, 100);
		inputLayer.push(_13);
		const _14 = new AndGate();
		circuit.add(_14);
		_14.transform.set(1, 0, 0, 1, -60, -80);
		inputLayer.push(_14);
		const _15 = new AndGate();
		circuit.add(_15);
		_15.transform.set(1, 0, 0, 1, 40, 80);
		nonInput.push(_15);
		const _16 = new OrGate();
		circuit.add(_16);
		_16.transform.set(1, 0, 0, 1, 20, -60);
		nonInput.push(_16);
		circuit.createWire(_b, _4);
		circuit.createWire(_1, _4);
		circuit.createWire(_5, _11);
		circuit.createWire(_6, _5);
		circuit.createWire(_6, _15.outerPoints[2]);
		circuit.createWire(_7, _b);
		circuit.createWire(_c, _7);
		circuit.createWire(_8, _11);
		circuit.createWire(_d, _8);
		circuit.createWire(_9, _b);
		circuit.createWire(_f, _9);
		circuit.createWire(_12.outerPoints[1], _14.outerPoints[1]);
		circuit.createWire(_12.outerPoints[0], _a);
		circuit.createWire(_13.outerPoints[1], _15.outerPoints[1]);
		circuit.createWire(_a, _13.outerPoints[0]);
		circuit.createWire(_3, _a);
		circuit.createWire(_14.outerPoints[0], _2);
		circuit.createWire(_14.outerPoints[2], _16.outerPoints[0]);
		circuit.createWire(_16.outerPoints[2], _c);
		circuit.createWire(_e, _d);
		circuit.createWire(_16.outerPoints[1], _e);
		circuit.createWire(_10, _f);
		circuit.createWire(_15.outerPoints[0], _10);
		const _17 = this.addIO(20, 0, 'output');
		circuit.createHiddenWire(_17, _1)
		const _18 = this.addIO(-20, -20, 'input');
		circuit.createHiddenWire(_18, _2)
		const _19 = this.addIO(-20, 0, 'input');
		circuit.createHiddenWire(_19, _3)
		this.hitbox = [-14, -34, 14, 34];
	}
}
export class FlipFlop extends ComposedComponent {
	constructor() {
		super();
		const circuit = new Circuit();
		const inputLayer = [];
		const nonInput = [];
		this.circuit = circuit;
		this.inputLayer = inputLayer;
		this.nonInput = nonInput;
		this.label = "flip-flop";
		const _1 = circuit.createIOPoint('input', -100, -20);
		const _2 = circuit.createIOPoint('input', -100, 20);
		const _3 = circuit.createIOPoint('output', 100, 0);
		const _4 = circuit.createPoint(-80, 20);
		const _5 = circuit.createPoint(-80, 0);
		const _6 = circuit.createPoint(-80, 60);
		const _7 = circuit.createPoint(0, 0);
		const _8 = circuit.createPoint(0, -20);
		const _9 = circuit.createPoint(20, 60);
		const _a = circuit.createPoint(20, 0);
		const _b = new Latch();
		circuit.add(_b);
		_b.transform.set(1, 0, 0, 1, -40, 0);
		inputLayer.push(_b);
		const _c = new Latch();
		circuit.add(_c);
		_c.transform.set(1, 0, 0, 1, 60, 0);
		nonInput.push(_c);
		const _d = new NotGate();
		circuit.add(_d);
		_d.transform.set(1, 0, 0, 1, -20, 60);
		inputLayer.push(_d);
		circuit.createWire(_1, _b.outerPoints[1]);
		circuit.createWire(_2, _4);
		circuit.createWire(_4, _5);
		circuit.createWire(_5, _b.outerPoints[2]);
		circuit.createWire(_4, _6);
		circuit.createWire(_b.outerPoints[0], _7);
		circuit.createWire(_7, _8);
		circuit.createWire(_8, _c.outerPoints[1]);
		circuit.createWire(_6, _d.outerPoints[0]);
		circuit.createWire(_9, _d.outerPoints[1]);
		circuit.createWire(_9, _a);
		circuit.createWire(_a, _c.outerPoints[2]);
		circuit.createWire(_c.outerPoints[0], _3);
		const _e = this.addIO(40, 0, 'output');
		circuit.createHiddenWire(_e, _3)
		const _f = this.addIO(-40, -20, 'input');
		circuit.createHiddenWire(_f, _1)
		const _10 = this.addIO(-40, 0, 'input');
		circuit.createHiddenWire(_10, _2)
		this.hitbox = [-34, -34, 34, 34];
	}
}