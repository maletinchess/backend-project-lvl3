#!/usr/bin/env node
import { program } from 'commander';
import loadHTML from '../src/index.js';

program
  .version('0.0.1')
  .description('Page loader utility')
  .arguments('<url> [dirpath]')
  .action((url, dirpath = process.cwd()) => {
    loadHTML(url, dirpath);
    console.log(dirpath);
  });

program.parse(process.argv);
