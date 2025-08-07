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
import { Browser, Page, PuppeteerLifeCycleEvent } from "puppeteer";

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

export class Tranl {
  isOpened: boolean;
  browser: Browser|null;
  headless: boolean;
  cacheDir: string;
  translateSize: number;
  minDelay: number;
  maxDelay: number;

  /**
   * @return {boolean} false: skip translation
   */
  onQueue?: (value: string, index: number, lines: string[]) => boolean;
  onTranslate?: (oldValue: string, newValue: string|undefined, index: number, lines: string[]) => string;
  onError?: (value: string, index: number, lines: string[]) => string;

  constructor() {
    this.isOpened = false;
    this.browser = null;
    this.headless = true;
    this.cacheDir = ".puppeteer";
    this.translateSize = 1024;
    this.minDelay = 512;
    this.maxDelay = 1024;
  }

  async open() {
    if (this.isOpened) {
      return;
    }

    this.isOpened = true;

    this.browser = await puppeteer.launch({
      headless: this.headless,
      defaultViewport: null,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-features=site-per-process",
      ],
      userDataDir: this.cacheDir,
      // executablePath: "google-chrome-stable",
    });
  }

  async close() {
    if (!this.isOpened) {
      return;
    }

    this.isOpened = false;
    const b = this.browser;
    this.browser = null;
    await b?.close();
  }

  async wait() {
    await this.open();

    while(!this.browser) {
      await wait(256);
    }
  }

  async translate({
    type,
    text,
    from,
    to,
  }: {
    type: keyof typeof providers,
    text: string,
    from: string,
    to: string,
  }) {
    await this.wait();

    const browser = this.browser as Browser;

    const { createUrl, selector, maxLength } = providers[type];

    const queue: IQueue[] = [];
    const originalLines = text.split(/\r\n|\r|\n/);

    for (let i = 0; i < originalLines.length; i++) {
      const line = originalLines[i];

      if (line.length > maxLength) {
        throw new Error("Line is too long.");
      }

      let isSkipped = false;
      if (this.onQueue && !this.onQueue(line, i, originalLines)) {
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

        if (processQueueSize + qLength > this.translateSize) {
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
          const q = processQueue[k];
          // const oldValue = q.value;
          const newValue = translatedLines[k];
          q.newValue = newValue;
        }

        while (j <= processQueueLastIndex) {
          const q = queue[j];
          const index = q.index;
          const oldValue = q.value;
          const newValue = q.newValue;
          const isSkipped = q.isSkipped;
          const formattedValue = this.onTranslate?.(oldValue, !isSkipped ? newValue : undefined, index, originalLines) 
            || newValue 
            || oldValue;
          q.newValue = formattedValue;
          j++;
        }
      } catch(err) {
        while (j <= processQueueLastIndex) {
          const q = queue[j];
          const index = q.index;
          const oldValue = q.value;
          const isSkipped = q.isSkipped;
          if (isSkipped) {
            const formattedValue = this.onTranslate?.(oldValue, undefined, index, originalLines) 
              || oldValue;

            q.newValue = formattedValue;
          } else {
            const formattedValue = this.onError?.(oldValue, index, originalLines) || oldValue;

            q.newValue = formattedValue;
          }
          j++;
        }
      }

      await page.close();

      await wait(generateInt(this.minDelay, this.maxDelay));
    }

    const result = queue.map((q) => q.newValue).join("\n");

    return result;
  }
}