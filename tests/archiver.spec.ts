import path from 'node:path';
import fs from 'node:fs';
import JSZip from 'jszip';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import Archiver from '../src/archiver';
import tempy from './utils/tempy';
import del from './utils/del';

const { root } = tempy;

const zipHasFile = async (zipPath: string, fileName: string): Promise<boolean> => {
  const data = await fs.promises.readFile(zipPath);
  const zip = await JSZip.loadAsync(data);
  return Object.keys(zip.files).includes(fileName);
};

describe.sequential('Archiver', async () => {
  let testRoot = '';
  let file1 = '';
  let file2 = '';

  beforeEach(async () => {
    testRoot = await tempy.dir('archiver-test');
    file1 = await tempy.file(testRoot);
    file2 = await tempy.file(testRoot);
  });

  afterEach(async () => {
    vi.resetAllMocks();
    vi.clearAllMocks();
    await del(testRoot);
  });

  it('should create zip with the given glob', async () => {
    const archiver = new Archiver({
      format: 'zip',
      cwd: testRoot,
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
      cwd: testRoot,
      path: '*',
      output: './nest/archive_2.tar',
    });

    await archiver.run();
    expect(fs.existsSync(archiver.outfile)).toBe(true);
  });

  it('should create zip with the given directory', async () => {
    const archiver = new Archiver({
      format: 'zip',
      cwd: testRoot,
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
      cwd: testRoot,
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
      cwd: testRoot,
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
      cwd: testRoot,
      path: path.basename(file1),
      output: '.tmp/manifest.zip',
    });

    await archiver.run();
    expect(fs.existsSync(archiver.outfile)).toBe(true);

    expect(await zipHasFile(archiver.outfile, path.basename(file1))).toBe(true);
  });

  it('should guess the outfile filename for the given glob', async () => {
    const archiver = new Archiver({
      format: 'zip',
      cwd: testRoot,
      path: 'src/*',
    });

    await archiver.run();
    expect(fs.existsSync(archiver.outfile)).toBe(true);

    expect(archiver.outfile.endsWith('src.zip')).toBe(true);
  });

  it('should guess the outfile extension as .zip for given file', async () => {
    const archiver = new Archiver({
      format: 'zip',
      cwd: testRoot,
      path: path.basename(file1),
    });

    await archiver.run();
    expect(fs.existsSync(archiver.outfile)).toBe(true);

    expect(archiver.outfile.endsWith(`${path.basename(file1)}.zip`)).toBe(true);
  });

  it('should guess the outfile extension as .tar for given directory', async () => {
    const archiver = new Archiver({
      format: 'tar',
      cwd: testRoot,
      path: './',
    });

    await archiver.run();
    expect(fs.existsSync(archiver.outfile)).toBe(true);

    expect(path.basename(archiver.outfile)).toBe('archiver-test.tar');
  });

  it('should guess the outfile extension as .tar.gz for given directory', async () => {
    const archiver = new Archiver({
      format: 'tar',
      cwd: testRoot,
      path: './',
      archiveOptions: {
        gzip: true,
      },
    });

    await archiver.run();
    expect(fs.existsSync(archiver.outfile)).toBe(true);

    expect(path.basename(archiver.outfile)).toBe('archiver-test.tar.gz');
  });

  it('should throw error when input does not exist', async () => {
    const archiver = new Archiver({
      cwd: testRoot,
      format: 'tar',
      path: 'not_exist.file',
      output: 'no.zip',
    });

    await expect(archiver.run()).rejects.toThrow("Path 'not_exist.file' does not exist");
  });
});
