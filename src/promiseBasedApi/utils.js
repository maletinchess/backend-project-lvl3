import url from 'url';

const isLocal = (sourceLink, currentURL) => {
  const { URL } = url;
  const sourceURL = new URL(sourceLink, currentURL.toString());
  const sourceHost = sourceURL.host;
  const currentHost = currentURL.host;

  return currentHost === sourceHost;
};

export default isLocal;
