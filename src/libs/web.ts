import * as cheerio from 'cheerio';
import { Browser, Page } from 'puppeteer';
import { wait } from './utils.js';

export async function waitContent(page: Page, selector: string) {
  const element = await page.$(selector);
  if (!element) {
    throw new Error("Element not found");
  }

  const content = await page.evaluate((elem) => elem?.textContent, element);
  if (!content) {
    throw new Error("Element is empty");
  }

  const trimmedContent = content.trim();
  if (trimmedContent === '' || trimmedContent === "...") {
    throw new Error("Element is empty");
  }

  return content;
}

export async function getContent(page: Page, selector: string) {

  // deprecated
  // while(true) {
  //   if (retry < 0) {
  //     throw new Error("Failed to load");
  //   }

  //   try {
  //     await page.waitForSelector(selector, {
  //       visible: true,
  //       timeout: 1000 * 3,
  //     });

  //     break;
  //   } catch(err) {
  //     retry--;
  //   }
  // }

  const content = await page.content();
  const $ = cheerio.load(content);
  const query = $(selector);

  // fix linebreak
  query.find('p').each(function (i, el) {
    if (i !== 0) {
      $(el).before('<br>');
    }
  });

  const result = query.find('br').replaceWith('\n').end().text();

  return result;
}