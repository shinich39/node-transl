import { IProvider } from "../types/provider.js";
import { getISO6392 } from "../libs/utils.js";

export const reverso: IProvider = {
  name: "reverso",
  selector: ".sentence-wrapper_target span",
  maxLength: 2000,
  createUrl: function (text: string, from: string, to: string) {
    const fromCode = getISO6392(from);
    if (!fromCode) {
      throw new Error(`Invalid argument: ${from}`);
    }

    const toCode = getISO6392(to);
    if (!toCode) {
      throw new Error(`Invalid argument: ${to}`);
    }

    const encodedText = encodeURIComponent(text)
      .replace(/%26/g, '%2526'); // fix encoding &

    return `https://www.reverso.net/text-translation#sl=${fromCode}&tl=${toCode}&text=${encodedText}`;
  },
}