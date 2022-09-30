/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */

import { promises as fs } from 'fs';
import * as cheerio from 'cheerio';
import prettier from 'prettier';
import { URL } from 'url';

const isLocal = (sourceLink, baseURL) => {
  const sourceURL = new URL(sourceLink, baseURL.toString());
  const sourceHost = sourceURL.host;
  const currentHost = baseURL.host;

  return currentHost === sourceHost;
};

const tags = [
  { tagname: 'link', attr: 'href' },
  { tagname: 'script', attr: 'src' },
  { tagname: 'img', attr: 'src' },
];

const readHTML = async (filepath, baseURL) => {
  const html = await fs.readFile(filepath, 'utf-8');
  const $ = cheerio.load(html);
  const nodes = tags.flatMap(({ tagname, attr }) => {
    const tagsNodes = $(tagname);
    const mapped = tagsNodes.map((_i, el) => {
      const elem = $(el);
      const src = elem.attr(attr);
      const srcUrl = new URL(src, baseURL.toString()).toString();
      if (isLocal(srcUrl, baseURL)) {
        return { urlToFetch: srcUrl };
      }
      return null;
    });
    return mapped.toArray();
  });

  console.log(nodes);

  const prettified = prettier.format($.html(), { parser: 'html' });
  console.log(prettified);
};

const modifyHTML = async (filepath) => {
  const html = await fs.readFile(filepath, 'utf-8');
  const $ = cheerio.load(html);
  tags.forEach(({ tagname, attr }) => {
    const nodes = $(tagname);
    nodes.each((_i, el) => {
      const elem = $(el);
      const src = elem.attr(attr);
      elem.attr(attr, `${src}---XXX`);
    });
  });

  const prettified = prettier.format($.html(), { parser: 'html' });
  console.log(prettified);
};

const u = new URL('https://ru.hexlet.io/courses');

readHTML('/home/maletinchess2022/hexlet/backend-project-lvl3/__fixtures__/body-fixture.html', u);

modifyHTML('/home/maletinchess2022/hexlet/backend-project-lvl3/__fixtures__/body-fixture.html');
