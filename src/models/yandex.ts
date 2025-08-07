import { IProvider } from "../types/provider.js";
import { getISO6391 } from "../libs/utils.js";

export const yandex: IProvider = {
  name: "yandex",
  selector: "#dstBox .nI3G8IFy_0MnBmqtxi8Z",
  maxLength: 10000,
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

    return `https://translate.yandex.com/?source_lang=${fromCode}&target_lang=${toCode}&text=${encodedText}`;
  },
}