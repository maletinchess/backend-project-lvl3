#!/usr/bin/env node
import { program } from 'commander';
import loadHTML from '../src/index.js';

program
  .version('0.0.1')
  .description('Page loader utility')
  .arguments('<url> [dirpath]')
  .description('Page loader utility')
  .option('-o, --output [dir]', 'output dir', process.cwd())
  .action((url) => {
    loadHTML(url, program.opts().output)
      .then((filename) => {
        const message = `Page was successfully downloaded into ${filename}`;
        console.log(message);
      })
      .catch((e) => {
        console.error(e.message);
        process.exit(1);
      });
  });

program.parse(process.argv);
