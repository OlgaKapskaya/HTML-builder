const fs = require('node:fs');
const path = require('node:path');

const filePath = path.join(__dirname, 'text.txt');
const stream = new fs.createReadStream(filePath, { encoding: 'utf8' });

stream.on('readable', function () {
  const data = stream.read();
  if (data) {
    console.log(data);
  }
});
