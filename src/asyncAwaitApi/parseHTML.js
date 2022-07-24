/* eslint no-param-reassign: "error" */

import * as cheerio from 'cheerio';
import _ from 'lodash';

const extractSourcesApi = (html, source) => {
  const $ = cheerio.load(html);
  const paths = Object
    .values($(source))
    .filter((node) => _.has(node, 'name'))
    .map((node) => (source === 'link' ? node.attribs.href : node.attribs.src));
  return paths;
};

export const extractLinks = (html) => extractSourcesApi(html, 'link');

export const extractImages = (html) => extractSourcesApi(html, 'img');

export const extractScripts = (html) => extractSourcesApi(html, 'script');
