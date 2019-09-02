import {
	SELECTED_FILL_COLOR,
	SELECTED_STROKE_COLOR,
	COMPONENT_LINE_COLOR,
	COMPONENT_COLOR,
	LABEL_FONT_SIZE
} from '/js/config.js';

class Drawing {
	constructor() {
		this.idMap = {};
		this.array = [];
	}
	point(id, x, y) {
		this.idMap[id] = {x, y, point: true};
		return this;
	}
	copy(src, dst, dx, dy) {
		const {idMap} = this;
		const {x, y} = idMap[src];
		idMap[dst] = {
			x: x + (dx || 0),
			y: y + (dy || 0),
			point: true
		};
		return this;
	}
	val(id, value) {
		this.idMap[id] = {value};
		return this;
	}
	mirror(src, dst, axis) {
		const {idMap} = this;
		const point = idMap[dst] = {...idMap[src]};
		point[axis] *= -1;
		return this;
	}
	begin() {
		this.array.push({type: 'begin'});
		return this;
	}
	move(id) {
		const {idMap, array} = this;
		this.array.push({
			type: 'move',
			point: idMap[id]
		});
		return this;
	}
	line(id) {
		const {idMap, array} = this;
		this.array.push({
			type: 'line',
			point: idMap[id]
		});
		return this;
	}
	close(id) {
		const {idMap, array} = this;
		this.array.push({
			type: 'close',
			point: idMap[id]
		});
		return this;
	}
	bezier(a, b, c) {
		const {idMap, array} = this;
		this.array.push({
			type: 'bezier',
			a: idMap[a],
			b: idMap[b],
			c: idMap[c]
		});
		return this;
	}
	arc(center, rad, a, b) {
		a *= Math.PI*2;
		b *= Math.PI*2;
		const {idMap, array} = this;
		this.array.push({
			type: 'arc',
			center: idMap[center],
			rad: idMap[rad],
			a, b
		});
		return this;
	}
	fill() {
		this.array.push({type: 'fill'});
		return this;
	}
	stroke() {
		this.array.push({type: 'stroke'});
		return this;
	}
	fcolor(color) {
		this.array.push({
			type: 'fcolor',
			color
		});
		return this;
	}
	scolor(color) {
		this.array.push({
			type: 'scolor',
			color
		});
		return this;
	}
	scale(value) {
		const {idMap} = this;
		for (let id in idMap) {
			const point = idMap[id];
			point.x *= value;
			point.y *= value;
			point.value *= value;
		}
		return this;
	}
	translate(x, y) {
		const {idMap} = this;
		for (let id in idMap) {
			const point = idMap[id];
			point.x += x;
			point.y += y;
		}
		return this;
	}
	inspect(ctx) {
		ctx.lineWidth = 1;
		ctx.fillStyle = '#037';
		ctx.strokeStyle = '#fff';
		this.array.forEach(item => {
			const {type} = item;
			if (type === 'move') {
				const {x, y} = item.point;
				ctx.moveTo(x, y);
			} else if (type === 'line') {
				const {x, y} = item.point;
				ctx.lineTo(x, y);
			} else if (type === 'bezier') {
				const {a, b, c} = item;
				ctx.bezierCurveTo(a.x, a.y, b.x, b.y, c.x, c.y);
			} else if (type === 'arc') {
				const {center, rad, a, b} = item;
				ctx.arc(center.x, center.y, rad.value, a, b);
			} else if (type === 'begin') {
				ctx.beginPath();
			} else if (type === 'close') {
				ctx.closePath();
			} else if (type === 'fill') {
				ctx.fill();
			} else if (type === 'stroke') {
				ctx.stroke();
			}
		});
		const {idMap} = this;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		for (let id in idMap) {
			const point = idMap[id];
			const {x, y} = point;
			ctx.fillStyle = '#f70';
			ctx.beginPath();
			ctx.arc(x, y, 1, 0, Math.PI*2);
			ctx.fill();
			ctx.fillStyle = '#fff';
			ctx.fillText(id, x, y - 6);
		}
		return this;
	}
	draw(ctx) {
		this.array.forEach(item => {
			const {type} = item;
			if (type === 'move') {
				const {x, y} = item.point;
				ctx.moveTo(x, y);
			} else if (type === 'line') {
				const {x, y} = item.point;
				ctx.lineTo(x, y);
			} else if (type === 'bezier') {
				const {a, b, c} = item;
				ctx.bezierCurveTo(a.x, a.y, b.x, b.y, c.x, c.y);
			} else if (type === 'arc') {
				const {center, rad, a, b} = item;
				ctx.arc(center.x, center.y, rad.value, a, b);
			} else if (type === 'begin') {
				ctx.beginPath();
			} else if (type === 'close') {
				ctx.closePath();
			} else if (type === 'fill') {
				ctx.fill();
			} else if (type === 'stroke') {
				ctx.stroke();
			} else if (type === 'fcolor') {
				ctx.fillStyle = item.color;
			} else if (type === 'scolor') {
				ctx.strokeStyle = item.color;
			}
		});
		return this;
	}
	code() {
		let code = '';
		const {idMap} = this;
		const rnd = x => Math.round(x*2)/2;
		this.array.forEach(item => {
			const {type} = item;
			if (type === 'move') {
				const {x, y} = item.point;
				code += `ctx.moveTo(${ rnd(x) }, ${ rnd(y) });\n`;
			} else if (type === 'line') {
				const {x, y} = item.point;
				code += `ctx.lineTo(${ rnd(x) }, ${ rnd(y) });\n`;
			} else if (type === 'bezier') {
				const {a, b, c} = item;
				code += `ctx.bezierCurveTo(${
					rnd(a.x) }, ${ rnd(a.y)
				}, ${
					rnd(b.x) }, ${ rnd(b.y)
				}, ${
					rnd(c.x) }, ${ rnd(c.y)
				});\n`;
			} else if (type === 'arc') {
				const {center, rad, a, b} = item;
				const x = rnd(center.x);
				const y = rnd(center.y);
				code += `ctx.arc(${x}, ${y}, ${rnd(rad.value)}, ${a}, ${b});\n`;
			} else if (type === 'begin') {
				code += 'ctx.beginPath();\n'
			} else if (type === 'close') {
				code += 'ctx.closePath();\n';
			} else if (type === 'fill') {
				code += 'ctx.fill();\n';
			} else if (type === 'stroke') {
				code += 'ctx.stroke();\n';
			} else if (type === 'fcolor') {
				code += `ctx.fillStyle = ${item.color};\n`;
			} else if (type === 'scolor') {
				code += `ctx.strokeStyle = ${item.color};\n`;
			}
		});
		return code;
	}
}
export const notGate = (ctx, item) => {
	if (item.selected) {
		ctx.strokeStyle = SELECTED_STROKE_COLOR;
		ctx.fillStyle = SELECTED_FILL_COLOR;
	} else {
		ctx.strokeStyle = COMPONENT_LINE_COLOR;
		ctx.fillStyle = COMPONENT_COLOR;
	}
	// new Drawing()
	// 	.point('a', -100, -80)
	// 	.point('b', 80, 0)
	// 	.mirror('a', 'c', 'y')
	// 	.point('d', 120, 0)
	// 	.val('rad', 40)
	// 	.begin()
	// 	.arc('d', 'rad', 0.5, 1.5)
	// 	.move('a')
	// 	.line('b')
	// 	.line('c')
	// 	.close()
	// 	.fill()
	// 	.stroke()
	// 	.translate(-30, 0)
	// 	.scale(0.11);
	ctx.beginPath();
	ctx.arc(10, 0, 4.5, 3.141592653589793, 9.42477796076938);
	ctx.moveTo(-14.5, -9);
	ctx.lineTo(5.5, 0);
	ctx.lineTo(-14.5, 9);
	ctx.closePath();
	ctx.fill();
	ctx.stroke();
};
export const bufferGate = (ctx, item) => {
	if (item.selected) {
		ctx.strokeStyle = SELECTED_STROKE_COLOR;
		ctx.fillStyle = SELECTED_FILL_COLOR;
	} else {
		ctx.strokeStyle = COMPONENT_LINE_COLOR;
		ctx.fillStyle = COMPONENT_COLOR;
	}
	new Drawing()
		.point('a', -120, -100)
		.point('b', 120, 0)
		.mirror('a', 'c', 'y')
		.begin()
		.move('a')
		.line('b')
		.line('c')
		.close()
		.fill()
		.stroke()
		.translate(0, 0)
		.scale(0.11)
		.draw(ctx);
	// ctx.beginPath();
	// ctx.arc(10, 0, 4.5, 3.141592653589793, 9.42477796076938);
	// ctx.moveTo(-14.5, -9);
	// ctx.lineTo(5.5, 0);
	// ctx.lineTo(-14.5, 9);
	// ctx.closePath();
	// ctx.fill();
	// ctx.stroke();
};
export const xorGate = (ctx, item) => {
	if (item.selected) {
		ctx.strokeStyle = SELECTED_STROKE_COLOR;
		ctx.fillStyle = SELECTED_FILL_COLOR;
	} else {
		ctx.strokeStyle = COMPONENT_LINE_COLOR;
		ctx.fillStyle = COMPONENT_COLOR;
	}
	// new Drawing()
	// 	.point('a', -100, -80)
	// 	.copy('a', 'b', 40, 0)
	// 	.copy('b', 'c', 50, 0)
	// 	.copy('c', 'd', 50, 30)
	// 	.point('e', 80, 0)
	// 	.mirror('d', 'f', 'y')
	// 	.mirror('c', 'g', 'y')
	// 	.mirror('b', 'h', 'y')
	// 	.mirror('a', 'i', 'y')
	// 	.begin()
	// 	.move('a')
	// 	.line('b')
	// 	.bezier('c', 'd', 'e')
	// 	.bezier('f', 'g', 'h')
	// 	.line('i')
	// 	.copy('i', 'j', 20, -50)
	// 	.mirror('j', 'k', 'y')
	// 	.bezier('j', 'k', 'a')
	// 	.fill()
	// 	.copy('a', 'l', -30, 0)
	// 	.copy('k', 'm', -30, 0)
	// 	.copy('j', 'n', -30, 0)
	// 	.copy('i', 'o', -30, 0)
	// 	.move('l')
	// 	.bezier('m', 'n', 'o')
	// 	.stroke()
	// 	.translate(70, 0)
	// 	.scale(0.23)
	// 	.draw(ctx);
	ctx.beginPath();
	ctx.moveTo(-7, -18.5);
	ctx.lineTo(2.5, -18.5);
	ctx.bezierCurveTo(14, -18.5, 25.5, -11.5, 34.5, 0);
	ctx.bezierCurveTo(25.5, 11.5, 14, 18.5, 2.5, 18.5);
	ctx.lineTo(-7, 18.5);
	ctx.bezierCurveTo(-2.5, 7, -2.5, -7, -7, -18.5);
	ctx.fill();
	ctx.moveTo(-14, -18.5);
	ctx.bezierCurveTo(-9, -7, -9, 7, -14, 18.5);
	ctx.stroke();
};
export const orGate = (ctx, item) => {
	if (item.selected) {
		ctx.strokeStyle = SELECTED_STROKE_COLOR;
		ctx.fillStyle = SELECTED_FILL_COLOR;
	} else {
		ctx.strokeStyle = COMPONENT_LINE_COLOR;
		ctx.fillStyle = COMPONENT_COLOR;
	}
	// let d = new Drawing()
	// 	.point('a', -110, -80)
	// 	.copy('a', 'b', 50, 0)
	// 	.copy('b', 'c', 50, 0)
	// 	.copy('c', 'd', 50, 30)
	// 	.point('e', 80, 0)
	// 	.mirror('d', 'f', 'y')
	// 	.mirror('c', 'g', 'y')
	// 	.mirror('b', 'h', 'y')
	// 	.mirror('a', 'i', 'y')
	// 	.begin()
	// 	.move('a')
	// 	.line('b')
	// 	.bezier('c', 'd', 'e')
	// 	.bezier('f', 'g', 'h')
	// 	.line('i')
	// 	.copy('i', 'j', 20, -50)
	// 	.mirror('j', 'k', 'y')
	// 	.bezier('j', 'k', 'a')
	// 	.fill()
	// 	.stroke()
	// 	.translate(60, 0)
	// 	.scale(0.23)
	// 	.draw(ctx);
	// console.log(d.code());
	ctx.beginPath();
	ctx.moveTo(-11.5, -18.5);
	ctx.lineTo(0, -18.5);
	ctx.bezierCurveTo(11.5, -18.5, 23, -11.5, 32, 0);
	ctx.bezierCurveTo(23, 11.5, 11.5, 18.5, 0, 18.5);
	ctx.lineTo(-11.5, 18.5);
	ctx.bezierCurveTo(-7, 7, -7, -7, -11.5, -18.5);
	ctx.fill();
	ctx.stroke();
};
export const andGate = (ctx, item) => {
	if (item.selected) {
		ctx.strokeStyle = SELECTED_STROKE_COLOR;
		ctx.fillStyle = SELECTED_FILL_COLOR;
	} else {
		ctx.strokeStyle = COMPONENT_LINE_COLOR;
		ctx.fillStyle = COMPONENT_COLOR;
	}
	// console.log(new Drawing()
	// 		.point('a', -40, -75)
	// 		.copy('a', 'b', 100, 0)
	// 		.copy('b', 'c', 100, 0)
	// 		.mirror('c', 'd', 'y')
	// 		.mirror('b', 'e', 'y')
	// 		.mirror('a', 'f', 'y')
	// 		.begin()
	// 		.move('a')
	// 		.line('b')
	// 		.bezier('c', 'd', 'e')
	// 		.line('f')
	// 		.close()
	// 		.fill()
	// 		.stroke()
	// 		.translate(-5, 0)
	// 		.scale(0.25)
	// 		.code());
	ctx.beginPath();
	ctx.moveTo(-11, -18.5);
	ctx.lineTo(14, -18.5);
	ctx.bezierCurveTo(39, -18.5, 39, 19, 14, 19);
	ctx.lineTo(-11, 19);
	ctx.closePath();
	ctx.fill();
	ctx.stroke();
};

// const nand = new Drawing()
// 	.point('a', -50, -75)
// 	.copy('a', 'b', 85, 0)
// 	.copy('b', 'c', 100, 0)
// 	.mirror('c', 'd', 'y')
// 	.mirror('b', 'e', 'y')
// 	.mirror('a', 'f', 'y')
// 	.val('rad', 15)
// 	.begin()
// 	.move('a')
// 	.line('b')
// 	.bezier('c', 'd', 'e')
// 	.line('f')
// 	.close()
// 	.fill()
// 	.stroke()
// 	.begin()
// 	.point('g', 126, 0)
// 	.arc('g', 'rad', 0, Math.PI*2)
// 	.fill()
// 	.stroke()
// 	.translate(-5, 0)
// 	.scale(0.25);
// console.log(nand.code());
export const nandGate = (ctx, item) => {
	if (item.selected) {
		ctx.strokeStyle = SELECTED_STROKE_COLOR;
		ctx.fillStyle = SELECTED_FILL_COLOR;
	} else {
		ctx.strokeStyle = COMPONENT_LINE_COLOR;
		ctx.fillStyle = COMPONENT_COLOR;
	}
	ctx.beginPath();
	ctx.moveTo(-13.5, -18.5);
	ctx.lineTo(7.5, -18.5);
	ctx.bezierCurveTo(32.5, -18.5, 32.5, 19, 7.5, 19);
	ctx.lineTo(-13.5, 19);
	ctx.closePath();
	ctx.fill();
	ctx.stroke();
	ctx.beginPath();
	ctx.arc(30.5, 0, 4, 0, 6.283185307179586);
	ctx.fill();
	ctx.stroke();
};
// const nor = new Drawing()
// 	.point('a', -110, -80)
// 	.copy('a', 'b', 50, 0)
// 	.copy('b', 'c', 40, 0)
// 	.copy('c', 'd', 45, 30)
// 	.point('e', 60, 0)
// 	.mirror('d', 'f', 'y')
// 	.mirror('c', 'g', 'y')
// 	.mirror('b', 'h', 'y')
// 	.mirror('a', 'i', 'y')
// 	.begin()
// 	.move('a')
// 	.line('b')
// 	.bezier('c', 'd', 'e')
// 	.bezier('f', 'g', 'h')
// 	.line('i')
// 	.copy('i', 'j', 20, -50)
// 	.mirror('j', 'k', 'y')
// 	.bezier('j', 'k', 'a')
// 	.fill()
// 	.stroke()
// 	.begin()
// 	.val('rad', 17)
// 	.copy('e', 'l', 20, 0)
// 	.arc('l', 'rad', 0, Math.PI*2)
// 	.fill()
// 	.stroke()
// 	.translate(50, 0)
// 	.scale(0.23);
export const norGate = (ctx, item) => {
	if (item.selected) {
		ctx.strokeStyle = SELECTED_STROKE_COLOR;
		ctx.fillStyle = SELECTED_FILL_COLOR;
	} else {
		ctx.strokeStyle = COMPONENT_LINE_COLOR;
		ctx.fillStyle = COMPONENT_COLOR;
	}
	ctx.beginPath();
	ctx.moveTo(-14, -18.5);
	ctx.lineTo(-2.5, -18.5);
	ctx.bezierCurveTo(7, -18.5, 17.5, -11.5, 25.5, 0);
	ctx.bezierCurveTo(17.5, 11.5, 7, 18.5, -2.5, 18.5);
	ctx.lineTo(-14, 18.5);
	ctx.bezierCurveTo(-9, 7, -9, -7, -14, -18.5);
	ctx.fill();
	ctx.stroke();
	ctx.beginPath();
	ctx.arc(30, 0, 4, 0, Math.PI*2);
	ctx.fill();
	ctx.stroke();
};
export const component = (ctx, item) => {
	const {label} = item;
	if (item.selected === true) {
		ctx.strokeStyle = SELECTED_STROKE_COLOR;
		ctx.fillStyle = SELECTED_FILL_COLOR;
	} else {
		ctx.strokeStyle = COMPONENT_LINE_COLOR;
		ctx.fillStyle = COMPONENT_COLOR;
	}
	const [ax, ay, bx, by] = item.hitbox;
	ctx.beginPath();
	ctx.rect(ax, ay, bx - ax, by - ay);
	ctx.fill();
	ctx.stroke();
	if (label) {
		ctx.fillStyle = '#fff';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.font = LABEL_FONT_SIZE + 'px monospace';
		const x = (ax + bx)*0.5;
		const y = (ay + by)*0.5;
		ctx.fillText(label, x, y);
	}
};