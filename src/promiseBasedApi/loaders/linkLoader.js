import axios from 'axios';
import path from 'path';
import { promises as fs } from 'fs';

import getSourceUrls from '../parseHTML/getSourceUrls.js';
import { buildFilenameFromUrl } from '../pathBuilder.js';

const saveLinkContent = (linkUrl, destToSaveFiles) => {
  const promise = axios.get(linkUrl)
    .then(({ data }) => {
      const output = path.join(destToSaveFiles, buildFilenameFromUrl(linkUrl));
      fs.writeFile(output, data);
    })
    .catch((e) => console.log(e));

  return promise;
};

export default (html, destToSaveFiles, currentURL) => {
  const localLinkUrls = getSourceUrls('link', html, currentURL);
  const promises = localLinkUrls.map((u) => saveLinkContent(u, destToSaveFiles));
  return Promise.all(promises);
};
