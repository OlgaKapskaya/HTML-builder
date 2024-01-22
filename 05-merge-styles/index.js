const fs = require('node:fs');
const path = require('node:path');

const stylesFolderPath = path.join(__dirname, 'styles');
const outputFolderPath = path.join(__dirname, 'project-dist');
const outputFile = path.join(outputFolderPath, 'bundle.css');

function readFile(filePath) {
  return new Promise((resolve, reject) => {
    const stream = new fs.createReadStream(filePath, { encoding: 'utf8' });
    stream.on('error', (err) => {
      reject(err);
    });
    stream.on('readable', () => {
      const data = stream.read();
      resolve(data);
    });
  });
}

function writeFile(filePath, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, data, 'utf8', (err) => {
      err && reject(err);
      resolve();
    });
  });
}

async function compileStyles() {
  try {
    const files = await fs.promises.readdir(stylesFolderPath);
    const cssFiles = files.filter((file) => path.extname(file) === '.css');
    const fileContents = await Promise.all(
      cssFiles.map((file) => readFile(path.join(stylesFolderPath, file))),
    );
    const bundleContent = fileContents.join('\n');
    await writeFile(outputFile, bundleContent);

    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
  }
}

compileStyles();
