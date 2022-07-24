/* eslint no-param-reassign: "error" */

import path from 'path';
import url from 'url';

const { URL } = url;

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

export const buildSourcesDirname = (parsedURL) => {
  const { hostname, pathname } = parsedURL;
  const dirname = path.join(hostname, pathname);
  return `${mapFilename(dirname)}_files`;
};

export const buildFilename = (parsedURL, sourcePath) => {
  const { hostname, pathname } = parsedURL;
  if (pathname === sourcePath) {
    const sourcePathWithHTML = `${sourcePath}.html`;
    return mapFilename(path.join(hostname, sourcePathWithHTML));
  }

  const mappedURL = new URL(sourcePath, parsedURL.toString());

  return mapFilename(path.join(mappedURL.hostname, mappedURL.pathname));
};

export const buildFilenameFromUrl = (sourceUrl) => {
  const { hostname, pathname } = new URL(sourceUrl);
  return mapFilename(path.join(hostname, pathname));
};

export const buildMainHTMLFilename = (parsedURL) => {
  const { hostname, pathname } = parsedURL;
  return mapFilename(path.join(hostname, `${pathname}.html`));
};

// add buildFilenameFromUrl function //
export const buildSourcePath = (parsedURL, sourcePath, dirname) => path.join(
  dirname,
  buildFilename(parsedURL, sourcePath),
);
