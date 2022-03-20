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

/**
 * Deinterleaves nested props at the root of the object
 * @example
 * {
 *    organDonor: true,
 *    treatingDoctor: {
 *      phone: '0621548962',
 *      address: {
 *        street: '1st avenue',
 *        city: 'Vancouver',
 *      },
 *    },
 *  }
 *
 *  gives
 *
 *  {
 *    organDonor: true,
 *    'treatingDoctor.phone': '0621548962',
 *    'treatingDoctor.address.street': '1st avenue',
 *    'treatingDoctor.address.city': 'Vancouver',
 *  }
 */
const denest = (obj: object, currentPath = '') =>
  Object.entries(obj)
    .map(([key, val]) => {
      if (val.toString() !== '[object Object]') {
        const prop = `${currentPath}${key}`;
        const res = {};
        res[prop] = val;
        return res;
      } else if (Array.isArray(val)) {
        return { [key]: val };
      } else {
        return denest(val, `${currentPath}${key}.`);
      }
    })
    .reduce((acc, e) => ({ ...acc, ...e }), {});

export { applyVariable, denest, isEmpty, filterObject };
