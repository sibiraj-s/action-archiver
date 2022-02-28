import path from 'node:path';
import * as core from '@actions/core';

import Archiver from './archiver';
import cleanObj from './utils/clean-object';
import type { ZlibOptions, ArchiverOptions, Format, Inputs } from './types';

const getArchiverOptions = (inputs: Inputs): ArchiverOptions => {
  const zlibOptions: ZlibOptions = {
    level: inputs.compressionLevel,
  };

  const options: ArchiverOptions = {};

  switch (inputs.format) {
    case 'zip': {
      options.zlib = cleanObj(zlibOptions);
      break;
    }

    case 'tar': {
      options.gzip = inputs.gzip;
      options.gzipOptions = cleanObj(zlibOptions);
      break;
    }

    default:
      break;
  }

  return options;
};

const getInputs = (): Inputs => {
  return {
    workingDirectory: core.getInput('working-directory'),
    format: core.getInput('format', { required: true }) as Format,
    path: core.getInput('path', { required: true }),
    output: core.getInput('output', { required: true }),
    gzip: core.getBooleanInput('gzip'),
    compressionLevel: Number(core.getInput('compression-level')),
    ignore: core.getMultilineInput('ignore'),
  };
};

const run = async (): Promise<void> => {
  try {
    core.startGroup('Archiver');

    const inputs = getInputs();

    if (!Archiver.isRegisteredFormat(inputs.format)) {
      throw new Error(`Format '${inputs.format}' is not registered.`);
    }

    const options = getArchiverOptions(inputs);
    const cwd = path.join(process.cwd(), inputs.workingDirectory);

    const archiver = new Archiver({
      cwd,
      format: inputs.format,
      path: inputs.path,
      output: inputs.output,
      archiveOptions: cleanObj(options),
      ignore: inputs.ignore,
    });

    await archiver.run();
    core.setOutput('archive', archiver.outfile);

    core.endGroup();
  } catch (err) {
    core.setFailed(err.message);
  }
};

export default run;
