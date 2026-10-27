#!/usr/bin/env node
import { runCLI } from '../lib/cli.js';

try {
  const result = runCLI();
  if (result?.ok === false) process.exitCode = 1;
  if (typeof result?.status === 'number' && result.status !== 0) process.exitCode = result.status;
} catch (error) {
  console.error(`Unparalleled: ${error.message}`);
  process.exitCode = 1;
}
