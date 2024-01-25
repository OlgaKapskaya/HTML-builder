const fs = require('node:fs');
const path = require('node:path');

const folderPath = path.join(__dirname, 'secret-folder');

fs.readdir(folderPath, { withFileTypes: true }, (err, files) => {
  console.log('Current directory files:');
  if (err) console.error(err);
  else {
    files.forEach((file) => {
      if (file.isFile()) {
        getFileData(file).then((data) =>
          console.log(
            `${data.fileName} - ${data.fileType} - ${data.fileSize}kb`,
          ),
        );
      }
    });
  }
});

async function getFileData(file) {
  const fileName = path.parse(file.name).name;
  const fileType = path.extname(file.name).slice(1);
  const fileSize = await getFileSize(path.join(folderPath, file.name));

  return { fileName, fileType, fileSize };
}

const getFileSize = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stats) => {
      if (err) {
        reject(err);
        return;
      }
      resolve((stats.size / 1024).toFixed(3));
    });
  });
};
