import { getISO6391 } from "../libs/utils.js";
import { IProvider } from "../types/provider.js";

export const bing: IProvider = {
  name: "bing",
  selector: "div#tta_output_ta",
  maxLength: 1000,
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

    return `https://www.bing.com/translator?from=${fromCode}&to=${toCode}&text=${encodedText}`;
  },
}