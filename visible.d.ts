/// <reference path="../../type_declarations/DefinitelyTyped/node/node.d.ts" />
import stream = require('stream');
declare module "visible" {
    /**
    Options:
    
    * `escapeSlash: boolean = false`: Escape backslashes ("\").
    * `literalVisibles: boolean = true`: Use the literal character for the simple
      characters, like "A", "^" or "~"
    * `literalEOL: boolean = true`: Preserve literal newlines ("\n") (but not
      carriage returns, i.e., "\r").
    * `literalSpace: boolean = true`: Preserve literal spaces (" ").
    * `useControlCharacterNames: boolean = false`: Use names for control characters,
      e.g., "NL", or "SP", etc.
    * `useBackslashEscapes: boolean = false`: Use escapes for "\0", "\b", "\t",
      "\n", "\v", "\f", and "\r".
    * `base: 'octal' | 'hexadecimal' | 'unicode' | 'ubrace' = 'hexadecimal'`:
      how to format the escaped characters. 'octal' and 'hexadecimal' can only be
      applied to character codes from 0 to 255.
    
    The options are processed (and applicable) in pretty much that order.
    */
    class Escaper {
        options: any;
        constructor(options: any);
        /**
        */
        transformBuffer(buffer: Buffer): string;
        /**
        */
        transformCharCode(charCode: number): string;
        createStream(): stream.Transform;
        private _transform(chunk, encoding, cb);
        private _flush(cb);
        /**
        Never modify the given `value`!
        */
        simplify(value: any, seen?: any[], depth?: number, maxDepth?: number): any;
    }
}
