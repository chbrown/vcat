'use strict'; /*jslint node: true, es5: true, indent: 2 */

// http://en.wikipedia.org/wiki/ANSI_escape_code
var X = '\x1b';
var FG_offset = 30;
var BG_offset = 40;
var COLORS = [
  {offset: 0, name: 'BLACK'},
  {offset: 1, name: 'RED'},
  {offset: 2, name: 'GREEN'},
  {offset: 3, name: 'YELLOW'},
  {offset: 4, name: 'BLUE'},
  {offset: 5, name: 'MAGENTA'},
  {offset: 6, name: 'CYAN'},
  {offset: 7, name: 'WHITE'},
];

var ANSI = exports.ANSI = {
  RESET: X+'[0m',
  BOLD: X+'[1m',
  FAINT: X+'[2m',
  ITALIC: X+'[3m',
  UNDERLINE: X+'[4m',
  BLINK1: X+'[5m',
  BLINK2: X+'[6m',
  INVERT: X+'[7m',
  CONCEAL: X+'[8m',
  STRIKETHROUGH: X+'[9m',
  FG: {},
  BG: {},
};

COLORS.forEach(function(color) {
  ANSI.FG[color.name] = X + '[' + (FG_offset + color.offset) + 'm';
  ANSI.BG[color.name] = X + '[' + (BG_offset + color.offset) + 'm';
});

var literals = exports.literals = {
  0: '\\0',
  1: 'SOH',
  2: 'STX',
  3: 'ETX',
  4: 'EOT',
  5: 'ENQ',
  6: 'ACK',
  7: 'BEL',
  8: '\\b',
  9: '\\t',
  10: '\\n',
  11: 'VT',
  12: 'NP',
  13: '\\r',
  14: 'SO',
  15: 'SI',
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
  32: 'SP',
  133: 'NEL',
};

var printBuffer = exports.printBuffer = function(buffer, stream) {
  for (var i = 0, l = buffer.length; i < l; i++) {
    var byte = buffer[i];
    // these are just the ascii invisibles.
    // todo: consider all utf8 visibles
    if (byte > 33 && byte < 127) {
      stream.write(buffer.slice(i, i+1));
    }
    else {
      stream.write(ANSI.INVERT);
      if (literals[byte]) {
        stream.write(literals[byte]);
      }
      stream.write(buffer.slice(i, i+1));
      stream.write(ANSI.RESET);
    }
  }
};
