import { bindCanvas, bindWindow } from '/js/eventHandler.js';
import { Circuit } from '/js/circuit.js';
import * as Shared from '/js/shared.js';
import * as Render from '/js/render.js';

import * as AtomicComponents from '/js/atomic-components.js';
import * as CustomComponents from '/js/custom-components.js';

for (let name in AtomicComponents) {
	window[name] = AtomicComponents[name];
}
for (let name in CustomComponents) {
	window[name] = CustomComponents[name];
}

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
	const circuit = new Circuit();
	Shared.setCircuit(circuit);
	Shared.setCanvas(canvas);
	bindCanvas(canvas);
	updateCanvasSize();
	setInterval(() => {
		circuit.tic();
		Render.drawCircuit();
	}, 100);
	bindWindow();
	window.addEventListener('resize', updateCanvasSize);
});