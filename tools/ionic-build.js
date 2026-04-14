/* eslint-disable no-console */
const { spawnSync } = require('node:child_process');

const args = process.argv.slice(2);
const filteredArgs = [];

for (let i = 0; i < args.length; i += 1) {
  const current = args[i];
  if (current.startsWith('--platform=')) {
    continue;
  }
  if (current === '--platform') {
    i += 1;
    continue;
  }
  filteredArgs.push(current);
}

const ngCmd = process.platform === 'win32' ? 'node_modules\\.bin\\ng.cmd' : 'node_modules/.bin/ng';
const result = spawnSync(ngCmd, ['build', ...filteredArgs], { stdio: 'inherit', shell: true });

process.exit(result.status ?? 1);

