export const handleAxiosError = (error) => {
  if (error.response) {
    console.error(error.message);
    console.error(error.response.status);
    console.error(error.response.headers);
    throw new Error('bad response');
  }
  throw new Error(`${error.message}`);
};

export const handleSystemError = (error) => {
  const { code, path, syscall } = error;
  console.error(code, path, syscall);
  throw new Error(`${error.message}`);
};

export const handleError = (e) => {
  if (e.isAxiosError) {
    handleAxiosError(e);
  } else {
    handleSystemError(e);
  }
};

export const makeRandomString = (length = 5) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
  let randomString = '';
  for (let i = 0; i < length; i += 1) {
    randomString = `${randomString}${possible.charAt(Math.floor(Math.random() * possible.length))}`;
  }

  return randomString;
};
