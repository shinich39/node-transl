declare const providers: {
    readonly deepl: import("./types/provider.js").IProvider;
    readonly google: import("./types/provider.js").IProvider;
    readonly papago: import("./types/provider.js").IProvider;
    readonly reverso: import("./types/provider.js").IProvider;
    readonly yandex: import("./types/provider.js").IProvider;
};
export declare function translate({ headless, cacheDir, type, text, from, to, size, minDelay, maxDelay, onQueue, onTranslate, onError, }: {
    headless?: boolean;
    /**
     * @default ".puppeteer"
     */
    cacheDir?: string;
    type: keyof typeof providers;
    text: string;
    from: string;
    to: string;
    /**
     * @default 1024
     */
    size?: number;
    /**
     * @default 512
     */
    minDelay?: number;
    /**
     * @default 1024
     */
    maxDelay?: number;
    onQueue?: (value: string, index: number, lines: string[]) => boolean;
    onTranslate?: (oldValue: string, newValue: string | undefined, index: number, lines: string[]) => string;
    onError?: (value: string, index: number, lines: string[]) => string;
}): Promise<string>;
export {};
//# sourceMappingURL=index.d.ts.map