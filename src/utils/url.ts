const isUrlValid = (value: string): boolean => {
  const urlRegex = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
  const regexp = new RegExp(urlRegex);
  return regexp.test(value);
};

export { isUrlValid };
