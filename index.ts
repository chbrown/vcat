function padLeft(str, padding, length) {
  while (str.length < length) {
    str = padding + str;
  }
  return str;
}

const controlCharacterNames = {
  // 0x00 through 0x0F
   0: 'NUL',
   1: 'SOH',
   2: 'STX',
   3: 'ETX',
   4: 'EOT',
   5: 'ENQ',
   6: 'ACK',
   7: 'BEL',
   8:  'BS',
   9: 'TAB',
  10:  'LF',
  11:  'VT',
  12:  'FF',
  13:  'CR',
  14:  'SO',
  15:  'SI',
  // 0x10 through 0x1F
  16: 'DLE',
  17: 'DC1',
  18: 'DC2',
  19: 'DC3',
  20: 'DC4',
  21: 'NAK',
  22: 'SYN',
  23: 'ETB',
  24: 'CAN',
  25:  'EM',
  26: 'SUB',
  27: 'ESC',
  28:  'FS',
  29:  'GS',
  30:  'RS',
  31:  'US',
  // 0x20
  32:  'SP',
  // 0x7F
  127: 'DEL',
  // 0x85
  133: 'NEL',
};

const backslashEscapes = {
   0: '\\0',
   8: '\\b',
   9: '\\t',
  10: '\\n',
  11: '\\v',
  12: '\\f',
  13: '\\r',
};

// The options are processed (and applicable) in pretty much the following order:
export interface EscaperOptions {
  /** Escape backslashes ("\")? (default: false) */
  escapeSlash?: boolean;
  /** Use the literal character for simple characters, like "A", "^" or "~"? (default: true) */
  literalVisibles?: boolean;
  /** Preserve literal newlines ("\n") (but not carriage returns, i.e., "\r")? (default: true) */
  literalEOL?: boolean;
  /** Preserve literal spaces (" ")? (default: true) */
  literalSpace?: boolean;
  /** Use names for control characters, e.g., "NL", or "SP", etc? (default: false) */
  useControlCharacterNames?: boolean;
  /** Use escapes for "\0", "\b", "\t", "\n", "\v", "\f", and "\r"? (default: false) */
  useBackslashEscapes?: boolean;
  /** How to format escaped characters? Options: 'octal' | 'hexadecimal' | 'unicode' | 'ubrace'.
    'octal' and 'hexadecimal' can only be applied to character codes from 0 to 255.
    (default: 'hexadecimal') */
  base?: string;
}

export class Escaper {
  options: EscaperOptions;
  constructor({
                escapeSlash = false,
                literalVisibles = true,
                literalEOL = true,
                literalSpace = true,
                useControlCharacterNames = false,
                useBackslashEscapes = false,
                base = 'hexadecimal'
              }: EscaperOptions) {
    this.options = {escapeSlash, literalVisibles, literalEOL, literalSpace, useControlCharacterNames, useBackslashEscapes, base};
  }

  /**
  Escape a Buffer.
  */
  transformBuffer(buffer: Buffer): string {
    var strings = [];
    for (var i = 0, l = buffer.length; i < l; i++) {
      var charCode = buffer[i];
      var string = this.transformCharCode(charCode);
      strings.push(string);
    }
    return strings.join('');
  }

  /**
  Escape a numeric character code.
  */
  transformCharCode(charCode: number): string {
    if (this.options.escapeSlash && charCode == 92) {
      return '\\\\';
    }
    else if (this.options.literalVisibles && charCode >= 33 && charCode <= 126) {
      // TODO: consider all utf8 visibles?
      return String.fromCharCode(charCode);
    }
    else if (this.options.literalEOL && (charCode === 10)) {
      // \r doesn't count, since it can be destructive
      // TODO: consolidate \r\n, \r, and \n all to \n
      return String.fromCharCode(charCode);
    }
    else if (this.options.literalSpace && charCode === 32) {
      return String.fromCharCode(charCode);
    }
    else if (this.options.useControlCharacterNames && charCode in controlCharacterNames) {
      return controlCharacterNames[charCode];
    }
    else if (this.options.useBackslashEscapes && charCode in backslashEscapes) {
      return backslashEscapes[charCode];
    }
    else if (this.options.base == 'octal' && charCode < 256) {
      var octal = charCode.toString(8);
      return '\\' + padLeft(octal, '0', 3);
    }
    else if (this.options.base == 'hexadecimal' && charCode < 256) {
      var hexadecimal = charCode.toString(16);
      return '\\x' + padLeft(hexadecimal, '0', 2);
    }
    // catch-all
    var charCode_hexadecimal = charCode.toString(16);
    if (this.options.base == 'ubrace') {
      return '\\u{' + charCode_hexadecimal + '}';
    }
    return '\\u' + padLeft(charCode_hexadecimal, '0', 4);
  }

  /**
  Never modify the given `value`!
  */
  simplify(value: any, seen: any[] = [], depth: number = 0, maxDepth: number = 10): any {
    if (value === undefined) {
      return value;
    }
    else if (value === null) {
      return value;
    }
    // Buffer comes before toJSON check because we don't like the built-in
    // Buffer#toJSON output.
    else if (Buffer.isBuffer(value)) {
      // return value.toString('utf8');
      return this.transformBuffer(value);
    }
    else if (typeof value.toJSON === 'function') {
      return this.simplify(value.toJSON(), seen, depth, maxDepth);
    }
    else if (Array.isArray(value)) {
      if (seen.indexOf(value) > -1) {
        return '[Circular Array]';
      }
      if (depth > maxDepth) {
        return '[excessive depth]...';
      }
      var array = value.map(child => this.simplify(child, seen, depth + 1, maxDepth));
      seen.push(array);
      return array;
    }
    else if (typeof value === 'object') {
      if (seen.indexOf(value) > -1) {
        return '[Circular Object]';
      }
      if (depth > maxDepth) {
        return '[excessive depth]...';
      }
      var object = {};
      for (var key in value) {
        if (value.hasOwnProperty(key)) {
          object[key] = this.simplify(value[key], seen, depth + 1, maxDepth);
        }
      }
      seen.push(object);
      return object;
    }
    // catch-all
    return value;
  }
}
