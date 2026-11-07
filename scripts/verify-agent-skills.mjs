#!/usr/bin/env node
// Verify every vendored Codex skill and companion document against upstream Git blobs.
// No dependencies, network calls, file writes or access to user fitness data.
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const fail = message => { throw new Error('Agent-Skills-Check: ' + message); };
const manifest = JSON.parse(readFileSync(join(root, 'docs/emil-kowalski/manifest.json'), 'utf8'));
const entries = Object.entries(manifest.files || {});
const names = manifest.skills || [];

if (manifest.name !== 'emilkowalski-skills' || !/^[a-f\d]{40}$/.test(manifest.upstreamCommit))
  fail('invalid provenance manifest');
if (names.length !== 17 || new Set(names).size !== 17)
  fail('expected 17 uniquely named skills');
if (entries.length !== 30)
  fail('expected 26 skill/reference files and four upstream reference documents');

let verified = 0;
for (const [relative, expectedHash] of entries) {
  if (!relative.startsWith('.agents/skills/') && !relative.startsWith('docs/emil-kowalski/'))
    fail('unexpected installed path: ' + relative);
  if (!/^[a-f\d]{40}$/.test(expectedHash)) fail('bad upstream hash: ' + relative);
  const full = join(root, relative);
  if (!existsSync(full)) fail('missing file: ' + relative);
  const data = readFileSync(full);
  const hash = createHash('sha1')
    .update(Buffer.from('blob ' + data.length + '\0', 'utf8'))
    .update(data)
    .digest('hex');
  if (hash !== expectedHash) fail('file differs from upstream: ' + relative);
  verified++;
}

for (const name of names) {
  const relative = '.agents/skills/' + name + '/SKILL.md';
  if (!manifest.files[relative]) fail('missing skill entry: ' + name);
  const content = readFileSync(join(root, relative), 'utf8');
  if (!content.startsWith('---\n')) fail('missing YAML frontmatter: ' + relative);
  const frontmatter = content.split('---', 3)[1] || '';
  const declared = frontmatter.match(/^name:\s*(.+)$/m)?.[1]?.trim();
  if (declared !== name) fail('skill name mismatch in ' + relative + ' (' + declared + ')');
  if (!/^description:\s*\S/m.test(frontmatter)) fail('missing description in ' + relative);
}
if (!existsSync(join(root, 'AGENTS.md')))
  fail('project-level Codex rules AGENTS.md are missing');

console.log('FORGE Agent Skills OK: ' + names.length + ' skills, ' + verified +
  ' verified upstream source files, revision ' + manifest.upstreamCommit.slice(0, 12));
