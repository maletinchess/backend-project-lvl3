import path from 'path';
import { promises as fs } from 'fs';
import {
  getImageLoadLinks, getFileNameFromUrl, changeLinksIMG, getImage, getHTML,
} from './utils.js';

const loadHTML = async (pageURL, dest) => {
  const body = await getHTML(pageURL);
  const newBody = changeLinksIMG(body, pageURL);
  const outputpath = path.join(dest, getFileNameFromUrl(pageURL, '.html'));
  await fs.writeFile(outputpath, newBody);
  await fs.mkdir(path.join(dest, 'files'));

  const imageLoadLinks = getImageLoadLinks(body, pageURL);
  const mappedLinks = imageLoadLinks.map(async (link) => {
    const image = await getImage(link);
    const outputPath = path.join(dest, 'files', getFileNameFromUrl(link, '.png'));
    const data = {
      image,
      outputPath,
    };
    return data;
  });
  const promise = Promise.all(mappedLinks);
  return promise.then((items) => {
    items.forEach((item) => {
      const { outputPath, image } = item;
      fs.writeFile(outputPath, image);
    });
  });
};

export default loadHTML;
