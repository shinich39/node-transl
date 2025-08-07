import path from "node:path";
import fs from "node:fs";
import { Tranl } from "../dist/index.min.mjs";

const toProgress = (index, length) => {
  return (Math.floor((index+1) / length * 100) + "%").padStart(4, " ");
}

const formatResult = (result) => {
  return result
    .replace(/\n\/\//g, "\n\n//")
    .replace(/\n\n+/g, "\n\n");
}

export async function translateTexts(type, from, to, inputDir, outputDir) {
  const t = new Tranl();
  t.minDelay = 512;
  t.maxDelay = 1536;
  t.translateSize = 1024;

  const inputNames = fs.readdirSync(inputDir);

  const options = {
    type,
    from,
    to,
  }

  let lineCount = 0, 
      errorCount = 0;

  for (let i = 0; i < inputNames.length; i++) {
    const filename = inputNames[i];
    const inputPath = path.join(inputDir, filename);
    const outputPath = path.join(outputDir, filename);
    const progress = toProgress(i, inputNames.length);

    const exists = fs.existsSync(outputPath);

    const inputData = fs.readFileSync(inputPath, "utf8");
    const outputData = exists ? fs.readFileSync(outputPath,  "utf8") : null;

    // create a new translated file
    if (!exists) {

      t.onQueue = (value, index, lines) => {
        const isEmpty = !value.trim();
        const isUrl = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/.test(value);
        return !isEmpty && !isUrl;
      }

      t.onTranslate = (oldValue, newValue, index, lines) => {
        if (newValue) {
          console.log(`${progress}; ${toProgress(index, lines.length)}; ${filename}; ${newValue.substring(0,10)}...;`);
        } else {
          console.log(`${progress}; ${toProgress(index, lines.length)}; ${filename}; SKIP;`);
        }

        lineCount++;

        if (newValue) {
          return `// ${oldValue}\n${newValue}`;
        } else if (oldValue.trim()) {
          return `// ${oldValue}\n${oldValue}`;
        } else {
          return "";
        }
      }

      t.onError = (value, index, lines) => {
        console.log(`${progress}; ${toProgress(index, lines.length)}; ${filename}; ERROR;`);
        lineCount++;
        errorCount++;
        return `// ${value}\nERROR=${value}`;
      }
      
      const result = await t.translate({
        ...options,
        text: inputData,
        // onQueue?: (line: string, index: number, lines: string[]) => boolean,
        // onTranslate?: (oldValue: string, newValue: string|undefined, index: number) => string,
        // onError?: (value: string, index: number) => string,
      });

      const formattedResult = formatResult(result);

      fs.writeFileSync(outputPath, formattedResult, "utf8");
    } // fix translated file
    else {
      delete t.onQueue;
      
      t.onTranslate = (oldValue, newValue, index, lines) => {
        if (newValue) {
          console.log(`${progress}; ${toProgress(index, lines.length)}; ${filename}; ${newValue.substring(0,10)}...;`);
        } else {
          console.log(`${progress}; ${toProgress(index, lines.length)}; ${filename}; SKIP;`);
        }
        return newValue || oldValue;
      }
      
      t.onError = (value, index, lines) => {
        console.log(`${progress}; ${toProgress(index, lines.length)}; ${filename}; ERROR;`);
        return `ERROR=${value}`;
      }

      const translatedLines = outputData.split(/\r\n|\r|\n/);
      const checkedLines = [];
      for (let j = 0; j < translatedLines.length; j++) {
        const line = translatedLines[j];
        const origLine = translatedLines[j - 1];
        const isPrevOriginal = origLine && origLine.startsWith("// ");
        const isError = line.startsWith("ERROR=");
        if (!isError || !isPrevOriginal) {
          checkedLines.push(line);
          continue;
        }

        try {
          const newLine = await t.translate({
            ...options,
            text: origLine.replace("// ", ""),
          });

          checkedLines.push(newLine);
        } catch(err) {
          console.error(err);
          checkedLines.push(line);
        }
      }

      const result = checkedLines.join("\n");

      const formattedResult = formatResult(result);

      fs.writeFileSync(outputPath, formattedResult, "utf8");
    }

    console.log(`${progress}; Lines:${lineCount}; Errors:${errorCount};`);

    await t.close();
  }
}