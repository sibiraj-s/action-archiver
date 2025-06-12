import path from 'node:path';
import fs from 'node:fs';
import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import JSZip from 'jszip';

import Archiver from '../src/archiver';
import tempy from './utils/tempy';
import del from './utils/del';

const { root } = tempy;

const zipHasFile = async (zipPath: string, fileName: string): Promise<boolean> => {
  const data = await fs.promises.readFile(zipPath);
  const zip = await JSZip.loadAsync(data);
  return Object.keys(zip.files).includes(fileName);
};

describe('Archiver', () => {
  let file1 = '';
  let file2 = '';

  beforeEach(async () => {
    file1 = await tempy.file();
    file2 = await tempy.file();
  });

  afterEach(async () => {
    await del(root);
  });

  it('should create zip with the given glob', async () => {
    const archiver = new Archiver({
      format: 'zip',
      cwd: root,
      path: '*',
      output: 'archive_1.zip',
    });

    await archiver.run();
    expect(fs.existsSync(archiver.outfile)).toBe(true);

    expect(await zipHasFile(archiver.outfile, path.basename(file1))).toBe(true);
    expect(await zipHasFile(archiver.outfile, path.basename(file2))).toBe(true);
  });

  it('should create tar with the given glob', async () => {
    const archiver = new Archiver({
      format: 'tar',
      cwd: root,
      path: '*',
      output: './nest/archive_2.tar',
    });

    await archiver.run();
    expect(fs.existsSync(archiver.outfile)).toBe(true);
  });

  it('should create zip with the given directory', async () => {
    const archiver = new Archiver({
      format: 'zip',
      cwd: root,
      path: './',
      output: 'archive_3.zip',
    });

    await archiver.run();
    expect(fs.existsSync(archiver.outfile)).toBe(true);

    expect(await zipHasFile(archiver.outfile, path.basename(file1))).toBe(true);
    expect(await zipHasFile(archiver.outfile, path.basename(file2))).toBe(true);
  });

  it('should ignore files in the given directory', async () => {
    const archiver = new Archiver({
      format: 'zip',
      cwd: root,
      path: './',
      output: 'archive_4.zip',
      ignore: [
        path.basename(file2),
      ],
    });

    await archiver.run();
    expect(fs.existsSync(archiver.outfile)).toBe(true);

    expect(await zipHasFile(archiver.outfile, path.basename(file1))).toBe(true);
    expect(await zipHasFile(archiver.outfile, path.basename(file2))).toBe(false);
  });

  it('should not include the outfile in the archive', async () => {
    const archiver = new Archiver({
      format: 'zip',
      cwd: root,
      path: './',
      output: 'archive_5.zip',
    });

    await archiver.run();
    expect(fs.existsSync(archiver.outfile)).toBe(true);

    expect(await zipHasFile(archiver.outfile, path.basename(file1))).toBe(true);
    expect(await zipHasFile(archiver.outfile, path.basename(file2))).toBe(true);
    expect(await zipHasFile(archiver.outfile, 'archive_4.zip')).toBe(false);
  });

  it('should create zip with the given file', async () => {
    const archiver = new Archiver({
      format: 'zip',
      cwd: root,
      path: path.basename(file1),
      output: '.tmp/manifest.zip',
    });

    await archiver.run();
    expect(fs.existsSync(archiver.outfile)).toBe(true);

    expect(await zipHasFile(archiver.outfile, path.basename(file1))).toBe(true);
  });

  it('should guess the outfile filename for the given flob', async () => {
    const archiver = new Archiver({
      format: 'zip',
      cwd: root,
      path: 'src/*',
    });

    await archiver.run();
    expect(fs.existsSync(archiver.outfile)).toBe(true);

    expect(archiver.outfile.endsWith('src.zip')).toBe(true);
  });

  it('should guess the outfile extension as .zip for given file', async () => {
    const archiver = new Archiver({
      format: 'zip',
      cwd: root,
      path: path.basename(file1),
    });

    await archiver.run();
    expect(fs.existsSync(archiver.outfile)).toBe(true);

    expect(archiver.outfile.endsWith(`${path.basename(file1)}.zip`)).toBe(true);
  });

  it('should guess the outfile extension as .tar for given directory', async () => {
    const archiver = new Archiver({
      format: 'tar',
      cwd: root,
      path: './',
    });

    await archiver.run();
    expect(fs.existsSync(archiver.outfile)).toBe(true);

    expect(path.basename(archiver.outfile)).toBe('.tmp.tar');
  });

  it('should guess the outfile extension as .tar.gz for given directory', async () => {
    const archiver = new Archiver({
      format: 'tar',
      cwd: root,
      path: './',
      archiveOptions: {
        gzip: true,
      },
    });

    await archiver.run();
    expect(fs.existsSync(archiver.outfile)).toBe(true);

    expect(path.basename(archiver.outfile)).toBe('.tmp.tar.gz');
  });

  it('should throw error when input does not exist', async () => {
    const archiver = new Archiver({
      cwd: root,
      format: 'tar',
      path: 'not_exist.file',
      output: 'no.zip',
    });

    await expect(archiver.run()).rejects.toThrow("Path 'not_exist.file' doesnot exist");
  });
});
