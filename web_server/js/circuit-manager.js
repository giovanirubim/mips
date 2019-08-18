import {
	Point,
	Wire
} from '/js/circuit.js';
import {
	arrayRemove
} from '/js/utils.js';

let circuit;

const setConductor = (points, conductor) => {
	const {length} = points;
	for (let i=length; i;) {
		const point = points[--i];
		if (point.isSource === 0) {
			point.conductor = conductor;
		}
	}
};
const getSourceConductor = points => {
	const {length} = points;
	for (let i=length; i;) {
		const point = points[--i];
		if (point.isSource === 1) {
			return point.conductor;
		}
	}
	return null;
};
const resetConductors = rootPoint => {
	const array = rootPoint.getConnectedPoints();
	setConductor(array, getSourceConductor(array));
};

export const useCircuit = obj => {
	circuit = obj;
};
export const addPoint = (x, y) => {
	const point = new Point();
	point.coord.set(x, y);
	return point;
};

// Função para ser usada apenas na criação automática de componentes, pois é possível assegurar que
// os condutores serão atualizados posteriormente. Não deve ser usada em ações originadas pelo
// usuário.
export const addWireFast = (a, b) => {
	const wire = new Wire(a, b);
	circuit.wires.push(wire);
	return wire;
};
export const getWire = (a, b) => {
	const {wires} = a;
	for (let i=wires.length; i--;) {
		const {wire} = wires[i];
		if (wire.other(a) === b) return wire;
	}
	return null;
};
export const removeWire = wire => {
	wire.disconnect();
	arrayRemove(circuit.wires, wire);
	const {a, b} = wire;
	resetConductors(a);
	resetConductors(b);
};

// Assume que ambos os pontos possuem os condutores atualizados.
// Verifica se já não existe um fio.
// entre os pontos, se já existe o retorna. Se não existe verifica se ambos já estão conectados a
// uma fonte cada. Se estão o retorno é false. Se não estão então seus condutores são atualizados
// e o novo fio é criado e retornado.
export const addWire = (a, b) => {
	let wire = getWire(a, b);
	if (wire !== null) return wire;
	let cond_a = a.conductor;
	let cond_b = b.conductor;
	if (cond_a !== null && cond_b !== null && cond_a !== cond_b) return false;
	if (cond_a !== null) {
		setConductor(b.getConnectedPoints(), cond_a);
	} else if (cond_b !== null) {
		setConductor(a.getConnectedPoints(), cond_b);
	}
	return addWireFast(a, b);
};