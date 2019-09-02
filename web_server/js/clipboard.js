export const copyToClipboard = str => {
	const textarea = document.createElement('textarea');
	document.body.appendChild(textarea);
	textarea.style.position = 'fixed';
	textarea.style.top = '-200px';
	textarea.value = str;
	setTimeout(() => {
		textarea.select();
		document.execCommand('copy');
		setTimeout(() => {
			textarea.remove();
		}, 0);
	}, 0);
};