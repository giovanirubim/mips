class CoordinateTransformation extends Float64Array {
	constructor() {
		super(6);
		this[0] = 1;
		this[3] = 1;
	}
	clear() {
		this[0] = 1;
		this[1] = 0;
		this[2] = 0;
		this[3] = 1;
		this[4] = 0;
		this[5] = 0;
		return this;
	}
	set(a, b, c, d, e, f) {
		if (a instanceof CoordinateTransformation) {
			[a, b, c, d, e, f] = a;
		}
		this[0] = a;
		this[1] = b;
		this[2] = c;
		this[3] = d;
		this[4] = e;
		this[5] = f;
		return this;
	}
	apply(mat) {
		const [a1, b1, c1, d1, e1, f1] = this;
		const [a2, b2, c2, d2, e2, f2] = mat;
		this[0] = a1*a2 + b1*c2;
		this[1] = a1*b2 + b1*d2;
		this[2] = c1*a2 + d1*c2;
		this[3] = c1*b2 + d1*d2;
		this[4] = e1*a2 + f1*c2 + e2;
		this[5] = e1*b2 + f1*d2 + f2;
		return this;
	}
	translate(x, y) {
		this[4] += x;
		this[5] += y;
		return this;
	}
	scale(value) {
		this[0] *= value;
		this[1] *= value;
		this[2] *= value;
		this[3] *= value;
		this[4] *= value;
		this[5] *= value;
		return this;
	}
	rotate(ang) {
		const [a1, b1, c1, d1, e1, f1] = this;
		const cos = Math.cos(ang);
		const sin = Math.sin(ang);
		this[0] = a1*cos - b1*sin;
		this[1] = a1*sin + b1*cos;
		this[2] = c1*cos - d1*sin;
		this[3] = c1*sin + d1*cos;
		this[4] = e1*cos - f1*sin;
		this[5] = e1*sin + f1*cos;
		return this;
	}
	coord(coord) {
		coord.set(this[4], this[5]);
		return coord;
	}
	round() {
		this[0] = Math.round(this[0]);
		this[1] = Math.round(this[1]);
		this[2] = Math.round(this[2]);
		this[3] = Math.round(this[3]);
		this[4] = Math.round(this[4]);
		this[5] = Math.round(this[5]);
		return this;
	}
}
class Coordinate extends Float64Array {
	constructor(buffer, index) {
		super(2);
	}
	clear() {
		this[0] = 0;
		this[1] = 0;
		return this;
	}
	set(a, b) {
		if (a instanceof Coordinate) {
			[a, b] = a;
		}
		this[0] = a;
		this[1] = b;
		return this;
	}
	apply(mat) {
		const [x, y] = this;
		const [a, b, c, d, e, f] = mat;
		this[0] = x*a + y*c + e;
		this[1] = x*b + y*d + f;
		return this;
	}
	translate(x, y) {
		this[0] += x;
		this[1] += y;
		return this;
	}
	reverse(mat) {
		const [x, y] = this;
		const [a, b, c, d, e, f] = mat;
		if (Math.abs(d) > Math.abs(c)) {
			const g = c/d;
			const h = y - f;
			this[0] = (x - e - h*g)/(a - b*g);
			this[1] = (h - this[0]*b)/d;
		} else {
			const g = d/c;
			const h = x - e;
			this[0] = (y - h*g - f)/(b - a*g);
			this[1] = (h - this[0]*a)/c;
		}
		return this;
	}
	round() {
		this[0] = Math.round(this[0]);
		this[1] = Math.round(this[1]);
		return this;
	}
}
export const Coord = () => new Coordinate();
export const Transform = () => new CoordinateTransformation();