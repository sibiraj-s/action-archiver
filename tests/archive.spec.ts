import path from 'node:path';
import fs from 'node:fs';
import {
  afterEach, beforeEach, describe, expect, it, jest,
} from '@jest/globals';
import * as core from '@actions/core';
import JSZip from 'jszip';

import Archiver from '../src/archiver';
import tempy from './utils/tempy';

const mockSetOutput = jest.spyOn(core, 'setOutput');
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
    await fs.promises.rm(root, { recursive: true, force: true });
    mockSetOutput.mockReset();
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

    expect(mockSetOutput).toHaveBeenCalled();
    expect(mockSetOutput).toBeCalledWith('archive', archiver.outfile);

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

    expect(mockSetOutput).toHaveBeenCalled();
    expect(mockSetOutput).toBeCalledWith('archive', archiver.outfile);
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

    expect(mockSetOutput).toHaveBeenCalled();
    expect(mockSetOutput).toBeCalledWith('archive', archiver.outfile);

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

    expect(mockSetOutput).toHaveBeenCalled();
    expect(mockSetOutput).toBeCalledWith('archive', archiver.outfile);

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

    expect(mockSetOutput).toHaveBeenCalled();
    expect(mockSetOutput).toBeCalledWith('archive', archiver.outfile);

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

    expect(mockSetOutput).toHaveBeenCalled();
    expect(mockSetOutput).toBeCalledWith('archive', archiver.outfile);

    expect(await zipHasFile(archiver.outfile, path.basename(file1))).toBe(true);
  });

  it('should guess the outfile name for given file', async () => {
    const archiver = new Archiver({
      format: 'zip',
      cwd: root,
      path: path.basename(file1),
    });

    await archiver.run();
    expect(fs.existsSync(archiver.outfile)).toBe(true);

    expect(mockSetOutput).toHaveBeenCalled();
    expect(mockSetOutput).toBeCalledWith('archive', archiver.outfile);

    expect(archiver.outfile.endsWith(`${path.basename(file1)}.zip`)).toBe(true);
  });

  it('should guess the outfile name for given directory', async () => {
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

    expect(mockSetOutput).toHaveBeenCalled();
    expect(mockSetOutput).toBeCalledWith('archive', archiver.outfile);

    expect(path.basename(archiver.outfile)).toBe('.tmp.tar.gz');
  });
});
