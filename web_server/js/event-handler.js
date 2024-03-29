import { Coord, Transform } from '/js/transform-2d.js';
import * as Shared from '/js/shared.js';
import * as Render from '/js/render.js';
import * as Controls from '/js/controls.js';

const mouseInfo = {
	button: null,
	scroll: null,
	ctrl: null,
	shift: null,
	scrPos0: Coord(),
	scrPos1: Coord(),
	pos0: Coord(),
	pos1: Coord(),
	zoom: Transform()
};
const clearMouseInfo = () => {
	mouseInfo.button = null;
	mouseInfo.scroll = null;
};
const prevent = e => {
	e.preventDefault();
	e.stopPropagation();
};
const buttonToMask = value => {
	switch (value) {
		case 0: return 0b001;
		case 1: return 0b100;
		case 2: return 0b010;
	}
};
export const bindCanvas = canvas => {
	canvas.addEventListener('contextmenu', prevent);
	canvas.addEventListener('mousedown', e => {
		prevent(e);
		if (mouseInfo.button !== null) return;
		const {button, ctrlKey, shiftKey} = e;
		const x = e.offsetX;
		const y = e.offsetY;
		mouseInfo.button = button;
		mouseInfo.ctrl = ctrlKey;
		mouseInfo.shift = shiftKey;
		const {scrPos0, scrPos1, pos0, pos1} = mouseInfo;
		scrPos0.set(x, y);
		scrPos1.set(x, y);
		pos0.set(x, y);
		Render.trackPosition(pos0);
		pos1.set(pos0);
		Render.getZoom(mouseInfo.zoom);
		Controls.handleMousedown(mouseInfo);
	});
	canvas.addEventListener('mousemove', e => {
		if (mouseInfo.button === null) return;
		if ((e.buttons & buttonToMask(mouseInfo.button)) === 0) {
			Controls.handleMouseup(mouseInfo);
		}
		const {scrPos1, pos1} = mouseInfo;
		const x = e.offsetX;
		const y = e.offsetY;
		scrPos1.set(x, y);
		pos1.set(x, y);
		Render.trackPosition(pos1);
		Controls.handleMousemove(mouseInfo);
	});
	canvas.addEventListener('mouseup', e => {
		if (mouseInfo.button !== e.button) return;
		const x = e.offsetX;
		const y = e.offsetY;
		const {scrPos1, pos1} = mouseInfo;
		const [px, py] = scrPos1;
		if (px !== x || py !== y) {
			scrPos1.set(x, y);
			pos1.set(x, y);
			Render.trackPosition(pos1);
			Controls.handleMousemove(mouseInfo);
		}
		Controls.handleMouseup(mouseInfo);
		clearMouseInfo();
	});
	canvas.addEventListener('wheel', e => {
		prevent(e);
		if (mouseInfo.button !== null) return;
		const {deltaY, ctrlKey, shiftKey} = e;
		const x = e.offsetX;
		const y = e.offsetY;
		const {scrPos0, scrPos1, pos0, pos1} = mouseInfo;
		mouseInfo.ctrl = ctrlKey;
		mouseInfo.shift = shiftKey;
		mouseInfo.scroll = deltaY;
		scrPos0.set(x, y);
		scrPos1.set(x, y);
		pos0.set(x, y);
		Render.trackPosition(pos0);
		pos1.set(pos0);
		Render.getZoom(mouseInfo.zoom);
		Controls.handleScroll(mouseInfo);
		clearMouseInfo();
	});
	canvas.addEventListener('dblclick', e => {
		prevent(e);
		if (mouseInfo.button !== null) return;
		const {button, ctrlKey, shiftKey} = e;
		const x = e.offsetX;
		const y = e.offsetY;
		const {scrPos0, scrPos1, pos0, pos1} = mouseInfo;
		mouseInfo.button = button;
		mouseInfo.ctrl = ctrlKey;
		mouseInfo.shift = shiftKey;
		scrPos0.set(x, y);
		scrPos1.set(x, y);
		pos0.set(x, y);
		Render.trackPosition(pos0);
		pos1.set(pos0);
		Controls.handleDblclick(mouseInfo);
		clearMouseInfo();
	});
};
export const bindWindow = () => {
	window.addEventListener('keydown', e => {
		Controls.handleKeydown(e);
	});
};