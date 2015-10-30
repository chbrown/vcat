export interface EscaperOptions {
    /** Escape backslashes ("\")? (default: false) */
    escapeSlash: boolean;
    /** Use the literal character for simple characters, like "A", "^" or "~"? (default: true) */
    literalVisibles: boolean;
    /** Preserve literal newlines ("\n") (but not carriage returns, i.e., "\r")? (default: true) */
    literalEOL: boolean;
    /** Preserve literal spaces (" ")? (default: true) */
    literalSpace: boolean;
    /** Use names for control characters, e.g., "NL", or "SP", etc? (default: false) */
    useControlCharacterNames: boolean;
    /** Use escapes for "\0", "\b", "\t", "\n", "\v", "\f", and "\r"? (default: false) */
    useBackslashEscapes: boolean;
    /** How to format escaped characters? Options: 'octal' | 'hexadecimal' | 'unicode' | 'ubrace'.
      'octal' and 'hexadecimal' can only be applied to character codes from 0 to 255.
      (default: 'hexadecimal') */
    base: string;
}
export declare class Escaper {
    options: EscaperOptions;
    constructor(options?: EscaperOptions);
    /**
    Escape a Buffer.
    */
    transformBuffer(buffer: Buffer): string;
    /**
    Escape a numeric character code.
    */
    transformCharCode(charCode: number): string;
    /**
    Never modify the given `value`!
    */
    simplify(value: any, seen?: any[], depth?: number, maxDepth?: number): any;
}
