import { Coord, Transform } from '/js/transform-2d.js';
import * as Render from '/js/render.js';
let canvas, ctx, sx, sy;
const coord = Coord();
const zoom = Transform();
const screenMap = Transform();
const tranform = Transform();
const updateTransform = () => {
	transform.set(zoom);
	transform.apply(screenMap);
};
export const setCanvas = arg => {
	canvas = arg;
};
export const setSize = (x, y) => {
	sx = x;
	sy = y;
	screenMap.set(1, 0, 0, 1, sx*0.5, sy*0.5);
	updateTransform();
};
export const trackPoint = (x, y) => {
	return [...coord.set(x, y).reverse(tranform)];
}