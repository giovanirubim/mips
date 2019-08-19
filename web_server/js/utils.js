export const arrayRemove = (array, item) => {
	const index = array.indexOf(item);
	if (index !== -1) {
		array.splice(index, 1);
		return true;
	}
	return false;
};
export const pushUnique = (array, item) => {
	if (array.indexOf(item) !== -1) {
		return false;
	}
	array.push(item);
	return true;
};
export const calcDistance = (ax, ay, bx, by) => {
	const dx = ax - bx;
	const dy = ay - by;
	return Math.sqrt(dx*dx + dy*dy);
};