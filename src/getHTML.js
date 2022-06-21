import axios from 'axios';
import path from 'path';
import { promises as fs } from 'fs';
import url from 'url';

const { URL } = url;

export const getFileNameFromUrl = (pageURL) => {
  const urlObj = new URL(pageURL);
  const { hostname, pathname } = urlObj;
  const filename = `${hostname}${pathname}`;
  const mappedFilename = filename.split('').map((item) => {
    if (item.match(/\d/) || item.match(/\w/)) {
      return item;
    }
    return '-';
  }).join('');
  return `${mappedFilename}.html`;
};

const getHTML = async (pageURL, dest) => {
  const response = await axios.get(pageURL);
  const { data } = response;
  const outputpath = path.join(dest, getFileNameFromUrl(pageURL));
  await fs.writeFile(outputpath, data);
};

export default getHTML;
