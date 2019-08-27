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
	add('const circuit = new Circuit();');
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
		item.pos(coord);
		add(`${ id }.translate(${ coord.join(', ') });`);
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
	add('}');
	add('}');
	return code;
};