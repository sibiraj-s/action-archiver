import fs from 'node:fs';
import path from 'node:path';
import {
  afterEach, beforeEach, describe, expect, it, jest,
} from '@jest/globals';
import * as core from '@actions/core';

import run from '../src/runner';
import tempy from './utils/tempy';
import del from './utils/del';

const mockStartGroup = jest.spyOn(core, 'startGroup');
const mockEndGroup = jest.spyOn(core, 'endGroup');
const mockSetOutput = jest.spyOn(core, 'setOutput');
const mockSetFailed = jest.spyOn(core, 'setFailed');

describe('Runner', () => {
  beforeEach(() => {
    process.env['INPUT_WORKING-DIRECTORY'] = '.tmp';
  });

  afterEach(async () => {
    jest.resetAllMocks();
    jest.clearAllMocks();
    await del(tempy.root);
  });

  it('should create archive correctly', async () => {
    process.env.INPUT_FORMAT = 'tar';
    process.env.INPUT_PATH = '*';
    process.env.INPUT_OUTPUT = 'runner.zip';
    process.env.INPUT_GZIP = 'false';

    await run();
    const outfile = path.join(process.cwd(), '.tmp/runner.zip');
    expect(fs.existsSync(outfile)).toBe(true);

    expect(mockStartGroup).toHaveBeenCalled();

    expect(mockStartGroup).toHaveBeenCalledWith('Archiver');
    expect(mockEndGroup).toHaveBeenCalled();

    expect(mockSetOutput).toHaveBeenCalled();
    expect(mockSetOutput).toHaveBeenCalledWith('archive', outfile);

    expect(mockSetFailed).not.toHaveBeenCalled();
  });

  it('should create a zip archive', async () => {
    process.env.INPUT_FORMAT = 'zip';
    process.env.INPUT_PATH = '*';
    process.env.INPUT_OUTPUT = 'runner_a.zip';

    await run();
    const outfile = path.join(process.cwd(), '.tmp/runner_a.zip');
    expect(fs.existsSync(outfile)).toBe(true);
  });

  it('should set job as failed for unknown format', async () => {
    process.env.INPUT_FORMAT = 'xar';
    process.env.INPUT_PATH = '*';
    process.env.INPUT_OUTPUT = 'runner_a.zip';

    await run();

    expect(mockSetFailed).toHaveBeenCalled();
    expect(mockSetFailed).toHaveBeenCalledWith('Format \'xar\' is not registered.');
  });
});
