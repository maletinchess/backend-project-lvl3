import _ from 'lodash';
import isLocal from '../utils.js';

const getSourceLink = (node, type) => {
  const sourceLinks = {
    img: node.attribs.src,
    src: node.attribs.src,
    link: node.attribs.href,
  };

  return sourceLinks[type];
};

const isLocalNode = (node, type, currentURL) => {
  const sourceLink = getSourceLink(node, type);
  return isLocal(sourceLink, currentURL);
};

export const getNodes = (bindedHtml, source) => {
  const nodes = bindedHtml(source);
  const nodeArr = nodes.toArray();
  return nodeArr.filter((node) => _.has(node, 'name'));
};

const filterLocalNodes = (nodes, currentURL, type) => nodes
  .filter((node) => isLocalNode(node, type, currentURL));

export const filterLocalSrcNodes = (nodes, currentURL) => filterLocalNodes(nodes, currentURL, 'src');

export const filterLocalImageNodes = (nodes, currentURL) => filterLocalNodes(nodes, currentURL, 'img');

export const filterLocalLinkNodes = (nodes, currentURL) => filterLocalNodes(nodes, currentURL, 'link');
