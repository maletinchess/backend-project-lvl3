import axios from 'axios';
import path from 'path';
import { promises as fs } from 'fs';

import getSourceUrls from '../parseHTML/getSourceUrls.js';
import { buildFilenameFromUrl } from '../pathBuilder.js';

const saveImage = (imageUrl, destToSaveFiles) => {
  const promise = axios.get(imageUrl, { responseType: 'arraybuffer' })
    .then(({ data }) => {
      const output = path.join(destToSaveFiles, buildFilenameFromUrl(imageUrl));
      fs.writeFile(output, data);
    })
    .catch((e) => console.log(e));

  return promise;
};

export default (html, destToSaveFiles, currentURL) => {
  const localImageUrls = getSourceUrls('img', html, currentURL);
  const promises = localImageUrls.map((u) => saveImage(u, destToSaveFiles));
  return Promise.all(promises);
};
