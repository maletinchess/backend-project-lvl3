import axios from 'axios';
import path from 'path';
import { promises as fs } from 'fs';

import getSourceUrls from '../parseHTML/getSourceUrls.js';
import { buildFilenameFromUrl } from '../pathBuilder.js';

const saveSRCContent = (srcUrl, destToSaveFiles) => {
  const promise = axios.get(srcUrl)
    .then(({ data }) => {
      const output = path.join(
        destToSaveFiles,
        buildFilenameFromUrl(srcUrl),
      );
      fs.writeFile(output, data);
    })
    .catch((e) => console.log(e));

  return promise;
};

export default (html, destToSaveFiles, currentURL) => {
  const localSRCUrls = getSourceUrls('src', html, currentURL);
  const promises = localSRCUrls.map((u) => saveSRCContent(u, destToSaveFiles));
  return Promise.all(promises);
};
