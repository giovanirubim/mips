import { GRID } from '/js/config.js';
import { Coord } from '/js/transform-2d.js';
import { OuterIOPoint } from '/js/circuit.js';
const getReachedComponents = (root, visited) => {
	const {id} = root;
	if (visited[id]) return;
	visited[id] = true;
	if (root instanceof OuterIOPoint) {
		const {component} = root;
		const {id} = component;
		if (!visited[id]) {
			visited[id] = true;
		}
	}
	const {wires} = root;
	wires.forEach(wire => {
		getReachedComponents(wire.other(root), visited);
	});
};
const organizeIOPoints = points => {
	let x0, y0, x1, y1;
	x0 = Infinity;
	y0 = Infinity;
	x1 = -Infinity;
	y1 = -Infinity;
	points.forEach(point => {
		const [x, y] = point.coord;
		x0 = Math.min(x0, x);
		y0 = Math.min(y0, y);
		x1 = Math.max(x1, x);
		y1 = Math.max(y1, y);
	});
	let sx = x1 - x0;
	let sy = y1 - y0;
	let dif = (sx - sy)*0.5;
	if (dif > 0) {
		y0 -= dif;
		y1 += dif;
	} else if (dif < 0) {
		x0 += dif;
		x1 -= dif;
	}
	const queues = [[], [], [], []];
	points.forEach(point => {
		const [x, y] = point.coord;
		let d0 = y - y0;
		let d1 = x1 - x;
		let d2 = y1 - y;
		let d3 = x - x0;
		let d = Math.min(Math.min(d0, d1), Math.min(d2, d3));
		if (d == d0) {
			queues[0].push(point);
		} else if (d == d1) {
			queues[1].push(point);
		} else if (d == d2) {
			queues[2].push(point);
		} else if (d == d3) {
			queues[3].push(point);
		}
	});
	const calcLength = n => (n + 2 - (n&1))*GRID;
	queues[0].sort((a, b) => a.coord.x - b.coord.x);
	queues[1].sort((a, b) => a.coord.y - b.coord.y);
	queues[2].sort((a, b) => a.coord.x - b.coord.x);
	queues[3].sort((a, b) => a.coord.y - b.coord.y);
	sx = Math.max(queues[0].length, queues[2].length);
	sy = Math.max(queues[1].length, queues[3].length);
	sx = calcLength(sx);
	sy = calcLength(sy);
	return { queues, sx, sy };
};
export const encodeCircuit = (circuit, className) => {
	let code = '';
	let tabs = '';
	const coord = Coord();
	const {points, iopoints, wires, components} = circuit;
	const add = line => {
		line = line.trim();
		if (line[0] === '}') {
			tabs = tabs.substr(1);
		}
		code += tabs + line + '\n';
		if (line[line.length-1] === '{') {
			tabs += '\t';
		}
	};
	let last_id = 0;
	const createId = () => '_' + (++last_id).toString(16);
	const objMap = {};
	const newIdMap = {};
	const giveId = item => {
		const newId = createId();
		objMap[newId] = item;
		newIdMap[item.id] = newId;
		return newId;
	};
	const getNewId = item => {
		const {component} = item;
		if (component) {
			const parent = getNewId(component);
			const array = component.outerPoints;
			const index = array.indexOf(item);
			return `${ parent }.outerPoints[${ index }]`;
		} else {
			return newIdMap[item.id];
		}
	};
	add(`export class ${ className } extends ComposedComponent {`);
	add(`constructor() {`);
	add(`super();`);
	add('const circuit = new Circuit(this);');
	add('const inputLayer = [];');
	add('const nonInput = [];');
	add('this.circuit = circuit;');
	add('this.inputLayer = inputLayer;');
	add('this.nonInput = nonInput;');
	const visited = {};
	for (let i=iopoints.length; i--;) {
		const point = iopoints[i];
		const id = giveId(point);
		const {type} = point;
		point.pos(coord);
		add(`const ${ id } = circuit.createIOPoint('${ type }', ${ coord.join(', ') });`);
		if (type === 'input') {
			getReachedComponents(point, visited);
		}
	}
	for (let i=points.length; i--;) {
		const point = points[i];
		const id = giveId(point);
		point.pos(coord);
		add(`const ${ id } = circuit.createPoint(${ coord.join(', ') });`);
	}
	for (let i=components.length; i--;) {
		const item = components[i];
		const id = giveId(item);
		add(`const ${ id } = new ${ item.constructor.name }(${ item.args });`);
		add(`circuit.add(${ id });`);
		add(`${ id }.transform.set(${ item.transform.join(', ') });`);
		if (visited[item.id]) {
			add(`inputLayer.push(${ id });`);
		} else {
			add(`nonInput.push(${ id });`);
		}
	}
	for (let i=wires.length; i--;) {
		const wire = wires[i];
		const {a, b} = wire;
		const id_a = getNewId(a);
		const id_b = getNewId(b);
		add(`circuit.createWire(${ id_a }, ${ id_b });`);
	}
	const { queues, sx, sy } = organizeIOPoints(iopoints);
	const x0 = -sx*0.5;
	const y0 = -sy*0.5;
	const x1 = x0 + sx;
	const y1 = y0 + sy;
	const size = [sx, sy];
	const iToFixed = [y0, x1, y1, x0];
	const start = [x0, y0];
	const iToAxis = ['x', 'y'];
	queues.forEach((queue, i) => {
		if (!queue.length) return;
		let fixed = iToFixed[i];
		let xi = i&1;
		let yi = xi^1;
		let xl = iToAxis[xi];
		let yl = iToAxis[yi];
		let len = (queue.length - 1)*GRID;
		let x = start[xi] + Math.floor((size[xi] - len)*0.5/GRID)*GRID;
		queue.forEach(point => {
			const {type} = point;
			const id = createId();
			const other = getNewId(point);
			coord[xi] = x;
			coord[yi] = fixed;
			add(`const ${ id } = this.addIO(${ coord.join(', ') }, '${ type }');`);
			add(`circuit.createHiddenWire(${ id }, ${ other })`);
			x += GRID;
		});
	});
	const padding = GRID*0.3;
	add(`this.hitbox = [${
		x0 + padding
	}, ${
		y0 + padding
	}, ${
		x1 - padding
	}, ${
		y1 - padding
	}];`);
	add('}');
	add('}');
	return code;
};