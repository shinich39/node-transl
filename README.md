# node-transl

Text translation via headless browser in nodejs

## Getting Started

### Installation

```console
npm install github:shinich39/node-transl
```

### Usage

```js
import { translate } from "node-transl";

const result = await translate({
  // headless: false, // debug
  // cacheDir, // default ".puppeteer"
  type: "google",
  text: `
The baby was lying on her back.
A blue bird flew in through the window.
The blue bird had blue eyes.
  `.trim(),
  from: "en",
  to: "ko",
  size: 1024, // optional
  minDelay: 512, // optional
  maxDelay: 1024, // optional
  onQueue: (line, index, lines) => {
    console.log(`onQueue()`, index, !!line.trim(), line);

    // you can skip translation of this line
    return !!line.trim();
  },
  onTranslate: (oldValue, newValue, index) => {
    // if the line skipped, newValue is undefined
    const isTranslated = !!newValue;

    console.log(`onTranslate()`, index, isTranslated, oldValue, newValue);

    // re-formatting translated value
    return newValue;
  },
  onError: (value, index) => {
    console.log(`onError()`, value, index);
    return `ERROR: ${value}`;
  },
});

console.log(result);
// 아기가 등을 대고 누워있었습니다.
// 푸른 새가 창문을 통해 날아 갔다.
// 푸른 새는 파란 눈을 가졌습니다.
```

## Acknowledgements

- [cheerio](https://www.npmjs.com/package/cheerio)
- [puppeteer](https://pptr.dev/)