import type { ArchiverOptions, Format } from 'archiver';

export interface Inputs {
  workingDirectory: string;
  format: Format;
  path: string;
  output: string;
  gzip: boolean;
  compressionLevel: number;
  ignore: string[];
}

export type ArchiveType = 'glob' | 'directory' | 'file' | '';

export interface Options {
  cwd: string;
  format: Format;
  path: string;
  output?: string;
  ignore?: string[];
  archiveOptions?: ArchiverOptions;
}

export interface ZlibOptions {
  level: number;
}

export { ArchiverOptions, Format };
