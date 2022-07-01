#!/usr/bin/env node
import { program } from 'commander';
import { getFileNameFromUrl } from '../src/utils.js';
import loadHTML from '../src/index.js';

program
  .version('0.0.1')
  .description('Page loader utility')
  .arguments('<url> [dirpath]')
  .action((url, dirpath = process.cwd()) => {
    loadHTML(url, dirpath);
    console.log(getFileNameFromUrl(url));
  });

program.parse(process.argv);
