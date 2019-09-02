import { bindCanvas, bindWindow } from '/js/eventHandler.js';
import { decodeCircuit } from '/js/encoder.js';
import { Circuit } from '/js/circuit.js';
import * as Shared from '/js/shared.js';
import * as Render from '/js/render.js';

import * as AtomicComponents from '/js/atomic-components.js';
import * as CustomComponents from '/js/custom-components.js';

let canvas;
const updateCanvasSize = () => {
	const sx = window.innerWidth;
	const sy = window.innerHeight;
	canvas.width = sx;
	canvas.height = sy;
	Shared.setViewport(0, 0, sx, sy);
	Render.drawCircuit();
};
window.addEventListener('load', () => {
	canvas = document.querySelector('canvas');
	const code = localStorage.getItem('code');
	const circuit = code
		? decodeCircuit(code)
		: new Circuit();
	Shared.setCircuit(circuit);
	Shared.setCanvas(canvas);
	bindCanvas(canvas);
	updateCanvasSize();
	const update = () => {
		circuit.tic();
		Render.drawCircuit();
		requestAnimationFrame(update);
	};
	requestAnimationFrame(update);
	bindWindow();
	window.addEventListener('resize', updateCanvasSize);
});