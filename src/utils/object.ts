const applyVariable = (str: string, variable: string) => {
  const toReplace = str.slice(str.indexOf('{'), str.lastIndexOf('}') + 1);
  return str.replace(toReplace, variable);
};

const isEmpty = (value: string | number | object): boolean => {
  if (value === null) {
    return true;
  } else if (typeof value !== 'number' && value === '') {
    return true;
  } else if (typeof value === 'undefined' || value === undefined) {
    return true;
  } else if (value !== null && typeof value === 'object' && !Object.keys(value).length) {
    return true;
  }

  return false;
};

const filterObject = (obj: Object, predicate: Function): any =>
  Object.keys(obj)
    .filter(key => predicate(obj[key]))
    .reduce((res, key) => ((res[key] = obj[key]), res), {});

export { applyVariable, isEmpty, filterObject };
