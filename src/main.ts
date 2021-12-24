import core from '@actions/core';

import run from './runner';

try {
  run();
} catch (err) {
  core.setFailed(err.message);
}
