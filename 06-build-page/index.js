const fs = require('node:fs');
const path = require('node:path');

const templateFilePath = path.join(__dirname, 'template.html');
const projectPath = path.join(__dirname, 'project-dist');
const indexFilePath = path.join(projectPath, 'index.html');
const stylesFolderPath = path.join(__dirname, 'styles');
const styleFilePath = path.join(projectPath, 'style.css');
const componentsFolderPath = path.join(__dirname, 'components');
const assetsFolderPath = path.join(__dirname, 'assets');
const assetsDistFolderPath = path.join(projectPath, 'assets');

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
    const stream = fs.createWriteStream(filePath);
    stream.on('error', (error) => {
      reject(error);
    });
    stream.write(data + '\n');
    resolve();
  });
}

function createDirectory(path) {
  return new Promise((resolve, reject) => {
    fs.mkdir(path, (err) => {
      err && reject(err);
      resolve();
    });
  });
}

function copyDirectory(sourcePath, newPath) {
  return new Promise((resolve, reject) => {
    fs.mkdir(newPath, { recursive: true }, (err) => {
      err && reject(err);

      fs.readdir(sourcePath, { withFileTypes: true }, (err, files) => {
        err && reject(err);

        const copyPromises = files.map((file) =>
          getNewDirectory(file, sourcePath, newPath),
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

const replaceTags = async (templateContent) => {
  const componentFiles = await fs.promises.readdir(componentsFolderPath);

  for (const componentFile of componentFiles) {
    const componentName = path.parse(componentFile).name;
    const componentContent = await readFile(
      path.join(componentsFolderPath, componentFile),
    );
    const tag = `{{${componentName}}}`;
    templateContent = templateContent.replace(tag, componentContent);
  }

  return templateContent;
};

async function compileStyles() {
  try {
    const files = await fs.promises.readdir(stylesFolderPath);
    const cssFiles = files.filter((file) => path.extname(file) === '.css');
    const fileContents = await Promise.all(
      cssFiles.map((file) => readFile(path.join(stylesFolderPath, file))),
    );
    const bundleContent = fileContents.join('\n');
    await writeFile(styleFilePath, bundleContent);
  } catch (error) {
    console.error('Error:', error);
  }
}

async function generatePage() {
  try {
    await createDirectory(projectPath);
    const templateContent = await readFile(templateFilePath);
    const replacedContent = await replaceTags(templateContent);
    await writeFile(indexFilePath, replacedContent);
    await compileStyles();
    await copyDirectory(assetsFolderPath, assetsDistFolderPath);

    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
  }
}

generatePage();
