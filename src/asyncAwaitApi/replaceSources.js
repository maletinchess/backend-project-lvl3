/* eslint no-param-reassign: "error" */

import * as cheerio from 'cheerio';
import _ from 'lodash';
import prettier from 'prettier';
import url from 'url';
import path from 'path';

import { buildSourcePath } from './buildPathApi.js';

const { URL } = url;

const isLocal = (refURL, currentURL) => refURL.host === currentURL.host;

const replaceSources = (parsedURL, html) => {
  const $ = cheerio.load(html);
  const imageNodes = $('img').toArray().filter((node) => _.has(node, 'name'));
  imageNodes.forEach((node) => {
    const { src } = node.attribs;
    const newImageSrc = buildSourcePath(parsedURL, src, '.png');
    node.attribs.src = newImageSrc;
  });

  const linkNodes = $('link').toArray().filter((node) => _.has(node, 'name'));
  linkNodes.forEach((node) => {
    const { href } = node.attribs;
    const refURL = new URL(href, parsedURL.toString());

    const newHref = isLocal(refURL, parsedURL) ? buildSourcePath(parsedURL, href, '.css') : href;
    node.attribs.href = newHref;
  });

  const scriptNodes = $('script').toArray().filter((node) => _.has(node, 'name'));
  scriptNodes.forEach((node) => {
    const { src } = node.attribs;
    const refURL = new URL(src);

    const { pathname } = refURL;

    const newSrc = isLocal(refURL, parsedURL) ? buildSourcePath(parsedURL, pathname, '.js') : src;
    node.attribs.src = newSrc;
  });

  return prettier.format($.html(), { parser: 'html' }).trim();
};

export default replaceSources;
