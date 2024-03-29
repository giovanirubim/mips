import { Coord, Transform } from '/js/transform-2d.js';
import { arrayRemove, pushUnique, calcDistance } from '/js/utils.js';
import { Point, Wire } from '/js/conduction.js';
import { IOPoint, OuterIOPoint } from '/js/circuit.js';
import { Component } from '/js/component.js';
import { copyToClipboard } from '/js/clipboard.js';
import * as WordHandler from '/js/word-handlers.js';
import * as AtomicComponent from '/js/atomic-components.js';
import * as CustomComponent from '/js/custom-components.js';
import * as Shared from '/js/shared.js';
import * as Render from '/js/render.js';
import * as Encoder from '/js/encoder.js';

import {
	MIN_DRAG_DIST,
	GRID,
	ANIMATION_ROTATION_DURATION
} from '/js/config.js';

const ES_NONE = 0x1;
const ES_CLICKED = 0x2;
const ES_TRANSLATING_VIEW = 0x3;
const ES_SELECTING_SQUARE = 0x4;
const ES_WIRING = 0x5;
const ES_TRANSLATING_OBJECT = 0x6;
const ES_ROTATING_VIEW = 0x7;
const ES_ROTATING_CIRCUIT = 0x8;
const selection = [];
const prev = Coord();
const keyHandlerMap = {};
const circuits = [];

let eventState = ES_NONE;
let animation = null;

const setEvent = code => {
	// switch (code) {
	// 	case 0x1: console.log('NONE'); break;
	// 	case 0x2: console.log('CLICKED'); break;
	// 	case 0x3: console.log('TRANSLATING_VIEW'); break;
	// 	case 0x4: console.log('SELECTING_SQUARE'); break;
	// 	case 0x5: console.log('WIRING'); break;
	// 	case 0x6: console.log('TRANSLATING_OBJECT'); break;
	// }
	eventState = code;
};
const eventEnded = () => {
	setEvent(ES_NONE);
	saveToStorage();
};
const keyEventToStr = (key, ctrl, shift) => {
	return `${key}-${ ctrl|0 }-${ shift|0 }`;
};
const addKeyHandler = (key, ctrl, shift, handler) => {
	const str = keyEventToStr(key, ctrl, shift);
	keyHandlerMap[str] = handler;
};
const pickComponentByName = name => {
	name = name.trim().toLowerCase();
	let result = null;
	let resultName = null;
	const len = name.length;
	for (let type in AtomicComponent) {
		if (type.toLowerCase().substr(0, len) === name) {
			if (result === null || type.length < resultName.length) {
				result = AtomicComponent[type];
				resultName = type;
			}
		}
	}
	for (let type in CustomComponent) {
		if (type.toLowerCase().substr(0, len) === name) {
			if (result === null || type.length < resultName.length) {
				result = CustomComponent[type];
				resultName = type;
			}
		}
	}
	for (let type in WordHandler) {
		if (type.toLowerCase().substr(0, len) === name) {
			if (result === null || type.length < resultName.length) {
				result = WordHandler[type];
				resultName = type;
			}
		}
	}
	return result;
};
const triggerKey = (key, ctrl, shift, info) => {
	const str = keyEventToStr(key, ctrl, shift);
	const handler = keyHandlerMap[str];
	if (handler) {
		handler(info);
		Render.drawCircuit();
		return true;
	}
	return false;
};
const addToSelection = item => {
	if (item.selected === true) return;
	item.selected = true;
	selection.push(item);
};
const removeFromSelection = item => {
	if (item.selected === false) return;
	item.selected = false;
	arrayRemove(selection, item);
};
const remove = item => {
	if (item.selected === true) {
		removeFromSelection(item);
	}
	Shared.getCircuit().remove(item);
};
const toggleSelection = item => {
	if (item.selected === true) {
		removeFromSelection(item);
	} else {
		addToSelection(item);
	}
};
const clearSelection = () => {
	for (let i=selection.length; i--;) {
		selection[i].selected = false;
	}
	selection.length = 0;
};
const handleClick = mouseInfo => {
	const {button} = mouseInfo;
	if (button === 0) {
		let [x, y] = mouseInfo.pos1;
		const circuit = Shared.getCircuit();
		let item = circuit.getAt(x, y, {
			point: true,
			innerio: true,
			component: true,
			wire: true
		});
		if (item !== null) {
			if (mouseInfo.shift) {
				toggleSelection(item);
			} else {
				clearSelection();
				addToSelection(item);
			}
		} else if (!mouseInfo.shift) {
			clearSelection();
		}
	}
	Render.drawCircuit();
};
const removeDoubles = () => {
	const circuit = Shared.getCircuit();
	const coord = Coord();

	// Mapa que usa a coordenada como chave e referencia o grupo daquela coordenada
	const map = {};

	// Contém todos os grupos com pelo menos 2 elementos
	// Um grupo é um vetor de pontos que estão na mesma coordenada
	const groups = [];

	// Adiciona um ponto em seu grupo
	const add = point => {
		point.pos(coord);
		const key = coord.round().join(',');

		// Se não existe um grupo, cria
		const group = map[key] || (map[key] = []);

		group.push(point);

		// Grupo ao conter dois pontos vai para o vetor de grupos
		if (group.length === 2) {
			groups.push(group);
		}
	};
	const {points, iopoints, components} = circuit;

	// Adiciona todos os pontos e i/o's em seus grupos
	for (let i=points.length; i--;) {
		add(points[i]);
	}
	for (let i=iopoints.length; i--;) {
		add(iopoints[i]);
	}
	for (let i=components.length; i--;) {
		const points = components[i].outerPoints;
		for (let i=points.length; i--;) {
			add(points[i]);
		}
	}

	for (let i=groups.length; i--;) {
		const group = groups[i];

		// Pontos de fiação
		const points = [];

		// Pontos de entrada/saída
		const iopoints = [];

		// Vizinhos dos pontos que estão na mesma coordenada
		const neighbors = [];

		for (let i=group.length; i--;) {
			const point = group[i];

			// Adiciona seus vizinhos no vetor de vizinhos sem repetição
			const array = point.getNeighbors([]);
			for (let i=array.length; i--;) {
				pushUnique(neighbors, array[i]);
			}

			// Insere no respectivo vetor
			if (point instanceof IOPoint) {
				iopoints.push(point);
			} else {
				points.push(point);
			}

			// Remove todos os fios conectando o ponto
			circuit.disconnectPoint(point);
		}

		// Garante que nenhum ponto que está na coordenada apareça no vetor de vizinhos
		for (let i=group.length; i--;) {
			arrayRemove(neighbors, group[i]);
		}

		// Ponto ao qual todos os vizinhos serão conectados
		const rootPoint = iopoints.length === 0 ? points[0] : iopoints[0];

		// Remove todos os pontos (a não ser que seja a raiz)
		for (let i=points.length; i--;) {
			const point = points[i];
			if (point !== rootPoint) {
				remove(point);
			}
		}

		// Connecta todos os vizinhos ao ponto raiza
		for (let i=neighbors.length; i--;) {	
			const point = neighbors[i];
			circuit.createWire(point, rootPoint);
		}
	}
};
const duplicateSelection = () => {
	const array = selection.slice();
	const circuit = Shared.getCircuit();
	const result = [];
	const otherMap = {};
	const relate = (a, b) => {
		otherMap[a.id] = b;
		otherMap[b.id] = a;
	};
	const getClone = item => otherMap[item.id];
	const queue = [];
	const isQueued = {};
	const addToQueue = point => {
		isQueued[point.id] = true;
		pushUnique(queue, point);
	};
	const duplicateComponent = item => {
		const clone = item.clone();
		circuit.add(clone);
		addToSelection(clone);
		const a = item.outerPoints;
		const b = clone.outerPoints;
		for (let i=b.length; i--;) {
			addToQueue(a[i]);
			relate(a[i], b[i]);
		}
	};
	const duplicatePoint = point => {
		const [x, y] = point.coord;
		const clone = circuit.createPoint(x, y);
		relate(point, clone);
		addToSelection(clone);
		addToQueue(point);
	};
	const duplicateIOPoint = point => {
		const [x, y] = point.coord;
		const {type} = point;
		const clone = circuit.createIOPoint(type, x, y);
		relate(point, clone);
		addToSelection(clone);
		addToQueue(point);
	};
	clearSelection();
	for (let i=array.length; i--;) {
		const item = array[i];
		if (item instanceof Component) {
			duplicateComponent(item);
		} else if (item instanceof IOPoint) {
			duplicateIOPoint(item);
		} else if (item instanceof Point) {
			duplicatePoint(item);
		}
	}
	const wireCloned = {};
	for (let i=queue.length; i--;) {
		const point = queue[i];
		const {wires} = point;
		for (let i=wires.length; i--;) {
			const wire = wires[i];
			const {id} = wire;
			const other = wire.other(point);
			if (wireCloned[id] === true) {
				continue;
			}
			if (isQueued[other.id] !== true) {
				continue;
			}
			const a = getClone(wire.a);
			const b = getClone(wire.b);
			circuit.createWire(a, b);
			wireCloned[id] = true;
		}
	}
};
const trim = () => {
	const circuit = Shared.getCircuit();
	const {points} = circuit;
	const array = [];
	for (let i=points.length; i--;) {
		const point = points[i];
		const {wires} = point;
		if (wires.length < 2) {
			array.push(point);
		}
	}
	for (let i=array.length; i--;) {
		remove(array[i]);
	}
};
const saveToStorage = () => {
	const circuit = Shared.getCircuit();
	const code = Encoder.encodeCircuit(circuit);
	localStorage.setItem('code', code);
};
const animateViewRotation = mouseInfo => {
	let zoom = mouseInfo.zoom.clone();
	const ini = new Date();
	const ang = mouseInfo.scroll < 0 ? Math.PI*0.5 : - Math.PI*0.5;
	animation = setInterval(() => {
		let t = (new Date() - ini)/ANIMATION_ROTATION_DURATION;
		if (t >= 1) {
			t = 1;
		} else {
			t = (1 - Math.cos(t*Math.PI))*0.5;
		}
		Render.setZoom(zoom);
		Render.rotateView(t*ang);
		Render.drawCircuit();
		if (t === 1) {
			clearInterval(animation);
			animation = null;
			eventEnded();
		}
	}, 0);
};
const centralizeView = () => {
	const circuit = Shared.getCircuit();
	const pos_a = Coord();
	const pos_b = Coord();
	const {components, iopoints, points} = circuit;
	let
		x0 = Infinity,
		y0 = Infinity,
		x1 = -Infinity,
		y1 = -Infinity;
	for (let i=components.length; i--;) {
		components[i].getHitbox(pos_a, pos_b);
		const [ax, ay] = pos_a;
		const [bx, by] = pos_b;
		x0 = Math.min(ax, x0);
		y0 = Math.min(ay, y0);
		x1 = Math.max(bx, x1);
		y1 = Math.max(by, y1);
	}
	for (let i=points.length; i--;) {
		points[i].pos(pos_a);
		const [x, y] = pos_a;
		x0 = Math.min(x, x0);
		y0 = Math.min(y, y0);
		x1 = Math.max(x, x1);
		y1 = Math.max(y, y1);
	}
	for (let i=iopoints.length; i--;) {
		iopoints[i].pos(pos_a);
		const [x, y] = pos_a;
		x0 = Math.min(x, x0);
		y0 = Math.min(y, y0);
		x1 = Math.max(x, x1);
		y1 = Math.max(y, y1);
	}
	const {x, y, sx, sy} = Shared.getViewport();
	pos_a[0] = (x0 + x1)*0.5;
	pos_a[1] = (y0 + y1)*0.5;
	Render.projectPosition(pos_a);
	let dx = sx*0.5 - pos_a[0];
	let dy = sy*0.5 - pos_a[1];
	Render.translateView(dx, dy);
};
export const handleMousedown = mouseInfo => {
	if (eventState !== ES_NONE) return;
	setEvent(ES_CLICKED);
};
export const handleMousemove = mouseInfo => {
	const {scrPos0, scrPos1} = mouseInfo;
	if (eventState === ES_CLICKED) {
		const [ax, ay] = scrPos0;
		const [bx, by] = scrPos1;
		if (calcDistance(ax, ay, bx, by) >= MIN_DRAG_DIST) {
			const {button} = mouseInfo;
			if (button === 0) {
				if (mouseInfo.shift) {
					setEvent(ES_SELECTING_SQUARE);
				} else if (mouseInfo.ctrl) {
					setEvent(ES_TRANSLATING_VIEW);
				} else {
					const [x, y] = mouseInfo.pos0;
					const circuit = Shared.getCircuit();
					let obj = circuit.getAt(x, y, {
						point: true,
						innerio: true,
						component: true
					});
					if (obj !== null) {
						mouseInfo.obj = obj;
						setEvent(ES_TRANSLATING_OBJECT);
						const rx = Math.round(x/GRID)*GRID;
						const ry = Math.round(y/GRID)*GRID;
						prev.set(rx, ry);
					} else {
						setEvent(ES_TRANSLATING_VIEW);
					}
				}
			} else if (button === 1) {
				setEvent(ES_TRANSLATING_VIEW);
			} else if (button === 2) {
				const circuit = Shared.getCircuit();
				let [x, y] = mouseInfo.pos0;
				let [bx, by] = mouseInfo.pos1;
				const ax = Math.round(x/GRID)*GRID;
				const ay = Math.round(y/GRID)*GRID;
				bx = Math.round(bx/GRID)*GRID;
				by = Math.round(by/GRID)*GRID;
				let a = circuit.getAt(ax, ay, {
					point: true,
					innerio: true,
					outerio: true,
				});
				if (a === null) {
					const wire = circuit.getAt(x, y, {wire: true});
					a = circuit.createPoint(ax, ay);
					if (wire !== null) {
						const s = wire.a;
						const e = wire.b;
						remove(wire);
						circuit.createWire(s, a);
						circuit.createWire(a, e);
					}
				}
				const b = circuit.createPoint(ax, ay);
				mouseInfo.point_a = a;
				mouseInfo.point_b = b;
				circuit.createWire(a, b);
				setEvent(ES_WIRING);
			}
		}
	}
	if (eventState === ES_CLICKED || eventState === ES_NONE) return;
	if (eventState === ES_TRANSLATING_VIEW) {
		const {zoom} = mouseInfo;
		const dx = scrPos1[0] - scrPos0[0];
		const dy = scrPos1[1] - scrPos0[1];
		Render.setZoom(zoom);
		Render.translateView(dx, dy);
	} else if (eventState === ES_SELECTING_SQUARE) {
		const {pos0, pos1} = mouseInfo;
		const [ax, ay] = pos0;
		const [bx, by] = pos1;
		const sx = Math.abs(bx - ax);
		const sy = Math.abs(by - ay);
		const x = Math.min(ax, bx);
		const y = Math.min(ay, by);
		Shared.setSelectionSquare(x, y, sx, sy);
	} else if (eventState === ES_WIRING) {
		const {pos1, point_b} = mouseInfo;
		let [x, y] = pos1;
		x = Math.round(x/GRID)*GRID;
		y = Math.round(y/GRID)*GRID;
		point_b.moveTo(x, y);
	} else if (eventState === ES_TRANSLATING_OBJECT) {
		const {pos1, obj} = mouseInfo;
		let [ax, ay] = prev;
		let [bx, by] = pos1;
		bx = Math.round(bx/GRID)*GRID;
		by = Math.round(by/GRID)*GRID;
		let dx = bx - ax;
		let dy = by - ay;
		if (obj.selected === true && selection.length > 1) {
			for (let i=selection.length; i--;) {
				const item = selection[i];
				if ((item instanceof Point) || (item instanceof Component)) {
					item.translate(dx, dy);
				}
			}
		} else if ((obj instanceof Point) || (obj instanceof Component)) {
			obj.translate(dx, dy);
		}
		prev.set(bx, by);
	}
	Render.drawCircuit();
};
export const handleMouseup = mouseInfo => {
	if (eventState === ES_CLICKED) {
		handleClick(mouseInfo);
	} else if (eventState === ES_SELECTING_SQUARE) {
		const circuit = Shared.getCircuit();
		const {x, y, sx, sy} = Shared.getSelectionSquare();
		const points = circuit.getIn(x, y, x + sx, y + sy, {
			point: true,
			innerio: true
		});
		const components = circuit.getIn(x, y, x + sx, y + sy, {
			component: true
		});
		if (mouseInfo.ctrl === true) {
			for (let i=points.length; i--;) {
				removeFromSelection(points[i]);
			}
			for (let i=components.length; i--;) {
				removeFromSelection(components[i]);
			}
		} else {
			for (let i=points.length; i--;) {
				addToSelection(points[i]);
			}
			for (let i=components.length; i--;) {
				addToSelection(components[i]);
			}
		}
		Shared.setSelectionSquare(null, null, null, null);
		Render.drawCircuit();
	} else if (eventState === ES_WIRING) {
		const {point_a, point_b, pos1} = mouseInfo;
		const circuit = Shared.getCircuit();
		let [x, y] = pos1;
		x = Math.round(x/GRID)*GRID;
		y = Math.round(y/GRID)*GRID;
		remove(point_b);
		let point = circuit.getAt(x, y, {
			point: true,
			outerio: true,
			innerio: true
		}) || circuit.createPoint(x, y);
		const wire = circuit.getWire(point_a, point);
		if (wire === null && point_a !== point) {
			circuit.createWire(point_a, point);
		}
		removeDoubles();
		Render.drawCircuit();
	} else if (eventState === ES_TRANSLATING_OBJECT) {
		removeDoubles();
		Render.drawCircuit();
	}
	eventEnded();
};
export const handleScroll = mouseInfo => {
	if (eventState !== ES_NONE) return;
	if (mouseInfo.ctrl === true && mouseInfo.shift === true) {
		setEvent(ES_ROTATING_VIEW)
		animateViewRotation(mouseInfo);
	} else {
		const {x, y, sx, sy} = Shared.getViewport();
		const [mx, my] = mouseInfo.scrPos1;
		const dx = mx - (x + sx/2);
		const dy = my - (y + sy/2);
		Render.translateView(-dx, -dy);
		Render.scaleView(1 - mouseInfo.scroll*0.02);
		Render.translateView(dx, dy);
		Render.drawCircuit();
	}
};
export const handleDblclick = mouseInfo => {
	if (eventState !== ES_NONE) return;
	let [x, y] = mouseInfo.pos1;
	const circuit = Shared.getCircuit();
	let component = circuit.getAt(x, y, { component: true });
	if (component !== null && component.circuit) {
		circuits.push(circuit);
		Shared.setCircuit(component.circuit);
		centralizeView();
	} else {
		x = Math.round(x/GRID)*GRID;
		y = Math.round(y/GRID)*GRID;
		Shared.setCursor(x, y);
	}
	Render.drawCircuit();
};
export const handleKeydown = e => {
	if (eventState !== ES_NONE) return;
	const key = e.key.toLowerCase().replace('arrow', '');
	const ctrl = e.ctrlKey;
	const shift = e.shiftKey;
	if (triggerKey(key, ctrl, shift)) {
		e.preventDefault();
		e.stopPropagation();
	}
};
addKeyHandler('delete', 0, 0, () => {
	const circuit = Shared.getCircuit();
	for (let i=selection.length; i--;) {
		const item = selection[i];
		remove(item);
	}
});
addKeyHandler('d', 1, 0, () => {
	const oldToNew = {};
	const newToOld = {};
	const array = [];
	duplicateSelection();
});
addKeyHandler('s', 1, 0, () => {
	const circuit = Shared.getCircuit();
	let str = prompt('Class name [,label]');
	if (!str) return;
	let [className, label] = str.split(',');
	className = className.trim();
	if (!className) return;
	if (label) label = label.trim();
	const code = Encoder.encodeCircuit(circuit, className, label);
	copyToClipboard(code);
});
addKeyHandler('t', 0, 0, trim);
addKeyHandler('home', 0, 0, () => {
	const {x, y, sx, sy} = Shared.getViewport();
	const coord = Shared.getCursor().clone();
	Render.projectPosition(coord);
	let dx = sx*0.5 - coord[0];
	let dy = sy*0.5 - coord[1];
	Render.translateView(dx, dy);
});
addKeyHandler('0', 1, 0, () => {
	const scale = Render.getScale();
	Render.scaleView(2.2/scale);
});
addKeyHandler('i', 0, 0, () => {
	const [x, y] = Shared.getCursor();
	const point = Shared.getCircuit().createIOPoint('input', x, y);
	clearSelection();
	addToSelection(point);
	Render.drawCircuit();
});
addKeyHandler('o', 0, 0, () => {
	const [x, y] = Shared.getCursor();
	const point = Shared.getCircuit().createIOPoint('output', x, y);
	clearSelection();
	addToSelection(point);
	Render.drawCircuit();
});
const animateCircuitRotation = (cx, cy, array) => {
	const rotation = Transform();
	const ini = new Date();
	animation = setInterval(() => {
		let t = (new Date() - ini)/ANIMATION_ROTATION_DURATION;
		if (t >= 1) {
			t = 1;
		} else {
			t = (1 - Math.cos(t*Math.PI))*0.5;
		}
		rotation.set(1, 0, 0, 1, 0, 0);
		rotation.translate(-cx, -cy)
		rotation.rotate(Math.PI*0.5*t)
		rotation.translate(cx, cy);
		for (let i=array.length; i--;) {
			const {item, current, clone} = array[i];
			current.set(clone).apply(rotation);
		}
		Render.drawCircuit();
		if (t === 1) {
			clearInterval(animation);
			animation = null;
			eventEnded();
			for (let i=array.length; i--;) {
				array[i].current.round();
			}
		}
	}, 0);
};
addKeyHandler('r', 1, 0, () => {
	if (eventState !== ES_NONE) return;
	const coord = Coord();
	const array = [];
	let [ax, ay, bx, by] = [Infinity, Infinity, -Infinity, -Infinity];
	for (let i=selection.length; i--;) {
		const item = selection[i];
		if (item instanceof Wire) {
			continue;
		}
		const current = item.transform || item.coord;
		const clone = current.clone();
		array.push({item, current, clone});
		const [x, y] = item.pos(coord);
		ax = Math.min(ax, x);
		ay = Math.min(ay, y);
		bx = Math.max(bx, x);
		by = Math.max(by, y);
	}
	const cx = Math.round((ax + bx)*0.5/GRID)*GRID;
	const cy = Math.round((ay + by)*0.5/GRID)*GRID;
	animateCircuitRotation(cx, cy, array);
	setEvent(ES_ROTATING_CIRCUIT);
});
addKeyHandler('a', 1, 0, () => {
	const circuit = Shared.getCircuit();
	const {points, iopoints, components} = circuit;
	for (let i=points.length; i;) {
		addToSelection(points[--i]);
	}
	for (let i=iopoints.length; i;) {
		addToSelection(iopoints[--i]);
	}
	for (let i=components.length; i;) {
		addToSelection(components[--i]);
	}
});
addKeyHandler('a', 0, 0, () => {
	const circuit = Shared.getCircuit();
	let str = prompt('Component') || '';
	while (str.indexOf('  ') !== -1) str = str.replace('  ', ' ');
	str = str.trim();
	if (!str) return;
	str = str.split(' ');
	const Type = pickComponentByName(str[0]);
	if (Type === null) return;
	const component = new Type(...str.slice(1));
	const [x, y] = Shared.getCursor();
	component.translate(x, y);
	circuit.add(component);
	clearSelection();
	addToSelection(component);
});
addKeyHandler('left', 0, 0, () => {
	for (let i=selection.length; i--;) {
		const item = selection[i];
		if (!(item instanceof Wire)) {
			item.translate(-GRID, 0);
		}
	}
});
addKeyHandler('right', 0, 0, () => {
	for (let i=selection.length; i--;) {
		const item = selection[i];
		if (!(item instanceof Wire)) {
			item.translate(+GRID, 0);
		}
	}
});
addKeyHandler('up', 0, 0, () => {
	for (let i=selection.length; i--;) {
		const item = selection[i];
		if (!(item instanceof Wire)) {
			item.translate(0, -GRID);
		}
	}
});
addKeyHandler('down', 0, 0, () => {
	for (let i=selection.length; i--;) {
		const item = selection[i];
		if (!(item instanceof Wire)) {
			item.translate(0, +GRID);
		}
	}
});
addKeyHandler('escape', 0, 0, () => {
	clearSelection();
});
addKeyHandler('l', 0, 0, () => {
	const array = [];
	const coord = Coord();
	const {length} = selection;
	let x = Infinity;
	let y = 0;
	for (let i=0; i<length; ++i) {
		const item = selection[i];
		if (item instanceof Wire) {
			continue;
		}
		array.push(item);
		const [px, py] = item.pos(coord);
		if (px < x) {
			x = px;
			y = py;
		}
	}
	if (array.length < 2) return;
	array.sort((a, b) => {
		a = a.pos(coord)[0];
		b = b.pos(coord)[0];
		return a - b;
	});
	const pos_a = Coord();
	const pos_b = Coord();

	const calcWidth = item => {
		if (item.getHitbox !== undefined) {
			item.getHitbox(pos_a, pos_b);
		} else {
			item.pos(pos_a);
			item.pos(pos_b);
		}
		return Math.ceil((pos_b[0] - pos_a[0])/GRID)*GRID;
	};
	const calcLeft = sx => Math.floor(sx*0.5/GRID)*GRID;

	const first = array[0];
	const sx = calcWidth(first);
	const sl = calcLeft(sx);
	const sr = sx - sl;
	first.moveTo(x, y);
	x += sr + GRID;
	
	for (let i=1; i<array.length; ++i) {
		const item = array[i];
		const sx = calcWidth(item);
		const sl = calcLeft(sx);
		const sr = sx - sl;
		x += sl;
		item.moveTo(x, y);
		x += sr + GRID;
	}
});
addKeyHandler('l', 1, 0, () => {
	const visited = {};
	const explore = item => {
		const {id} = item;
		if (visited[id] === true) {
			return;
		}
		visited[id] = true;
		if (item instanceof Wire) {
			const {a, b} = item;
			explore(a);
			explore(b);
			return;
		}
		if (!(item instanceof OuterIOPoint)) {
			addToSelection(item);
		}
		if (item instanceof Point) {
			const {wires} = item;
			for (let i=wires.length; i--;) {
				const wire = wires[i];
				explore(wire.other(item));
			}
			if (item.component) {
				explore(item.component);
			}
		}
		if (item instanceof Component) {
			const points = item.outerPoints;
			for (let i=points.length; i--;) {
				const point = points[i];
				explore(point);
			}
		}
	};
	for (let i=selection.length; i--;) {
		explore(selection[i]);
	}
});
addKeyHandler('pageup', 0, 0, () => {
	if (circuits.length === 0) {
		return;
	}
	const index = circuits.length - 1;
	const circuit = circuits.splice(index, 1)[0];
	Shared.setCircuit(circuit);
	centralizeView();
});
addKeyHandler('f1', 0, 0, () => {
	console.log(selection[0]);
});
addKeyHandler('e', 0, 0, () => {
	const circuit = Shared.getCircuit();
	const array = selection.slice();
	clearSelection();
	for (let i=array.length; i--;) {
		const item = array[i];
		if (item instanceof Point) {
			const [x, y] = item.coord;
			const point = circuit.createPoint(x, y);
			circuit.createWire(item, point);
			addToSelection(point);
		}
	}
});
addKeyHandler('d', 0, 0, removeDoubles);
addKeyHandler('backspace', 0, 0, () => {
	const circuit = Shared.getCircuit();
	const array = [];
	for (let i=selection.length; i--;) {
		const point = selection[i];
		if (point instanceof Point && point.wires.length === 2) {
			array.push(point);
		}
	}
	for (let i=array.length; i--;) {
		const point = array[i];
		const [wa, wb] = point.wires;
		const a = wa.other(point);
		const b = wb.other(point);
		remove(point);
		circuit.createWire(a, b);
	}
});
addKeyHandler('r', 0, 0, () => {
	if (selection.length < 2) return;
	const circuit = Shared.getCircuit();
	const coord = Coord();
	const a = selection[selection.length - 2];
	const b = selection[selection.length - 1];
	if ((a instanceof Wire) || (b instanceof Wire)) {
		return;
	}
	const [ax, ay] = a.pos(coord);
	const [bx, by] = b.pos(coord);
	const dx = bx - ax;
	const dy = by - ay;
	let x = bx + dx;
	let y = by + dy;
	if (dx === 0 && dy === 0) return;
	for (;; x += dx, y += dy) {
		const item = circuit.getAt(x, y, {
			point: true,
			innerio: true,
			component: true
		});
		if (item === null) break;
		addToSelection(item);
	}
});
const incInnerSpace = (axis, inc) => {
	const map = {x: 0, y: 1};
	const iAxis = map[axis];
	const jAxis = iAxis^1;
	const array = [];
	const coord = Coord();
	for (let i=selection.length; i--;) {
		const item = selection[i];
		if (item instanceof Wire) {
			continue;
		}
		item.pos(coord).round();
		const p1 = coord[iAxis];
		const p2 = coord[jAxis];
		array.push({ item, p1, p2 });
	}
	array.sort((a, b) => (a.p1 - b.p1) || (a.p2 - b.p2));
	coord.set(0, 0);
	for (let i=1; i<array.length; ++i) {
		coord[iAxis] = i*inc*GRID;
		const [dx, dy] = coord;
		array[i].item.translate(dx, dy);
	}
};
addKeyHandler('+', 1, 0, () => {
	incInnerSpace('x', 1);
});
addKeyHandler('-', 1, 0, () => {
	incInnerSpace('x', -1);
});
addKeyHandler('+', 0, 1, () => {
	incInnerSpace('y', 1);
});
addKeyHandler('-', 0, 1, () => {
	incInnerSpace('y', -1);
});
addKeyHandler('t', 0, 1, () => {
	if (selection.length !== 1) return;
	const item = selection[0];
	let label = prompt('Label');
	if (label) label = label.trim();
	if (!label) return;
	item.label = label;
});
addKeyHandler('r', 0, 1, () => {
	for (let i=selection.length; i--;) {
		const point = selection[i];
		if ((point instanceof IOPoint) === false) {
			continue;
		}
		const {labelProp} = point;
		const {dx, dy} = labelProp;
		labelProp.dx = dy;
		labelProp.dy = - dx;
		if (labelProp.dx > 0) {
			labelProp.align = 'left';
		} else {
			labelProp.align = 'right';
		}
		if (labelProp.dy > 0) {
			labelProp.baseline = 'top';
		} else {
			labelProp.baseline = 'bottom';
		}
	}
});
addKeyHandler('c', 0, 0, centralizeView);