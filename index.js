/// <reference path="type_declarations/DefinitelyTyped/node/node.d.ts" />
var stream = require('stream');
//// export module visible {
function padLeft(str, padding, length) {
    while (str.length < length) {
        str = padding + str;
    }
    return str;
}
/**
'\x1b' == '\033' == '\u001b'

http://en.wikipedia.org/wiki/ANSI_escape_code
*/
var ansi = {
    RESET: '\x1b[0m',
    // styles
    BOLD: '\x1b[1m',
    FAINT: '\x1b[2m',
    ITALIC: '\x1b[3m',
    UNDERLINE: '\x1b[4m',
    BLINK1: '\x1b[5m',
    BLINK2: '\x1b[6m',
    INVERT: '\x1b[7m',
    CONCEAL: '\x1b[8m',
    STRIKETHROUGH: '\x1b[9m',
    // foreground
    FG_BLACK: '\x1b[30m',
    FG_RED: '\x1b[31m',
    FG_GREEN: '\x1b[32m',
    FG_YELLOW: '\x1b[33m',
    FG_BLUE: '\x1b[34m',
    FG_MAGENTA: '\x1b[35m',
    FG_CYAN: '\x1b[36m',
    FG_WHITE: '\x1b[37m',
    // background
    BG_BLACK: '\x1b[40m',
    BG_RED: '\x1b[41m',
    BG_GREEN: '\x1b[42m',
    BG_YELLOW: '\x1b[43m',
    BG_BLUE: '\x1b[44m',
    BG_MAGENTA: '\x1b[45m',
    BG_CYAN: '\x1b[46m',
    BG_WHITE: '\x1b[47m',
};
var controlCharacterNames = {
    // 0x00 through 0x0F
    0: 'NUL',
    1: 'SOH',
    2: 'STX',
    3: 'ETX',
    4: 'EOT',
    5: 'ENQ',
    6: 'ACK',
    7: 'BEL',
    8: 'BS',
    9: 'TAB',
    10: 'LF',
    11: 'VT',
    12: 'FF',
    13: 'CR',
    14: 'SO',
    15: 'SI',
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
    25: 'EM',
    26: 'SUB',
    27: 'ESC',
    28: 'FS',
    29: 'GS',
    30: 'RS',
    31: 'US',
    // 0x20
    32: 'SP',
    // 0x7F
    127: 'DEL',
    // 0x85
    133: 'NEL',
};
var backslashEscapes = {
    0: '\\0',
    8: '\\b',
    9: '\\t',
    10: '\\n',
    11: '\\v',
    12: '\\f',
    13: '\\r',
};
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
var Escaper = (function () {
    function Escaper(options) {
        if (options === undefined)
            options = {};
        if (options.escapeSlash === undefined)
            options.escapeSlash = false;
        if (options.literalVisibles === undefined)
            options.literalVisibles = true;
        if (options.literalEOL === undefined)
            options.literalEOL = true;
        if (options.literalSpace === undefined)
            options.literalSpace = true;
        if (options.useControlCharacterNames === undefined)
            options.useControlCharacterNames = false;
        if (options.useBackslashEscapes === undefined)
            options.useBackslashEscapes = false;
        if (options.base === undefined)
            options.base = 'hexadecimal';
        this.options = options;
    }
    /**
    */
    Escaper.prototype.transformBuffer = function (buffer) {
        var strings = [];
        for (var i = 0, l = buffer.length; i < l; i++) {
            var charCode = buffer[i];
            var string = this.transformCharCode(charCode);
            strings.push(string);
        }
        return strings.join('');
    };
    /**
    */
    Escaper.prototype.transformCharCode = function (charCode) {
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
    };
    Escaper.prototype.createStream = function () {
        var transform = new stream.Transform({ decodeStrings: true, objectMode: true });
        transform._transform = this._transform.bind(this);
        transform._flush = this._flush.bind(this);
        return transform;
    };
    Escaper.prototype._transform = function (chunk, encoding, cb) {
        // `encoding` === 'buffer'
        var string = this.transformBuffer(chunk);
        cb(null, string);
    };
    Escaper.prototype._flush = function (cb) {
        cb(null, 'EOF'); // + os.EOL
    };
    /**
    Never modify the given `value`!
    */
    Escaper.prototype.simplify = function (value, seen, depth, maxDepth) {
        var _this = this;
        if (seen === void 0) { seen = []; }
        if (depth === void 0) { depth = 0; }
        if (maxDepth === void 0) { maxDepth = 10; }
        if (value === undefined) {
            return value;
        }
        else if (value === null) {
            return value;
        }
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
            var array = value.map(function (child) { return _this.simplify(child, seen, depth + 1, maxDepth); });
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
    };
    return Escaper;
})();
exports.Escaper = Escaper;
//// }
