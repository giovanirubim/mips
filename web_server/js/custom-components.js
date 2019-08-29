import * as AtomicComponent from '/js/atomic-components.js';
import { Circuit } from '/js/circuit.js';
import { ComposedComponent } from '/js/component.js';
export class FakeOr extends ComposedComponent {
	constructor() {
		super();
		const circuit = new Circuit();
		const inputLayer = [];
		const nonInput = [];
		this.circuit = circuit;
		this.inputLayer = inputLayer;
		this.nonInput = nonInput;
		const _1 = circuit.createIOPoint('output', 120, 0);
		const _2 = circuit.createIOPoint('input', -100, 40);
		const _3 = circuit.createIOPoint('input', -100, -40);
		const _4 = circuit.createPoint(-60, 60);
		const _5 = circuit.createPoint(-80, 40);
		const _6 = circuit.createPoint(-60, 20);
		const _7 = circuit.createPoint(-60, -20);
		const _8 = circuit.createPoint(-80, -40);
		const _9 = circuit.createPoint(-60, -60);
		const _a = new AtomicComponent.NandGate();
		circuit.add(_a);
		_a.translate(-20, 40);
		inputLayer.push(_a);
		const _b = new AtomicComponent.NandGate();
		circuit.add(_b);
		_b.translate(-20, -40);
		inputLayer.push(_b);
		const _c = new AtomicComponent.NandGate();
		circuit.add(_c);
		_c.translate(60, 0);
		nonInput.push(_c);
		circuit.createWire(_1, _c.outerPoints[2]);
		circuit.createWire(_5, _2);
		circuit.createWire(_8, _3);
		circuit.createWire(_5, _4);
		circuit.createWire(_a.outerPoints[1], _4);
		circuit.createWire(_6, _a.outerPoints[0]);
		circuit.createWire(_5, _6);
		circuit.createWire(_7, _b.outerPoints[1]);
		circuit.createWire(_8, _7);
		circuit.createWire(_9, _8);
		circuit.createWire(_b.outerPoints[0], _9);
		circuit.createWire(_a.outerPoints[2], _c.outerPoints[1]);
		circuit.createWire(_c.outerPoints[0], _b.outerPoints[2]);
	}
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
		const _1 = circuit.createIOPoint('input', 200, 0);
		const _2 = circuit.createIOPoint('input', -100, -120);
		const _3 = circuit.createIOPoint('input', 100, -120);
		const _4 = circuit.createIOPoint('output', -220, 0);
		const _5 = circuit.createIOPoint('output', 0, 160);
		const _6 = circuit.createPoint(120, 40);
		const _7 = circuit.createPoint(140, 20);
		const _8 = circuit.createPoint(140, 0);
		const _9 = circuit.createPoint(120, -20);
		const _a = circuit.createPoint(-100, -100);
		const _b = circuit.createPoint(-80, -80);
		const _c = circuit.createPoint(-40, -80);
		const _d = circuit.createPoint(-20, -60);
		const _e = circuit.createPoint(-60, -20);
		const _f = circuit.createPoint(-40, -40);
		const _10 = circuit.createPoint(-20, 0);
		const _11 = circuit.createPoint(20, 40);
		const _12 = circuit.createPoint(100, -60);
		const _13 = circuit.createPoint(100, 0);
		const _14 = new OrGate();
		circuit.add(_14);
		_14.transform.set(-1, 0, 0, -1, -140, 0);
		nonInput.push(_14);
		const _15 = new AndGate();
		circuit.add(_15);
		_15.transform.set(-1, 0, 0, -1, -60, 20);
		inputLayer.push(_15);
		const _16 = new XorGate();
		circuit.add(_16);
		_16.transform.set(0, 1, -1, 0, 0, 80);
		inputLayer.push(_16);
		const _17 = new AndGate();
		circuit.add(_17);
		_17.transform.set(-1, 0, 0, -1, 60, -40);
		inputLayer.push(_17);
		const _18 = new XorGate();
		circuit.add(_18);
		_18.transform.set(-1, 0, 0, -1, 60, 20);
		inputLayer.push(_18);
		circuit.createWire(_18.outerPoints[0], _6);
		circuit.createWire(_7, _6);
		circuit.createWire(_8, _7);
		circuit.createWire(_8, _1);
		circuit.createWire(_9, _8);
		circuit.createWire(_9, _17.outerPoints[0]);
		circuit.createWire(_a, _2);
		circuit.createWire(_b, _a);
		circuit.createWire(_c, _b);
		circuit.createWire(_d, _c);
		circuit.createWire(_10, _d);
		circuit.createWire(_e, _14.outerPoints[1]);
		circuit.createWire(_f, _e);
		circuit.createWire(_17.outerPoints[2], _f);
		circuit.createWire(_3, _12);
		circuit.createWire(_10, _15.outerPoints[1]);
		circuit.createWire(_10, _16.outerPoints[1]);
		circuit.createWire(_4, _14.outerPoints[2]);
		circuit.createWire(_14.outerPoints[0], _15.outerPoints[2]);
		circuit.createWire(_11, _15.outerPoints[0]);
		circuit.createWire(_5, _16.outerPoints[2]);
		circuit.createWire(_11, _16.outerPoints[0]);
		circuit.createWire(_18.outerPoints[2], _11);
		circuit.createWire(_12, _17.outerPoints[1]);
		circuit.createWire(_13, _12);
		circuit.createWire(_18.outerPoints[1], _13);
		const _19 = this.addIO(-20, -20, 'input');
		circuit.createHiddenWire(_19, _3)
		const _1a = this.addIO(0, -20, 'input');
		circuit.createHiddenWire(_1a, _2)
		const _1b = this.addIO(40, 0, 'input');
		circuit.createHiddenWire(_1b, _1)
		const _1c = this.addIO(0, 20, 'output');
		circuit.createHiddenWire(_1c, _5)
		const _1d = this.addIO(-40, 0, 'output');
		circuit.createHiddenWire(_1d, _4)
		this.hitbox = [-34, -14, 34, 14];
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
		const _1 = circuit.createIOPoint('input', -180, -60);
		const _2 = circuit.createIOPoint('input', -180, -100);
		const _3 = circuit.createIOPoint('output', 120, 60);
		const _4 = circuit.createIOPoint('output', 120, -60);
		const _5 = circuit.createPoint(100, -60);
		const _6 = circuit.createPoint(100, -20);
		const _7 = circuit.createPoint(100, 60);
		const _8 = circuit.createPoint(100, 20);
		const _9 = circuit.createPoint(-160, 100);
		const _a = circuit.createPoint(-160, -60);
		const _b = circuit.createPoint(-140, 60);
		const _c = circuit.createPoint(-140, -100);
		const _d = circuit.createPoint(-40, 20);
		const _e = circuit.createPoint(-40, 40);
		const _f = circuit.createPoint(-40, -20);
		const _10 = circuit.createPoint(-40, -40);
		const _11 = circuit.createPoint(60, 20);
		const _12 = circuit.createPoint(60, 60);
		const _13 = circuit.createPoint(60, -20);
		const _14 = circuit.createPoint(60, -60);
		const _15 = new NotGate();
		circuit.add(_15);
		_15.transform.set(0, 1, -1, 0, -140, 0);
		inputLayer.push(_15);
		const _16 = new AndGate();
		circuit.add(_16);
		_16.transform.set(1, 0, 0, 1, -100, -80);
		inputLayer.push(_16);
		const _17 = new AndGate();
		circuit.add(_17);
		_17.transform.set(1, 0, 0, 1, -100, 80);
		inputLayer.push(_17);
		const _18 = new NorGate();
		circuit.add(_18);
		_18.transform.set(1, 0, 0, 1, 0, 60);
		nonInput.push(_18);
		const _19 = new NorGate();
		circuit.add(_19);
		_19.transform.set(1, 0, 0, 1, 0, -60);
		nonInput.push(_19);
		circuit.createWire(_5, _4);
		circuit.createWire(_6, _5);
		circuit.createWire(_11, _6);
		circuit.createWire(_7, _3);
		circuit.createWire(_8, _7);
		circuit.createWire(_13, _8);
		circuit.createWire(_9, _17.outerPoints[1]);
		circuit.createWire(_a, _9);
		circuit.createWire(_a, _16.outerPoints[1]);
		circuit.createWire(_1, _a);
		circuit.createWire(_b, _17.outerPoints[0]);
		circuit.createWire(_15.outerPoints[1], _b);
		circuit.createWire(_c, _15.outerPoints[0]);
		circuit.createWire(_c, _16.outerPoints[0]);
		circuit.createWire(_2, _c);
		circuit.createWire(_16.outerPoints[2], _19.outerPoints[0]);
		circuit.createWire(_17.outerPoints[2], _18.outerPoints[1]);
		circuit.createWire(_f, _11);
		circuit.createWire(_d, _13);
		circuit.createWire(_e, _d);
		circuit.createWire(_18.outerPoints[0], _e);
		circuit.createWire(_10, _f);
		circuit.createWire(_19.outerPoints[1], _10);
		circuit.createWire(_12, _11);
		circuit.createWire(_18.outerPoints[2], _12);
		circuit.createWire(_14, _13);
		circuit.createWire(_19.outerPoints[2], _14);
		const _1a = this.addIO(20, -20, 'output');
		circuit.createHiddenWire(_1a, _4)
		const _1b = this.addIO(20, 0, 'output');
		circuit.createHiddenWire(_1b, _3)
		const _1c = this.addIO(-20, -20, 'input');
		circuit.createHiddenWire(_1c, _2)
		const _1d = this.addIO(-20, 0, 'input');
		circuit.createHiddenWire(_1d, _1)
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
		const _1 = circuit.createIOPoint('output', 100, -20);
		const _2 = circuit.createIOPoint('input', -120, -20);
		const _3 = circuit.createIOPoint('input', -120, -40);
		const _4 = circuit.createIOPoint('output', 100, -40);
		const _5 = circuit.createPoint(20, -20);
		const _6 = circuit.createPoint(20, 40);
		const _7 = circuit.createPoint(-80, 40);
		const _8 = circuit.createPoint(-80, -20);
		const _9 = new NotGate();
		circuit.add(_9);
		_9.transform.set(1, 0, 0, 1, -40, 40);
		inputLayer.push(_9);
		const _a = new Latch();
		circuit.add(_a);
		_a.transform.set(1, 0, 0, 1, 60, -20);
		nonInput.push(_a);
		const _b = new Latch();
		circuit.add(_b);
		_b.transform.set(1, 0, 0, 1, -40, -20);
		inputLayer.push(_b);
		circuit.createWire(_1, _a.outerPoints[1]);
		circuit.createWire(_5, _a.outerPoints[3]);
		circuit.createWire(_6, _5);
		circuit.createWire(_9.outerPoints[1], _6);
		circuit.createWire(_8, _b.outerPoints[3]);
		circuit.createWire(_7, _9.outerPoints[0]);
		circuit.createWire(_8, _7);
		circuit.createWire(_2, _8);
		circuit.createWire(_b.outerPoints[2], _3);
		circuit.createWire(_4, _a.outerPoints[0]);
		circuit.createWire(_b.outerPoints[0], _a.outerPoints[2]);
		const _c = this.addIO(20, -20, 'output');
		circuit.createHiddenWire(_c, _4)
		const _d = this.addIO(20, 0, 'output');
		circuit.createHiddenWire(_d, _1)
		const _e = this.addIO(-20, -20, 'input');
		circuit.createHiddenWire(_e, _3)
		const _f = this.addIO(-20, 0, 'input');
		circuit.createHiddenWire(_f, _2)
		this.hitbox = [-14, -34, 14, 34];
	}
}