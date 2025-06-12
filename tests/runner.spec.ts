import fs from 'node:fs';
import path from 'node:path';
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as core from '@actions/core';

import run from '../src/runner';
import ensureDir from '../src/utils/ensure-dir';
import tempy from './utils/tempy';
import del from './utils/del';

const mockStartGroup = vi.spyOn(core, 'startGroup');
const mockEndGroup = vi.spyOn(core, 'endGroup');
const mockSetOutput = vi.spyOn(core, 'setOutput');
const mockSetFailed = vi.spyOn(core, 'setFailed');

describe('Runner', () => {
  beforeEach(() => {
    ensureDir(tempy.root)
    process.env['INPUT_WORKING-DIRECTORY'] = '.tmp/runner-test';
  });

  afterEach(async () => {
    vi.resetAllMocks();
    vi.clearAllMocks();
    await del(path.join(tempy.root, 'runner-test'));
  });

  it('should create archive correctly', async () => {
    process.env.INPUT_FORMAT = 'tar';
    process.env.INPUT_PATH = '*';
    process.env.INPUT_OUTPUT = 'runner.zip';
    process.env.INPUT_GZIP = 'false';

    await run();
    const outfile = path.join(process.cwd(), '.tmp/runner-test/runner.zip');
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
    const outfile = path.join(process.cwd(), '.tmp/runner-test/runner_a.zip');
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
