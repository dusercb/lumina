// Builds dist/artifact/: the page without its document wrapper (the Claude artifact viewer adds
// the doctype, charset and viewport tags and a base reset itself), plus base64 text copies of the
// model files, because the viewer only serves standard web file types. A copy larger than the
// viewer's per-file limit is split into numbered parts (name.b64.1.txt, name.b64.2.txt, …),
// which face.js joins again.

import { readFile, writeFile, mkdir, readdir, rm } from 'node:fs/promises';

const PART = 12 * 1024 * 1024;   // characters per part, under the 16 MB file limit

const html = await readFile('app/index.html', 'utf8');
const head = html.match(/<head>([\s\S]*?)<\/head>/i)[1];
const body = html.match(/<body>([\s\S]*?)<\/body>/i)[1];
const keptHead = head
  .replace(/<meta charset[^>]*>\s*/i, '')
  .replace(/<meta name="viewport"[^>]*>\s*/i, '')
  .replace(/<style id="standalone-reset">[\s\S]*?<\/style>\s*/i, '')
  .trim();

const dir = 'dist/artifact/vendor/mediapipe';
await mkdir(dir, { recursive: true });
for (const f of await readdir(dir)) if (f.endsWith('.b64.txt')) await rm(`${dir}/${f}`);
await writeFile('dist/artifact/index.html', `${keptHead}\n${body.trim()}\n`);
const MODELS = ['face_landmarker.task', 'selfie_segmenter.tflite', 'pose_landmarker_lite.task', 'selfie_multiclass_256x256.tflite'];
for (const name of MODELS) {
  const b64 = (await readFile(`app/vendor/mediapipe/${name}`)).toString('base64');
  if (b64.length <= PART) {
    await writeFile(`${dir}/${name}.b64.txt`, b64);
    console.log(`${name}.b64.txt`);
    continue;
  }
  for (let i = 0; i * PART < b64.length; i++) {
    await writeFile(`${dir}/${name}.b64.${i + 1}.txt`, b64.slice(i * PART, (i + 1) * PART));
    console.log(`${name}.b64.${i + 1}.txt`);
  }
}
console.log('Wrote dist/artifact/');
