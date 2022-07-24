/* eslint no-param-reassign: "error" */

/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */

import prettier from 'prettier';
import * as cheerio from 'cheerio';
import * as pathBuilder from '../pathBuilder.js';

import * as selector from './nodesApi.js';

const replaceSources = (html, currentURL) => {
  const dirName = pathBuilder.buildSourcesDirname(currentURL);

  const bindedHtml = cheerio.load(html);

  const imageNodes = selector.getNodes(bindedHtml, 'img');
  const localImageNodes = selector.filterLocalImageNodes(imageNodes, currentURL);

  localImageNodes.forEach((node) => {
    const { src } = node.attribs;
    const newImageSrc = pathBuilder.buildSourcePath(currentURL, src, dirName);
    node.attribs.src = newImageSrc;
  });

  const linkNodes = selector.getNodes(bindedHtml, 'link');
  const localLinkNodes = selector.filterLocalLinkNodes(linkNodes, currentURL);

  localLinkNodes.forEach((node) => {
    const { href } = node.attribs;
    const newLinkHref = pathBuilder.buildSourcePath(currentURL, href, dirName);
    node.attribs.href = newLinkHref;
  });

  const srcNodes = selector.getNodes(bindedHtml, 'script');
  const localSrcNodes = selector.filterLocalSrcNodes(srcNodes, currentURL);

  localSrcNodes.forEach((node) => {
    const { src } = node.attribs;
    const newSrc = pathBuilder.buildSourcePath(currentURL, src, dirName);
    node.attribs.src = newSrc;
  });

  return prettier.format(bindedHtml.html(), { parser: 'html' }).trim();
};

export default replaceSources;
