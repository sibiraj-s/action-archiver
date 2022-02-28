import path from 'node:path';
import fs from 'node:fs';
import archiver from 'archiver';
import isGlob from 'is-glob';

import ensureDir from './utils/ensure-dir';
import { ArchiveType, Options, Format } from './types';

const defaultOptions: Options = {
  cwd: process.cwd(),
  format: 'zip',
  output: '',
  path: '*',
  archiveOptions: {},
  ignore: [],
};

const getArchiveType = (input: string): ArchiveType => {
  if (isGlob(input)) {
    return 'glob';
  }

  if (!fs.existsSync(input)) {
    return '';
  }

  const stat = fs.lstatSync(input);

  if (stat.isDirectory()) {
    return 'directory';
  }

  return 'file';
};

const guessExt = (options: Options): string => {
  if (options.format === 'zip') {
    return '.zip';
  }

  if (options.archiveOptions?.gzip) {
    return '.tar.gz';
  }

  return '.tar';
};

const getOutfilename = (input: string, archiveType: ArchiveType, options: Options): string => {
  if (options.output) {
    return path.join(options.cwd, options.output);
  }

  if (archiveType === 'glob') {
    const pathArr = input.split('/');
    const globIndex = pathArr.findIndex((item) => (item ? isGlob(item) : false));
    const normalized = pathArr.slice(0, globIndex).join('/');

    const outfileName = path.parse(path.basename(normalized)).name + guessExt(options);

    return path.join(options.cwd, outfileName);
  }

  // directory
  // file
  const outfileName = path.parse(path.basename(input)).name + guessExt(options);
  return path.join(options.cwd, outfileName);
};

class Archiver {
  options = defaultOptions;
  outfile!: string;

  constructor(options = defaultOptions) {
    this.options = { ...defaultOptions, ...options };
  }

  static isRegisteredFormat(format: Format): boolean {
    return archiver.isRegisteredFormat(format);
  }

  async run(): Promise<void> {
    const archive = archiver(this.options.format, this.options.archiveOptions);

    const input = path.join(this.options.cwd, this.options.path);
    const archiveType = getArchiveType(input);
    this.outfile = getOutfilename(input, archiveType, this.options);

    if (!archiveType) {
      throw new Error(`Path '${this.options.path}' doesnot exist`);
    }

    const output = fs.createWriteStream(this.outfile);
    const streamClose = new Promise<void>((resolve) => {
      output.on('close', () => {
        resolve();
      });
    });

    archive.pipe(output);

    const destDir = path.dirname(this.outfile);
    await ensureDir(destDir);

    const globOptions = {
      ignore: [
        ...this.options.ignore || [],
        // don't include the outfile in the zip
        path.basename(this.outfile),
      ],
    };

    switch (archiveType) {
      case 'glob': {
        const entryData = {
          ...globOptions,
          cwd: this.options.cwd,
        };

        archive.glob(this.options.path, entryData);
        break;
      }

      case 'directory': {
        const entryData = {
          ...globOptions,
          cwd: input,
        };

        archive.glob('**/*', entryData);
        break;
      }

      case 'file': {
        archive.file(input, { name: path.basename(input) });
        break;
      }

      default:
        break;
    }

    await archive.finalize();
    await streamClose;
  }
}

export default Archiver;
