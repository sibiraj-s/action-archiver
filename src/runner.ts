import path from 'node:path';
import * as core from '@actions/core';
import type { ArchiverOptions, Format } from 'archiver';

import Archiver from './archiver';
import cleanObj from './utils/clean-object';
import { ZlibOptions } from './types';

const getArchiverOptions = (format: Format): ArchiverOptions => {
  const compressionLevel = core.getInput('compression-level');

  const zlibOptions: ZlibOptions = {
    level: Number(compressionLevel),
  };

  const options: ArchiverOptions = {};

  switch (format) {
    case 'zip': {
      options.zlib = cleanObj(zlibOptions);
      break;
    }

    case 'tar': {
      options.gzip = core.getBooleanInput('gzip');
      options.gzipOptions = cleanObj(zlibOptions);
      break;
    }

    default:
      break;
  }

  return options;
};

const run = async () => {
  core.startGroup('Archiver');
  const format = core.getInput('format', { required: true }) as Format;

  if (!Archiver.isRegisteredFormat(format)) {
    throw new Error(`Format '${format}' is not registered.`);
  }

  const inputPath = core.getInput('path', { required: true });
  const output = core.getInput('output', { required: true });
  const workingDirectory = core.getInput('working-directory');

  const options = getArchiverOptions(format);
  const cwd = path.join(process.cwd(), workingDirectory);

  const archiver = new Archiver({
    cwd,
    format,
    path: inputPath,
    output,
    archiveOptions: cleanObj(options),
  });

  await archiver.run();
  core.endGroup();
};

export default run;
