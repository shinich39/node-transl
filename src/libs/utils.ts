import CountryLanguage from '@ladjs/country-language';

export function getLangCode(
  type: "iso639-1"|"iso639-2"|"iso639-3"|"name"|"nativeName",
  code: string,
) {
  const lang = CountryLanguage.getLanguage(code);
  if (type === 'iso639-1') {
    return lang.iso639_1;
  } else if (type === 'iso639-2') {
    return lang.iso639_2;
  } else if (type === 'iso639-3') {
    return lang.iso639_3;
  } else if (type === 'name') {
    return lang.name[0];
  } else if (type === 'nativeName') {
    return lang.nativeName[0];
  } else {
    throw new Error(`Invalid parameter: ${type}`);
  }
}

export const getISO6391 = function(code: string) {
  return getLangCode("iso639-1", code);
}

export const getISO6392 = function(code: string) {
  return getLangCode("iso639-2", code);
}

export const getISO6393 = function(code: string) {
  return getLangCode("iso639-3", code);
}

export function wait(delay: number) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, delay);
  });
}

/**
 * @returns min <= n < max
 */
export function generateFloat(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
/**
 * @returns min <= n < max
 */
export function generateInt(min: number, max: number) {
  return Math.floor(generateFloat(min, max));
}