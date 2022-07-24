import axios from 'axios';
import url from 'url';
import path from 'path';
import { promises as fs } from 'fs';

import linkLoader from './linkLoader.js';
import imageLoader from './imageLoader.js';
import srcLoader from './srcLoader.js';
import { buildSourcesDirname, buildMainHTMLFilename } from '../pathBuilder.js';
import replaceSources from '../parseHTML/replaceSources.js';

export default (currentUrl, dest) => {
  let html;
  const { URL } = url;
  const currentURL = new URL(currentUrl);
  const sourcesDirname = buildSourcesDirname(currentURL);
  const destToSaveFiles = path.join(dest, sourcesDirname);
  console.log(destToSaveFiles, 'DIRECTORY_PATH');
  return axios.get(currentUrl)
    .then(({ data }) => {
      html = data;
      const localHTML = replaceSources(data, currentURL);
      const htmlFilename = buildMainHTMLFilename(currentURL);
      fs.writeFile(path.join(dest, htmlFilename), localHTML);
    })
    .catch((e) => console.log(e))
    .then(() => fs.mkdir(destToSaveFiles))
    .catch((e) => console.log(e, 'MAKEDIR_ERR'))
    .then(() => imageLoader(html, destToSaveFiles, currentURL))
    .catch((e) => console.log(e, 'IMAGE-LOAD_ERR'))
    .then(() => srcLoader(html, destToSaveFiles, currentURL))
    .catch((e) => console.log(e, 'SCRIPT-LOAD_ERR'))
    .then(() => linkLoader(html, destToSaveFiles, currentURL))
    .catch((e) => console.log('LINK-LOAD_ERR', e));
};
