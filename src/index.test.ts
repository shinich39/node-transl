import { describe, test } from "node:test";
import assert from "node:assert";
import path from "node:path";
import fs from "node:fs";
import { translate } from "./index";

describe(path.basename(import.meta.filename), () => {
  
  test("test", async () => {
    try {
      const headless = true;

      // const text = fs.readFileSync('test/mobydick.txt', 'utf8');
      const text = `
      The baby was lying on her back.
      A blue bird flew in through the window.
      The blue bird had blue eyes.
      `.trim();

      const from = "en";
      const to = "ko";

      // const type = "google";
      // const type = "papago";
      // const type = "deepl";
      // const type = "yandex";
      const type = "reverso";

      const result = await translate({
        // headless,
        type,
        text,
        from,
        to,
        onQueue: (line, index, lines) => {
          console.log(`onQueue()`, index, !!line.trim(), line);
          return !!line.trim();
        },
        onTranslate: (oldValue, newValue, index) => {
          console.log(`onTranslate()`, index, !!newValue, oldValue, newValue);
          return newValue || oldValue;
        },
        onError: (value, index) => {
          console.log(`onError()`, value, index);
          return `ERROR: ${value}`;
        },
      });

      console.log("result", result);
      // fs.writeFileSync(`test/translated-mobydick-${type}-${to}.txt`, result, 'utf8');
    } catch(err) {
      console.error(err);
    }
  });
});

function eq(a: any, b: any, msg?: string | Error) {
  return typeof a === "object"
    ? assert.deepStrictEqual(a, b, msg)
    : assert.strictEqual(a, b, msg);
}
