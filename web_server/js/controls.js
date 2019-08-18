import { Coord, Transform } from '/js/transform-2d.js';
import { calcDistance } from '/js/utils.js';
import { MIN_DRAG_DIST, GRID } from '/js/config.js';
import * as Shared from '/js/shared.js';
import * as Render from '/js/render.js';

const ES_NONE = 0x1;
const ES_CLICKED = 0x2;
const ES_TRANSLATING_VIEW = 0x3;
const ES_SELECTING = 0x4;
const ES_WIRING = 0x5;
const ES_TRANSLATING_OBJECT = 0x6;
let eventState = ES_NONE;

const handleClick = mouseInfo => {
	if (mouseInfo.button === 2) {
		let [x, y] = mouseInfo.pos1;
		x = Math.round(x/GRID)*GRID;
		y = Math.round(y/GRID)*GRID;
		Shared.getCircuit().createPoint(x, y);
		Render.drawCircuit();
	}
};
export const handleMousedown = mouseInfo => {
	eventState = ES_CLICKED;
};
export const handleMousemove = mouseInfo => {
	const {scrPos0, scrPos1} = mouseInfo;
	if (eventState === ES_CLICKED) {
		const [ax, ay] = scrPos0;
		const [bx, by] = scrPos1;
		if (calcDistance(ax, ay, bx, by) >= MIN_DRAG_DIST) {
			eventState = ES_NONE;
			const {button} = mouseInfo;
			if (button === 0) {
				if (mouseInfo.ctrl) {
					eventState = ES_SELECTING;
				} else if (mouseInfo.shift) {
					eventState = ES_TRANSLATING_VIEW;
				} else {
					let [x, y] = mouseInfo.pos0;
					x = Math.round(x/GRID)*GRID;
					y = Math.round(y/GRID)*GRID;
					const circuit = Shared.getCircuit();
					const obj = circuit.getPointAt(x, y);
					if (obj) {
						mouseInfo.obj = obj;
						eventState = ES_TRANSLATING_OBJECT;
					} else {
						eventState = ES_TRANSLATING_VIEW;
					}
				}
			} else if (button === 1) {
				eventState = ES_TRANSLATING_VIEW;
			} else if (button === 2) {
				const circuit = Shared.getCircuit();
				let [ax, ay] = mouseInfo.pos0;
				let [bx, by] = mouseInfo.pos1;
				ax = Math.round(ax/GRID)*GRID;
				ay = Math.round(ay/GRID)*GRID;
				bx = Math.round(bx/GRID)*GRID;
				by = Math.round(by/GRID)*GRID;
				const a = circuit.getPointAt(ax, ay) || circuit.createPoint(ax, ay);
				const b = circuit.createPoint(ax, ay);
				mouseInfo.point_a = a;
				mouseInfo.point_b = b;
				circuit.createWire(a, b);
				eventState = ES_WIRING;
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
	} else if (eventState === ES_SELECTING) {
		const {pos0, pos1} = mouseInfo;
		const [ax, ay] = pos0;
		const [bx, by] = pos1;
		const sx = bx - ax;
		const sy = by - ay;
		Shared.setSelectionSquare(ax, ay, sx, sy);
	} else if (eventState === ES_WIRING) {
		const {pos1, point_b} = mouseInfo;
		let [x, y] = pos1;
		x = Math.round(x/GRID)*GRID;
		y = Math.round(y/GRID)*GRID;
		point_b.moveTo(x, y);
	} else if (eventState === ES_TRANSLATING_OBJECT) {
		const {pos1, obj} = mouseInfo;
		let [x, y] = pos1;
		x = Math.round(x/GRID)*GRID;
		y = Math.round(y/GRID)*GRID;
		obj.moveTo(x, y);
	}
	Render.drawCircuit();
};
export const handleMouseup = mouseInfo => {
	if (eventState === ES_CLICKED) {
		handleClick(mouseInfo);
	} else if (eventState === ES_SELECTING) {
		Shared.setSelectionSquare(null, null, null, null);
		Render.drawCircuit();
	} else if (eventState === ES_WIRING) {
		const {point_a, point_b, pos1} = mouseInfo;
		const circuit = Shared.getCircuit();
		circuit.removePoint(point_b);
		let [x, y] = pos1;
		x = Math.round(x/GRID)*GRID;
		y = Math.round(y/GRID)*GRID;
		let point = circuit.getPointAt(x, y);
		if (point === null) {
			point = circuit.createPoint(x, y);
		}
		const wire = circuit.getWire(point_a, point);
		if (wire === null) {
			circuit.createWire(point_a, point);
		}
		Render.drawCircuit();
	}
};
export const handleScroll = mouseInfo => {
	const {x, y, sx, sy} = Shared.getViewport();
	const [mx, my] = mouseInfo.scrPos1;
	const dx = mx - (x + sx/2);
	const dy = my - (y + sy/2);
	Render.translateView(-dx, -dy);
	Render.scaleView(1 - mouseInfo.scroll*0.001);
	Render.translateView(dx, dy);
	Render.drawCircuit();
};