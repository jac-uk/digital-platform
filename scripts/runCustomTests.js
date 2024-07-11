const { spawn } = require('child_process');

const arg = process.argv[2];

if (!arg) {
  console.error('Please provide a test name pattern as an argument.');
  process.exit(1);
}

const globPattern = `./test/**/*${arg}*.spec.js`;
const command = 'mocha';
const args = [globPattern, '--timeout=10000', '--watch'];

console.log(`Running tests matching: ${globPattern} in watch mode`);

const mochaProcess = spawn(command, args, { stdio: 'inherit', shell: true });

mochaProcess.on('close', (code) => {
  if (code !== 0) {
    console.error(`Mocha process exited with code ${code}`);
  }
});
