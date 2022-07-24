import url from 'url';
import * as cheerio from 'cheerio';
import isLocal from '../utils.js';
import { getNodes } from './nodesApi.js';

const { URL } = url;

const mapToUrl = (inputs, currentURL, local = true) => {
  const mappedUrls = inputs.map((input) => new URL(input, currentURL.toString()).toString());
  if (!local) {
    return mappedUrls;
  }
  return mappedUrls.filter((u) => isLocal(u, currentURL));
};

const extractLinks = (html) => {
  const binded = cheerio.load(html);
  return getNodes(binded, 'link').map((node) => node.attribs.href);
};

const extractScripts = (html) => {
  const binded = cheerio.load(html);
  const scriptNodes = getNodes(binded, 'script');
  const scripts = scriptNodes.map((node) => node.attribs.src);
  return scripts;
};

const extractImages = (html) => {
  const binded = cheerio.load(html);
  return getNodes(binded, 'img').map((node) => node.attribs.src);
};

export default (source, html, currentURL, local = true) => {
  const mapped = {
    link: () => mapToUrl(extractLinks(html), currentURL, local),
    img: () => mapToUrl(extractImages(html), currentURL, local),
    src: () => mapToUrl(extractScripts(html), currentURL, local),
  };
  return mapped[source]();
};
