const fs = require('fs');
const express = require('express');
const mimeTypes = require('mime-types');
const app = express();
const PORT = 80;
const loadFile = path => {
	try {
		return fs.readFileSync(path);
	} catch(err) {
		return null;
	}
};
const compressHTML = file => {
	let str = '';
	file.toString().split('\n').forEach(line => str += line.trim());
	return str;
};
app.use((req, res) => {
	let url = req.url.split('#')[0].split('?')[0];
	if (url === '/') url = '/index.html';
	let file = loadFile(__dirname + url);
	if (file) {
		const type = mimeTypes.lookup(url);
		if (type === 'text/html') {
			file = compressHTML(file);
		}
		res.setHeader('Content-Type', type);
		res.end(file);
	} else {
		res.statusCode = 404;
		res.end();
	}
});
app.listen(PORT, () => {
	console.log('Server started at port ' + PORT);
});