import { translateTexts } from "../examples/pretranslate.js";

;(async () => {
  await translateTexts("papago", "en", "ko", "./test/input", "./test/output");
})();