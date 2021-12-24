import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';

import ensureDir from '../../src/utils/ensure-dir';

const tempRoot = path.join(process.cwd(), '.tmp');

const getRandomId = () => crypto.randomBytes(16).toString('hex');
const getFileName = (last = '') => `file-${getRandomId()}${last}`;

const dir = async ({ root = tempRoot, suffix = 'random' }) => {
  const tmpDir = await fs.promises.mkdtemp(path.join(root, `tmp-${suffix}-`));
  return tmpDir;
};

const file = async (inputDir = tempRoot, fileName = getFileName()) => {
  const filePath = path.join(inputDir, fileName);
  await ensureDir(inputDir);
  await fs.promises.writeFile(filePath, 'lorem-ipsum', 'utf-8');
  return filePath;
};

export default {
  root: tempRoot,
  dir,
  file,
};
