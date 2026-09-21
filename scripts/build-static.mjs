import { cp, mkdir, rm, symlink, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const stage = join(root, '.static-build');
const output = join(root, 'static-site');
const basePath = (process.env.PERISCOPE_BASE_PATH || '').replace(/\/$/, '');
if (basePath && !/^\/[a-zA-Z0-9/_-]+$/.test(basePath)) {
  throw new Error('PERISCOPE_BASE_PATH must be a path such as /periscope.');
}
// The server workspace and .next build stay untouched. Only the public demo ships.
await rm(stage, { recursive: true, force: true });
await mkdir(stage, { recursive: true });
for (const name of ['app', 'lib', 'public', 'postcss.config.mjs', 'tsconfig.json', 'next-env.d.ts', 'package.json']) {
  await cp(join(root, name), join(stage, name), {
    recursive: true,
    filter: (source) => source !== join(root, 'app/api') && source !== join(root, 'lib/db.ts'),
  });
}
await symlink(join(root, 'node_modules'), join(stage, 'node_modules'), 'dir');
await writeFile(join(stage, 'app/page.tsx'), `import StaticWorkspace from './static-workspace';\nexport default function Page() { return <StaticWorkspace />; }\n`);
await writeFile(join(stage, 'next.config.mjs'), `export default ${JSON.stringify({
  output: 'export', trailingSlash: true, basePath, images: { unoptimized: true },
})};\n`);
const dataDir = join(stage, 'public/data');
await mkdir(dataDir, { recursive: true });
await cp(join(root, 'examples/uxd-demo/workspace.json'), join(dataDir, 'workspace.json'));
await writeFile(join(dataDir, 'config.json'), JSON.stringify({
  dataUrl: './workspace.json', label: 'Fictional UXD example', fictional: true,
}, null, 2) + '\n');
// Guard against accidentally importing a server-only dependency into the static entry.
const result = spawnSync(process.execPath, [join(root, 'node_modules/next/dist/bin/next'), 'build', '--webpack'], {
  cwd: stage, stdio: 'inherit', env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' },
});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status || 1);
await rm(output, { recursive: true, force: true });
await cp(join(stage, 'out'), output, { recursive: true });
await writeFile(join(output, 'DEPLOY.txt'), `Periscope static export\n\nServe this directory over HTTP(S) at ${basePath || '/'}. No Node.js or database is required by the deployed application.\nEdit data/config.json to select a validated workspace JSON or read-only API endpoint. Relative dataUrl values resolve against data/config.json.\nBundled data is fictional. Protect enterprise data using your hosting and API access controls.\nBuild prefix: ${basePath || '(root)'}\n`);
console.log(`\nStatic site ready: ${output}\nPreview: npm run preview:static`);
