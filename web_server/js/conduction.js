import { Coord, Transform } from '/js/transform-2d.js';
import { arrayRemove, pushUnique } from '/js/utils.js';
// let last_id = 0;
// const newId = () => `_${ ++last_id }`;
const newId = () => Symbol();
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
export class Point {
	constructor() {
		this.id = newId();
		this.coord = Coord();
		this.conductor = null;
		this.isSource = 0;
		this.wires = [];
		this.selected = false;
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
			const wire = wires[i];
			if (wire.hidden === false) {
				array.push(wires[i].other(this));
			}
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
		this.id = newId();
		this.a = a;
		this.b = b;
		this.hidden = false;
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