import url from 'url';

const isLocal = (sourceLink, currentURL) => {
  const { URL } = url;
  const sourceURL = new URL(sourceLink, currentURL.toString());
  const sourceHost = sourceURL.host;
  const currentHost = currentURL.host;

  return currentHost === sourceHost;
};

export const handleAxiosError = (error) => {
  if (error.response) {
    console.error(error.response.data);
    console.error(error.response.status);
    console.error(error.response.headers);
  } else if (error.request) {
    console.error((error.request));
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('Error', error.message);
  }
};

export const handleSystemError = (error) => {
  console.log(error.code);
};

export default isLocal;
