import { IProvider } from "../types/provider.js";
import { getISO6391 } from "../libs/utils.js";

export const papago: IProvider = {
  name: "papago",
  selector: "#txtTarget",
  maxLength: 3000,
  createUrl: function (text: string, from: string, to: string) {
    const fromCode = getISO6391(from);
    if (!fromCode) {
      throw new Error(`Invalid argument: ${from}`);
    }

    const toCode = getISO6391(to);
    if (!toCode) {
      throw new Error(`Invalid argument: ${to}`);
    }

    const encodedText = encodeURIComponent(text)
      .replace(/%26/g, '%25amp'); // fix encoding &
    
    return `https://papago.naver.com/?sk=${fromCode}&tk=${toCode}&st=${encodedText}`;
  },
}