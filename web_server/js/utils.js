export const arrayRemove = (array, item) => {
	const index = array.indexOf(item);
	if (index !== -1) {
		array.splice(index, 1);
		return true;
	}
	return false;
};
export const pushUnique = (array, item) => {
	if (array.indexOf(item) === -1) {
		array.push(item);
		return true;
	}
	return false;
};
export const calcDistance = (ax, ay, bx, by) => {
	const dx = ax - bx;
	const dy = ay - by;
	return Math.sqrt(dx*dx + dy*dy);
};
export const lineDistance = (x, y, ax, ay, bx, by) => {
	const a = calcDistance(ax, ay,  x,  y);
	const b = calcDistance(bx, by,  x,  y);
	const d = calcDistance(ax, ay, bx, by);
	const a_sqr = a*a;
	const b_sqr = b*b;
	const d_sqr = d*d;
	const v1 = b_sqr - a_sqr - d_sqr;
	const v2 = a_sqr - b_sqr - d_sqr;
	if (v1 >= 0 && v2 < 0) return a;
	if (v2 >= 0 && v1 < 0) return b;
	const c = (b_sqr - d_sqr - a_sqr)/(d+d);
	return Math.sqrt(a_sqr - c*c);
};