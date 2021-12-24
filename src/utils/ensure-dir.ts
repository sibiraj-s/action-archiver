import fs from 'node:fs';

const ensureDir = async (dir: string): Promise<void> => {
  if (!fs.existsSync(dir)) {
    await fs.promises.mkdir(dir, { recursive: true });
  }
};

export default ensureDir;
