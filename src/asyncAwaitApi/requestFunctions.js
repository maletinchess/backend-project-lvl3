import axios from 'axios';
import { extractLinks } from './parseHTML.js';

const getImage = (url) => axios.get(url, { responseType: 'arraybuffer' });

const getHtml = (url) => axios.get(url)
  .then(({ data }) => data);

const getScript = (url) => axios.get(url).then(({ data }) => data);

const getLink = (url) => axios.get(url).then(({ data }) => data);

const getSource = {
  image: (url) => getImage(url),
  html: (url) => getHtml(url),
  getScript: (url) => getScript(url),
  link: (url) => getLink(url),
};

getHtml('https://ru.hexlet.io/courses/js-advanced-testing/lessons/fixtures/theory_unit');

export default getSource;
