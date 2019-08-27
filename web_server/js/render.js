import * as Shared from '/js/shared.js';
import * as Drawings from '/js/drawings.js';
import { Coord, Transform } from '/js/transform-2d.js';
import {
	POINT_RADIUS,
	IO_POINT_RADIUS,
	WIRE_WIDTH,
	GRID,
	GRID_WIDTH,
	BACKGROUND_COLOR,
	GRID_COLOR,
	SELECTION_SQUARE_BORDER_WIDTH,
	SELECTION_SQUARE_BORDER_COLOR,
	SELECTION_SQUARE_COLOR,
	SELECTED_FILL_COLOR,
	SELECTED_STROKE_COLOR,
	COMPONENT_LINE_COLOR,
	COMPONENT_COLOR,
	CURSOR_COLOR,
	COMPONENT_LINE_WIDTH
} from '/js/config.js';

let ctx = null;

// Viewport
let x = null;
let y = null;
let sx = null;
let sy = null;
let scale = null;

let circuit = null;

// Auxiliares
const pos = Coord();
const pos_a = Coord();
const pos_b = Coord();

// Matrizes de transformação
const zoom = Transform().set(2.2, 0, 0, 2.2, 0, 0);
const screenMap = Transform();
const transform = Transform();

// Constantes numéricas
const PI = Math.PI;
const ROT_0 = PI*0.0;
const ROT_1 = PI*0.5;
const ROT_2 = PI*1.0;
const ROT_3 = PI*1.5;
const ROT_4 = PI*2.0;

let screenMapUpdated = false;
let transformUpdated = false;

const updateScreenMap = () => {
	if (screenMapUpdated === true) return;
	screenMap[4] = sx*0.5;
	screenMap[5] = sy*0.5;
	screenMapUpdated = true;
	transformUpdated = false;
};
const updateTransform = () => {
	updateScreenMap();
	if (transformUpdated === true) return;
	transform.clear().apply(zoom).apply(screenMap);
	transformUpdated = true;
};
const useTransform = () => {
	updateTransform();
	const [a, b, c, d, e, f] = transform;
	ctx.setTransform(a, b, c, d, e, f);
};
const valueToColor = value => {
	if (value === null) return '#d32';
	if (value === 0) return '#345';
	return '#0f7';
};
const drawPoint = point => {
	if (point.selected === true) {
		ctx.fillStyle = SELECTED_STROKE_COLOR;
	} else {
		ctx.fillStyle = valueToColor(point.val());
	}
	const [x, y] = point.coord;
	ctx.beginPath();
	if (point.wires.length !== 2) {
		ctx.arc(x, y, POINT_RADIUS, ROT_0, ROT_4);
	} else {
		ctx.arc(x, y, WIRE_WIDTH*0.75, ROT_0, ROT_4);
	}
	ctx.fill();
};
const drawWire = wire => {
	const {a, b} = wire;
	if (wire.selected === true) {
		ctx.strokeStyle = SELECTED_STROKE_COLOR;
	} else {
		ctx.strokeStyle = valueToColor(a.val());
	}
	a.pos(pos_a);
	b.pos(pos_b);
	const [ax, ay] = pos_a;
	const [bx, by] = pos_b;
	ctx.beginPath();
	ctx.moveTo(ax, ay);
	ctx.lineTo(bx, by);
	ctx.stroke();
};
const loadViewport = () => {
	const viewport = Shared.getViewport();
	if (viewport.sx !== sx || viewport.sy !== sy || viewport.x !== x || viewport.y !== y) {
		x  = viewport.x;
		y  = viewport.y;
		sx = viewport.sx;
		sy = viewport.sy;
		screenMapUpdated = false;
	}
};
const calcCurrentScale = () => {
	const [x, y] = zoom;
	scale = Math.sqrt(x*x + y*y);
};
const drawGrid = () => {
	let x0, y0, x1, y1, x, y;
	[x0, y0] = pos.set(0, 0).reverse(transform);
	[x1, y1] = pos;
	[x, y] = pos.set(sx, 0).reverse(transform);
	x0 = Math.min(x0, x);
	y0 = Math.min(y0, y);
	x1 = Math.max(x1, x);
	y1 = Math.max(y1, y);
	[x, y] = pos.set(0, sy).reverse(transform);
	x0 = Math.min(x0, x);
	y0 = Math.min(y0, y);
	x1 = Math.max(x1, x);
	y1 = Math.max(y1, y);
	[x, y] = pos.set(sx, sy).reverse(transform);
	x0 = Math.min(x0, x);
	y0 = Math.min(y0, y);
	x1 = Math.max(x1, x);
	y1 = Math.max(y1, y);
	x0 = Math.floor(x0/GRID)*GRID;
	y0 = Math.floor(y0/GRID)*GRID;
	x1 = Math.ceil(x1/GRID)*GRID;
	y1 = Math.ceil(y1/GRID)*GRID;
	const nx = (x1 - x0)/GRID;
	const ny = y1 - y0;
	ctx.lineWidth = GRID_WIDTH;
	ctx.strokeStyle = GRID_COLOR;
	ctx.beginPath();
	for (let i=1; i<nx; ++i) {
		const x = x0 + i*GRID;
		ctx.moveTo(x, y0);
		ctx.lineTo(x, y1);
	}
	for (let i=1; i<ny; ++i) {
		const y = y0 + i*GRID;
		ctx.moveTo(x0, y);
		ctx.lineTo(x1, y);
	}
	ctx.stroke();
	ctx.lineWidth = GRID_WIDTH*2;
	ctx.beginPath();
	ctx.moveTo(x0, 0);
	ctx.lineTo(x1, 0);
	ctx.moveTo(0, y0);
	ctx.lineTo(0, y1);
	ctx.stroke();
};
const drawOuterPoint = point => {
	ctx.save();
	const [a, b, c, d, e, f] = point.transform;
	ctx.transform(a, b, c, d, e, f);
	ctx.lineWidth = 1;
	ctx.setLineDash([IO_POINT_RADIUS*ROT_1*0.5]);
	if (point.component.selected === true) {
		ctx.strokeStyle = SELECTED_STROKE_COLOR;
	} else if (point.type === 'input') {
		ctx.strokeStyle = '#07f';
	} else {
		ctx.strokeStyle = '#f70';
	}
	ctx.beginPath();
	ctx.arc(0, 0, IO_POINT_RADIUS, ROT_0 + ROT_1*0.25, ROT_4 + ROT_1*0.25);
	ctx.stroke();
	ctx.restore();
};
const drawInnerPoint = point => {
	ctx.lineWidth = 1;
	ctx.setLineDash([IO_POINT_RADIUS*ROT_1*0.5]);
	if (point.selected === true) {
		ctx.fillStyle = ctx.strokeStyle = SELECTED_STROKE_COLOR;
	} else if (point.type === 'input') {
		ctx.fillStyle = ctx.strokeStyle = '#07f';
	} else {
		ctx.fillStyle = ctx.strokeStyle = '#f70';
	}
	const [x, y] = point.coord;
	ctx.beginPath();
	ctx.arc(x, y, IO_POINT_RADIUS, ROT_0 + ROT_1*0.25, ROT_4 + ROT_1*0.25);
	ctx.stroke();
	ctx.beginPath();
	ctx.arc(x, y, POINT_RADIUS, ROT_0 + ROT_1*0.25, ROT_4 + ROT_1*0.25);
	ctx.fill();
	ctx.setLineDash([]);
};
const drawHitbox = item => {
	const {hitbox} = item;
	const [ax, ay, bx, by] = hitbox;
	ctx.lineWidth = 1;
	ctx.strokeStyle = 'rgba(0, 119, 255, 0.5)';
	ctx.beginPath();
	ctx.rect(ax, ay, bx - ax, by - ay);
	ctx.stroke();
};
const drawComponent = item => {
	ctx.save();
	ctx.transform(...item.transform);
	const {draw} = item;
	if (!draw) {
		Drawings.component(ctx, item);
	} else {
		draw(ctx, item);
	}
	const {outerPoints} = item;
	for (let i=outerPoints.length; i--;) {
		drawOuterPoint(outerPoints[i]);
	}
	// drawHitbox(item);
	ctx.restore();
};
const drawCursor = () => {
	const [x, y] = Shared.getCursor();
	ctx.lineWidth = 1;
	ctx.strokeStyle = CURSOR_COLOR;
	ctx.beginPath();
	ctx.arc(x, y, GRID*0.5, ROT_0, ROT_4);
	ctx.moveTo(x + GRID*0.4, y);
	ctx.lineTo(x + GRID*0.6, y);
	ctx.moveTo(x - GRID*0.4, y);
	ctx.lineTo(x - GRID*0.6, y);
	ctx.moveTo(x, y + GRID*0.4);
	ctx.lineTo(x, y + GRID*0.6);
	ctx.moveTo(x, y - GRID*0.4);
	ctx.lineTo(x, y - GRID*0.6);
	ctx.stroke();
};
export const translateView = (x, y) => {
	zoom.translate(x, y);
	transformUpdated = false;
};
export const scaleView = value => {
	zoom.scale(value);
	transformUpdated = false;
};
export const rotateView = ang => {
	zoom.rotate(ang);
	transformUpdated = false;
};
export const trackPosition = (pos) => {
	loadViewport();
	updateTransform();
	return pos.reverse(transform);
};
export const projectPosition = (pos) => {
	loadViewport();
	updateTransform();
	return pos.apply(transform);
};
export const getZoom = dst => {
	dst.set(zoom);
	return dst;
};
export const setZoom = src => {
	zoom.set(src);
	transformUpdated = false;
	return src;
};
export const getScale = () => {
	const [x, y] = zoom;
	return Math.sqrt(x*x + y*y);
};
export const drawCircuit = () => {
	loadViewport();
	ctx = Shared.getCtx2D();
	ctx.save();
	ctx.fillStyle = BACKGROUND_COLOR;
	ctx.fillRect(x, y, sx, sy);
	circuit = Shared.getCircuit();
	useTransform();
	calcCurrentScale();
	drawGrid();
	const {points, iopoints, wires, components} = circuit;
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';
	for (let i=iopoints.length; i--;) {
		drawInnerPoint(iopoints[i]);
	}
	ctx.lineWidth = WIRE_WIDTH;
	for (let i=wires.length; i--;) {
		drawWire(wires[i]);
	}
	for (let i=points.length; i--;) {
		drawPoint(points[i]);
	}
	ctx.lineWidth = COMPONENT_LINE_WIDTH;
	for (let i=0; i<components.length; ++i) {
		drawComponent(components[i]);
	}
	const square = Shared.getSelectionSquare();
	if (square.x !== null) {
		const {x, y, sx, sy} = square;
		ctx.lineWidth = SELECTION_SQUARE_BORDER_WIDTH/scale;
		ctx.strokeStyle = SELECTION_SQUARE_BORDER_COLOR;
		ctx.fillStyle = SELECTION_SQUARE_COLOR;
		ctx.beginPath();
		ctx.rect(x, y, sx, sy);
		ctx.fill();
		ctx.stroke();
	}
	drawCursor();
	ctx.restore();
};