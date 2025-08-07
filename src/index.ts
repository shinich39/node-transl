import { bing } from "./models/bing.js";
import { deepl } from "./models/deepl.js";
import { google } from "./models/google.js";
import { papago } from "./models/papago.js";
import { reverso } from "./models/reverso.js";
import { yandex } from "./models/yandex.js";
import { getContent, waitContent } from "./libs/web.js";
import { IQueue } from "./types/queue.js";
import { generateInt, wait } from "./libs/utils.js";

import puppeteerExtra from "puppeteer-extra";
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { PuppeteerLifeCycleEvent } from "puppeteer";

// add stealth plugin and use defaults (all evasion techniques)
const puppeteer = puppeteerExtra.default;
puppeteer.use(StealthPlugin());

const providers = {
  // bing, // unsupport linebreak
  deepl,
  google,
  papago,
  reverso, // bug: if disable headless option, browser closed
  yandex,
} as const;

export async function translate(
  {
    headless,
    cacheDir,
    type,
    text,
    from,
    to,
    size,
    minDelay,
    maxDelay,
    onQueue,
    onTranslate,
    onError,
  }: {
    headless?: boolean,
    /**
     * @default ".puppeteer"
     */
    cacheDir?: string,
    type: keyof typeof providers,
    text: string,
    from: string,
    to: string,
    /**
     * @default 1024
     */
    size?: number,
    /**
     * @default 512
     */
    minDelay?: number,
    /**
     * @default 1024
     */
    maxDelay?: number,
    onQueue?: (value: string, index: number, lines: string[]) => boolean,
    onTranslate?: (oldValue: string, newValue: string|undefined, index: number, lines: string[]) => string,
    onError?: (value: string, index: number, lines: string[]) => string,
  }
) {
  if (!size) {
    size = 1024;
  }
  if (!minDelay) {
    minDelay = 512;
  }
  if (!maxDelay) {
    maxDelay = 1024;
  }
  if (typeof headless !== "boolean") {
    headless = true;
  }
  if (!cacheDir) {
    cacheDir = ".puppeteer";
  }

  const browser = await puppeteer.launch({
    headless,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-features=site-per-process",
    ],
    userDataDir: cacheDir,
    // executablePath: "google-chrome-stable",
  });

  // browser.on('disconnected', () => {
  //   console.log('Browser disconnected.');
  // });

  try {
    const { createUrl, selector, maxLength } = providers[type];

    const queue: IQueue[] = [];
    const originalLines = text.split(/\r\n|\r|\n/);

    for (let i = 0; i < originalLines.length; i++) {
      const line = originalLines[i];

      if (line.length > maxLength) {
        throw new Error("Line is too long.");
      }

      let isSkipped = false;
      if (onQueue && !onQueue(line, i, originalLines)) {
        isSkipped = true;
      }

      queue.push({
        index: i,
        isSkipped,
        value: line,
      });
    }

    let i = 0,
        j = 0,
        processQueueLastIndex = 0,
        processQueueSize = 0,
        processQueue: IQueue[] = [];

    const unskippedQueue = queue.filter((q) => !q.isSkipped);

    while(i < unskippedQueue.length) {
      processQueueSize = 0;
      processQueueLastIndex = 0;
      processQueue = [];

      while(i < unskippedQueue.length) {
        const q = unskippedQueue[i];
        const qLength = q.value.length;

        if (processQueueSize + qLength > size) {
          break;
        }

        processQueue.push(q);
        processQueueSize += qLength;
        processQueueLastIndex = q.index;

        i++;
      }

      const value = processQueue.map((q) => q.value).join("\n");
      
      const url = createUrl(value, from, to);

      // console.log(url);

      let retry = 3;
      while(true) {
        const page = await browser.newPage();

        try {
          let waitUntil: PuppeteerLifeCycleEvent = "networkidle0";

          switch(type) {
            case "yandex": waitUntil = "load"; break;
          }

          await page.goto(url, {
            waitUntil,
            timeout: 1000 * 30, // 30s
          });

          await waitContent(page, selector, 10);

          const content = await getContent(page, selector);

          const translatedLines = content.split(/\r\n|\r|\n/);
          for (let k = 0; k < translatedLines.length; k++) {
            const pq = processQueue[k];
            const oldValue = pq.value;
            const newValue = translatedLines[k];
            pq.newValue = newValue;
          }

          while (j <= processQueueLastIndex) {
            const q = queue[j];
            const index = q.index;
            const oldValue = q.value;
            const newValue = q.newValue;
            const isSkipped = q.isSkipped;
            const formattedValue = onTranslate?.(oldValue, !isSkipped ? newValue : undefined, index, originalLines) 
              || newValue 
              || oldValue;
            q.newValue = formattedValue;
            j++;
          }

          await page.close();
          break;
        } catch(err) {
          if (retry < 1) {
            while (j <= processQueueLastIndex) {
              const q = queue[j];
              const index = q.index;
              const oldValue = q.value;
              const newValue = q.newValue;
              const isSkipped = q.isSkipped;
              if (q.isSkipped) {
                const formattedValue = onTranslate?.(oldValue, !isSkipped ? newValue : undefined, index, originalLines) 
                  || newValue 
                  || oldValue;

                q.newValue = formattedValue;
              } else {
                const formattedValue = onError?.(oldValue, index, originalLines) || oldValue;

                q.newValue = formattedValue;
              }
              j++;
            }

            await page.close();
            break;
          } else {
            retry--;
            await page.close();
            await wait(generateInt(minDelay, maxDelay));
          }
        }
      }

      await wait(generateInt(minDelay, maxDelay));
    }

    await browser.close();

    const result = queue.map((q) => q.newValue).join("\n");

    return result;
  } catch(err) {
    await browser.close();
    throw err;
  }
}