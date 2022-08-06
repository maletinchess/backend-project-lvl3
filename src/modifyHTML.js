/* eslint no-param-reassign: "error" */

/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */

import _ from 'lodash';

import prettier from 'prettier';
import * as cheerio from 'cheerio';
import isLocal from './utils.js';
import { buildSourcePath, buildSourcesDirname } from './buildPathApi.js';

const getLocalNodesByTagname = (bindedHtml, tagName, baseURL) => {
  const mapping = {
    img: (node) => node.attribs.src,
    script: (node) => node.attribs.src,
    link: (node) => node.attribs.href,
  };

  return bindedHtml(tagName)
    .toArray()
    .filter((node) => _.has(node, 'name'))
    .filter((node) => {
      const url = mapping[tagName](node);
      return isLocal(url, baseURL);
    });
};

const replaceSources = (html, baseURL) => {
  const dirName = buildSourcesDirname(baseURL);

  const bindedHtml = cheerio.load(html);

  const localImageNodes = getLocalNodesByTagname(bindedHtml, 'img', baseURL);

  localImageNodes.forEach((node) => {
    const { src } = node.attribs;
    const newImageSrc = buildSourcePath(baseURL, src, dirName);
    node.attribs.src = newImageSrc;
  });

  const localLinkNodes = getLocalNodesByTagname(bindedHtml, 'link', baseURL);

  localLinkNodes.forEach((node) => {
    const { href } = node.attribs;
    const newLinkHref = buildSourcePath(baseURL, href, dirName);
    node.attribs.href = newLinkHref;
  });

  const localSrcNodes = getLocalNodesByTagname(bindedHtml, 'script', baseURL);

  localSrcNodes.forEach((node) => {
    const { src } = node.attribs;
    const newSrc = buildSourcePath(baseURL, src, dirName);
    node.attribs.src = newSrc;
  });

  return prettier.format(bindedHtml.html(), { parser: 'html' }).trim();
};

export default replaceSources;
