#!/usr/bin/env node
import { program } from 'commander';
import loadHTML from '../src/index.js';

program
  .version('0.0.1')
  .description('Page loader utility')
  .arguments('<url> [dirpath]')
  .action((url, dirpath = process.cwd()) => {
    loadHTML(url, dirpath)
      .then(() => console.log(dirpath))
      .catch((e) => {
        console.error(e.message);
        process.exit(1);
      });
  });

program.parse(process.argv);
