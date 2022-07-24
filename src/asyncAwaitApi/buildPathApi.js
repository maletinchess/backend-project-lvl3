/* eslint no-param-reassign: "error" */

import path from 'path';
import url from 'url';

export const mapFilename = (filename) => {
  const parsed = path.parse(filename);
  const { dir, base } = parsed;
  const newDirname = dir.split('').map((item) => {
    if (item.match(/\d/) || item.match(/\w/)) {
      return item;
    }
    return '-';
  }).join('');

  return `${newDirname}-${base}`;
};

export const buildLocalDirname = (parsedURL) => {
  const { hostname, pathname } = parsedURL;
  const dirname = path.join(hostname, pathname);
  return `${mapFilename(dirname)}_files`;
};

export const buildSourcePath = (parsedURL, sourcePath) => {
  const dirname = buildLocalDirname(parsedURL);
  const { hostname, pathname } = parsedURL;
  const filename = sourcePath === pathname
    ? `${path.join(hostname, sourcePath)}.html`
    : `${path.join(hostname, sourcePath)}`;
  return path.join(dirname, `${mapFilename(filename)}`);
};
