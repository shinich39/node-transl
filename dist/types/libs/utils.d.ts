export declare function getLangCode(type: "iso639-1" | "iso639-2" | "iso639-3" | "name" | "nativeName", code: string): string;
export declare const getISO6391: (code: string) => string;
export declare const getISO6392: (code: string) => string;
export declare const getISO6393: (code: string) => string;
export declare function wait(delay: number): Promise<unknown>;
/**
 * @returns min <= n < max
 */
export declare function generateFloat(min: number, max: number): number;
/**
 * @returns min <= n < max
 */
export declare function generateInt(min: number, max: number): number;
//# sourceMappingURL=utils.d.ts.map