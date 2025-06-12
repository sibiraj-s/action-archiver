import path from 'node:path';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';

import ensureDir from '../../src/utils/ensure-dir';

const tempRoot = path.join(process.cwd(), '.tmp');

const getRandomId = () => crypto.randomBytes(16).toString('hex');
const getFileName = (last = '') => `file-${getRandomId()}${last}`;

const tempDir = async (dirName: string) => {
  await ensureDir(tempRoot); // Ensure parent exists
  const dirPath = path.join(tempRoot, dirName);
  await ensureDir(dirPath);
  return dirPath;
};

const file = async (inputDir = tempRoot, fileName = getFileName()) => {
  const filePath = path.join(inputDir, fileName);
  await ensureDir(inputDir);
  await fs.writeFile(filePath, 'lorem-ipsum', 'utf-8');
  return filePath;
};

export default {
  root: tempRoot,
  dir: tempDir,
  file,
};
