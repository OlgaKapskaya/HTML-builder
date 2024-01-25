const fs = require('node:fs');
const path = require('node:path');
const fsp = fs.promises;

const folder = path.join(__dirname, 'files');
const newFolder = path.join(__dirname, 'files-copy');

function start() {
  fs.access(newFolder, fs.constants.F_OK, async (err) => {
    if (!err) {
      await fsp.rm(newFolder, { recursive: true });
    }
    await fsp.mkdir(newFolder);
    copyDirectory(folder, newFolder)
      .then(() => {
        console.log(`Success! All files are copied into ${newFolder}`);
      })
      .catch((err) => {
        console.error('Error copying directory:', err);
      });
  });
}

function copyDirectory(oldFolder, newFolder) {
  return new Promise((resolve, reject) => {
    fs.mkdir(newFolder, { recursive: true }, (err) => {
      if (err) {
        reject(err);
        return;
      }

      fs.readdir(oldFolder, { withFileTypes: true }, (err, files) => {
        if (err) {
          reject(err);
          return;
        }

        const copyPromises = files.map((file) =>
          getNewDirectory(file, oldFolder, newFolder),
        );

        Promise.all(copyPromises)
          .then(() => resolve())
          .catch((err) => reject(err));
      });
    });
  });
}

function getNewDirectory(file, oldFolder, newFolder) {
  const sourcePath = path.join(oldFolder, file.name);
  const targetPath = path.join(newFolder, file.name);

  if (file.isDirectory()) {
    return copyDirectory(sourcePath, targetPath);
  } else {
    return new Promise((resolve, reject) => {
      const readStream = fs.createReadStream(sourcePath);
      const writeStream = fs.createWriteStream(targetPath);
      readStream.on('error', reject);
      writeStream.on('error', reject);
      writeStream.on('close', resolve);
      readStream.pipe(writeStream);
    });
  }
}

start();
