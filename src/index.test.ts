import { describe, test } from "node:test";
import assert from "node:assert";
import path from "node:path";
import fs from "node:fs";
import { Tranl } from "./index";

describe(path.basename(import.meta.filename), () => {
  
  test("test", async () => {
    try {
      // const text = fs.readFileSync('test/mobydick.txt', 'utf8');
      const text = `
      The baby was lying on her back.
      A blue bird flew in through the window.
      The blue bird had blue eyes.
      `.trim();

      const from = "en";
      const to = "ko";

      const type = "google";
      // const type = "papago";
      // const type = "deepl";
      // const type = "yandex";
      // const type = "reverso";

      const t = new Tranl();
      // t.headless = false;
      t.minDelay = 512;
      t.maxDelay = 1536;
      t.translateSize = 1024;

      t.onQueue = (line, index, lines) => {
        console.log(`onQueue()`, index, !!line.trim(), line);
        return !!line.trim(); // false => skip this line
      }

      t.onTranslate = (oldValue, newValue, index, lines) => {
        const isSkipped = typeof newValue === "undefined";
        console.log(`onTranslate()`, index, !isSkipped, oldValue, newValue);
        return newValue || oldValue;
      }

      t.onError = (value, index, lines) => {
        console.log(`onError()`, value, index);
        return `ERROR: ${value}`;
      }

      const result = await t.translate({
        type,
        text,
        from,
        to,
      });

      console.log("result", result);
      // fs.writeFileSync(`test/translated-mobydick-${type}-${to}.txt`, result, 'utf8');

      await t.close();
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
