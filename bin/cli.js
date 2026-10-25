#!/usr/bin/env node
import { runCLI } from '../lib/cli.js';

try {
  runCLI();
} catch (error) {
  console.error(`Unparalleled: ${error.message}`);
  process.exitCode = 1;
}
