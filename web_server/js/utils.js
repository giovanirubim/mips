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