import fs from 'node:fs/promises';

const del = async (path: string) => {
  await fs.rm(path, { force: true, recursive: true });
};

export default del;
