import { IProvider } from "../types/provider.js";
import { getISO6391 } from "../libs/utils.js";

export const google: IProvider = {
  name: "google",
  selector: "span.ryNqvb",
  maxLength: 5000,
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

    return `https://translate.google.com/?sl=${fromCode}&tl=${toCode}&text=${encodedText}&op=translate`;
  },
}