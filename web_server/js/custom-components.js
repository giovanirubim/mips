import * as AtomicComponent from '/js/atomic-components.js';
import { Circuit, ComposedComponent } from '/js/circuit.js';
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