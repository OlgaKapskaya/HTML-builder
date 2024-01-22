const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline');
const { stdin: input, stdout: output } = require('node:process');

const filePath = path.join(__dirname, 'text.txt');

function write(filePath) {
  const stream = fs.createWriteStream(filePath);

  stream.on('error', (error) => {
    console.error(`Error: ${error.message}`);
  });

  const rl = readline.createInterface({
    input,
    output,
    prompt: 'Enter text (or "ctrl + c"/"exit" to quit): ',
  });

  rl.prompt();
  rl.on('line', (userText) => {
    if (userText.trim().toLowerCase() === 'exit') {
      rl.close();
    } else {
      stream.write(userText + '\n');
      rl.prompt();
    }
  }).on('close', () => {
    stream.end();
    stream.on('finish', () => {
      console.log(`Your text have been written to ${filePath}`);
      process.exit(0);
    });
  });
}

write(filePath);
