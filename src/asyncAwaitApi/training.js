/* eslint no-param-reassign: "error" */
import axios from 'axios';
import os from 'os';
import path from 'path';
import { promises as fs } from 'fs';
import url from 'url';
import {
  getImageLoadLinks, getFileNameFromUrl, changeLinksIMG, getImage, getHTML,
} from './utils.js';
import replaceSources from './replaceSources.js';
import { extractLinks, extractImages, extractScripts } from './parseHTML.js';

const imageAddress = 'https://cdn2.hexlet.io/derivations/image/original/eyJpZCI6IjliZGE3ZmE3YWM1OWMwZDI0NzY5Mzk3MTY0YzhkNTkzLnBuZyIsInN0b3JhZ2UiOiJjYWNoZSJ9?signature=6439e6270a4af9c68265c020725566cc95feb78d27e68d61fe826008bd4c50a6';

const saveImage = async (imageUrl) => {
  const { data } = await axios.get(imageUrl);
  const dest = await fs.mkdtemp(path.join(os.tmpdir(), 'TRAIN-'));
  const output = path.join(dest, 'image-expected.png');
  const exp = await fs.readFile('/home/maletinchess/projects/lvl3/backend-project-lvl3/__fixtures__/node-js-image-fixture.png');
  console.log(output);
  await fs.writeFile(output, data);
};

const { URL } = url;

const replaceTEST = async () => {
  const body = await fs.readFile('/home/maletinchess/projects/lvl3/backend-project-lvl3/__fixtures__/next-fixture.html', 'utf-8');
  const parsedURL = new URL('https://ru.hexlet.io/courses');
  const result = replaceSources(parsedURL, body);
  console.log(result);
};

const extractTEST = async () => {
  const body = await fs.readFile('/home/maletinchess/projects/lvl3/backend-project-lvl3/__fixtures__/next-fixture.html', 'utf-8');
  console.log(extractLinks(body));
  console.log(extractImages(body));
  console.log(extractScripts(body));
};

extractTEST();
