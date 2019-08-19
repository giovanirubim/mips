class Drawing {
	constructor() {
		this.pMap = {};
		this.lines = [];
		this.beziers = [];
		this.array = [];
	}
	point(x, y, id) {
		let point = [x, y];
		point.id = id;
		this.pMap[id] = point;
		this.points.push(point);
		return this;
	}
	line(a) {
		a = this.pMap[a];
		let line = [a];
		this.lines.push(line);
		this.array.push(line);
		return this;
	}
	bezier(a, b) {
		a = this.pMap[a];
		b = this.pMap[b];
		let bezier = [a, b];
		this.beziers.push(bezier);
		this.array.push(bezier);
		return this;
	}
	move(a) {
		a = this.pMap[a];
		this.array.push(a);
		return this;
	}
	draw(ctx) {
		this.array.forEach(item => {
			if (item.id) {
				ctx.moveTo(...item);
			} else if (item.length === 2) {
				
			}
		});
	}
}
export const notGate = (ctx, item) => {
	ctx.beginPath();
};