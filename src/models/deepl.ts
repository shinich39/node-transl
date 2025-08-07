import { Browser, Page } from "puppeteer";
import { IProvider } from "../types/provider.js";
import { getISO6391 } from "../libs/utils.js";

export const deepl: IProvider = {
  name: "deepl",
  selector: `div[aria-labelledby="translation-target-heading"]`,
  maxLength: 1500,
  createUrl: function (text: string, from: string, to: string) {
    const fromCode = getISO6391(from);
    if (!fromCode) {
      throw new Error(`Invalid argument: ${from}`);
    }

    const toCode = getISO6391(to);
    if (!toCode) {
      throw new Error(`Invalid argument: ${to}`);
    }

    const encodedText = encodeURIComponent(text);

    return `https://www.deepl.com/translator#${fromCode}/${toCode}/${encodedText}`;
  },
}