import url from 'url';
import * as cheerio from 'cheerio';
import isLocal from './utils.js';

const { URL } = url;

const mapToUrl = (inputs, currentURL, local = true) => {
  const mappedUrls = inputs.map((input) => new URL(input, currentURL.toString()).toString());
  if (!local) {
    return mappedUrls;
  }
  return mappedUrls.filter((u) => isLocal(u, currentURL));
};

const extractLinks = (html) => {
  const $ = cheerio.load(html);
  const links = $('link').toArray().map((i) => i.attribs.href.trim());
  return links;
};

const extractScripts = (html) => {
  const $ = cheerio.load(html);
  const scripts = $('script').toArray().map((i) => i.attribs.src).filter((i) => i);
  return scripts;
};

const extractImages = (html) => {
  const $ = cheerio.load(html);
  const images = $('img').toArray().map((i) => i.attribs.src);
  return images;
};

const extractUrls = (html, baseURL) => {
  const links = mapToUrl(extractLinks(html), baseURL).map((l) => ({ urlToFetchContent: l, contentType: 'link' }));
  const scripts = mapToUrl(extractScripts(html), baseURL).map((s) => ({ urlToFetchContent: s, contentType: 'script' }));
  const images = mapToUrl(extractImages(html), baseURL).map((i) => ({ urlToFetchContent: i, contentType: 'image' }));
  return [...links, ...scripts, ...images];
};

export default extractUrls;
