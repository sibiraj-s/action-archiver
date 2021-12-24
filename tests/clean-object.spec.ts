import { describe, expect, it } from '@jest/globals';
import cleanObj from '../src/utils/clean-object';

describe('Util: Clean Object', () => {
  it('should remove falsy values', () => {
    expect(cleanObj({ a: 1, b: undefined })).toMatchObject({ a: 1 });
  });
});
