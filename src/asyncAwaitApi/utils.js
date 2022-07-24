/* eslint no-param-reassign: "error" */

import * as cheerio from 'cheerio';
import _ from 'lodash';

import axios from 'axios';
import path from 'path';
import url from 'url';
import prettier from 'prettier';

const { URL } = url;

export const getImage = async (imageUrl) => {
  const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
  const { data } = response;
  return data;
};

export const getHTML = async (pageURL) => {
  const response = await axios.get(pageURL);
  const { data } = response;
  return data;
};

export const getFileNameFromUrl = (pageURL, ext = '') => {
  const urlObj = new URL(pageURL);
  const { hostname, pathname } = urlObj;
  const parsedPath = path.parse(pathname);
  const filename = `${hostname}${path.join(parsedPath.dir, parsedPath.name)}`;
  const mappedFilename = filename.split('').map((item) => {
    if (item.match(/\d/) || item.match(/\w/)) {
      return item;
    }
    return '-';
  }).join('');
  return `${mappedFilename}${ext}`;
};

export const getImageLoadLinks = (html, mainUrl) => {
  const $ = cheerio.load(html);
  const imagePaths = Object
    .values($('img'))
    .filter((node) => _.has(node, 'name'))
    .map((node) => {
      const imageUrl = new URL(mainUrl);
      imageUrl.pathname = node.attribs.src;
      return imageUrl.toString();
    });
  return imagePaths;
};

export const changeLinksIMG = (body, mainUrl) => {
  const $ = cheerio.load(body);
  const nodes = $('img').toArray();
  nodes.forEach((node) => {
    if (_.has(node, 'name')) {
      const imageUrl = new URL(mainUrl);
      imageUrl.pathname = node.attribs.src;
      const filename = getFileNameFromUrl(imageUrl.toString(), '.png');
      const dest = `${getFileNameFromUrl(mainUrl)}_files`;
      const pathname = path.join(dest, filename);
      node.attribs.src = pathname;
    }
  });
  return prettier.format($.html(), { parser: 'html' }).trim();
};
