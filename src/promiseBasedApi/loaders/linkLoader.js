import axios from 'axios';
import path from 'path';
import { promises as fs } from 'fs';

import getSourceUrls from '../parseHTML/getSourceUrls.js';
import replaceSources from '../parseHTML/replaceSources.js';
import { buildFilename, buildMainHTMLFilename } from '../pathBuilder.js';

const saveLinkContent = (linkUrl, destToSaveFiles, currentURL) => {
  const promise = axios.get(linkUrl)
    .then(({ data }) => {
      if (currentURL.href === linkUrl) {
        const output = path.join(destToSaveFiles, buildMainHTMLFilename(currentURL, linkUrl));
        const localHTML = replaceSources(data, currentURL);
        fs.writeFile(output, localHTML);
      }
      const output = path.join(destToSaveFiles, buildFilename(currentURL, linkUrl));
      fs.writeFile(output, data);
    })
    .catch((e) => console.log(e));

  return promise;
};

export default (html, destToSaveFiles, currentURL) => {
  const localLinkUrls = getSourceUrls('link', html, currentURL);
  const promises = localLinkUrls.map((u) => saveLinkContent(u, destToSaveFiles, currentURL));
  return Promise.all(promises);
};
