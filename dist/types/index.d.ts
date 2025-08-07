import { Browser } from "puppeteer";
declare const providers: {
    readonly deepl: import("./types/provider.js").IProvider;
    readonly google: import("./types/provider.js").IProvider;
    readonly papago: import("./types/provider.js").IProvider;
    readonly reverso: import("./types/provider.js").IProvider;
    readonly yandex: import("./types/provider.js").IProvider;
};
export declare class Tranl {
    isOpened: boolean;
    browser: Browser | null;
    headless: boolean;
    cacheDir: string;
    translateSize: number;
    minDelay: number;
    maxDelay: number;
    /**
     * @return {boolean} false: skip translation
     */
    onQueue?: (value: string, index: number, lines: string[]) => boolean;
    onTranslate?: (oldValue: string, newValue: string | undefined, index: number, lines: string[]) => string;
    onError?: (value: string, index: number, lines: string[]) => string;
    constructor();
    open(): Promise<void>;
    close(): Promise<void>;
    wait(): Promise<void>;
    translate({ type, text, from, to, }: {
        type: keyof typeof providers;
        text: string;
        from: string;
        to: string;
    }): Promise<string>;
}
export {};
//# sourceMappingURL=index.d.ts.map