import { Conductor } from '/js/conduction.js';
import { Component } from '/js/component.js';
import { GRID } from '/js/config.js';
export class Splitter extends Component {
	constructor(n_bits) {

		super();

		n_bits = parseInt(n_bits);
		this.n_bits = n_bits;
		this.args = n_bits;

		const workspace = new Uint32Array(n_bits + 1);
		const {buffer} = workspace;
		this.workspace = workspace;

		const sx = 2*GRID;
		const sy = (n_bits + 1)*GRID;
		const padding = GRID*0.3;
		const ax = - GRID;
		const ay = - Math.floor(sy*0.5/GRID)*GRID;
		const bx = ax + sx;
		const by = ay + sy;

		this.hitbox = [ax+padding, ay+padding, bx-padding, by-padding];

		this.addIO(ax, ay + Math.floor(sy*0.5/GRID)*GRID, 'input', 'input');
		for (let i=n_bits; i--;) {
			const y = ay + (i + 1)*GRID;
			const conductor = new Conductor(32, buffer, 1 + i);	
			this.addIO(bx, y, 'output', conductor);
		}
	}
	readInputs() {
		const {workspace, input} = this;
		const val = input[0];
		const changed = (val !== workspace[0])|0;
		workspace[0] = val;
		return this.inputChanged = changed;
	}
	tic() {
		const {workspace, n_bits} = this;
		const val = workspace[0];
		for (let i=n_bits; i--;) {
			workspace[i+1] = (val >>> i)&1;
		}
		return 0;
	}
	clone() {
		const clone = new Splitter(this.n_bits);
		clone.transform.set(this.transform);
		return clone;
	}
}
export class Joinner extends Component {
	constructor(n_bits) {

		super();

		n_bits = parseInt(n_bits);
		this.n_bits = n_bits;
		this.args = n_bits;

		const workspace = new Uint32Array(n_bits + 1);
		const {buffer} = workspace;
		this.workspace = workspace;

		const sx = 2*GRID;
		const sy = (n_bits + 1)*GRID;
		const padding = GRID*0.3;
		const ax = - GRID;
		const ay = - Math.floor(sy*0.5/GRID)*GRID;
		const bx = ax + sx;
		const by = ay + sy;

		this.hitbox = [ax+padding, ay+padding, bx-padding, by-padding];

		const conductor = new Conductor(32, buffer, n_bits);	
		this.addIO(bx, ay + Math.floor(sy*0.5/GRID)*GRID, 'output', conductor);
		for (let i=n_bits; i--;) {
			const y = ay + (i + 1)*GRID;
			this.addIO(ax, y, 'input', 'bit'+i);
		}
	}
	readInputs() {
		const {workspace, n_bits} = this;
		let inputChanged = 0;
		for (let i=n_bits; i--;) {
			const bit = this['bit'+i][0];
			inputChanged |= bit !== workspace[i];
			workspace[i] = bit;
		}
		return this.inputChanged = inputChanged;
	}
	tic() {
		const {workspace, n_bits} = this;
		workspace[n_bits] = 0;
		for (let i=n_bits; i--;) {
			workspace[n_bits] |= workspace[i] << i;
		}
		return 0;
	}
	clone() {
		const clone = new Joinner(this.n_bits);
		clone.transform.set(this.transform);
		return clone;
	}
}