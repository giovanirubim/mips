import { Coord } from '/js/transform-2d.js';

let canvas = null;
let ctx2D = null;
export const setCanvas = arg => {
	canvas = arg;
	ctx2D = canvas.getContext('2d');
}
export const getCanvas = () => canvas;
export const getCtx2D = () => ctx2D;

const viewport = {x: null, y: null, sx: null, sy: null};
export const setViewport = (x, y, sx, sy) => {
	viewport.x = x;
	viewport.y = y;
	viewport.sx = sx;
	viewport.sy = sy;
};
export const getViewport = () => ({...viewport});

let circuit = null;
export const setCircuit = arg => {
	circuit = arg;
	window.circuit = circuit;
};
export const getCircuit = () => circuit;

const selectionSquare = {x: null, y: null, sx: null, sy: null};
export const setSelectionSquare = (x, y, sx, sy) => {
	selectionSquare.x = x;
	selectionSquare.y = y;
	selectionSquare.sx = sx;
	selectionSquare.sy = sy;
};
export const getSelectionSquare = () => ({...selectionSquare});

const cursor = Coord();
export const setCursor = (x, y) => {
	cursor.set(x, y);
};
export const getCursor = () => cursor;