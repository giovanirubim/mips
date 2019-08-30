export const copyToClipboard = str => {
	const textarea = document.createElement('textarea');
	document.body.appendChild(textarea);
	textarea.value = str;
	textarea.select();
	const res = document.execCommand('copy');
	textarea.remove();
	return res;
};