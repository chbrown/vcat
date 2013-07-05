#!/usr/bin/env node
'use strict'; /*jslint node: true, es5: true, indent: 2 */
var util = require('util');

// http://en.wikipedia.org/wiki/ANSI_escape_code
var X = '\x1b';
var FG = 30;
var BG = 40;
var COLORS = {
  BLACK: 0,
  RED: 1,
  GREEN: 2,
  YELLOW: 3,
  BLUE: 4,
  MAGENTA: 5,
  CYAN: 6,
  WHITE: 7,
};
var ANSI = {
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
for (var key in COLORS) {
  ANSI.FG[key] = X + '[' + (FG + COLORS[key]) + 'm';
  ANSI.BG[key] = X + '[' + (BG + COLORS[key]) + 'm';
}

var literals = {
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

function printBuffer(buffer) {
  for (var i = 0, l = buffer.length; i < l; i++) {
    var byte = buffer[i];
    // these are just the ascii invisibles.
    // todo: consider all utf8 visibles
    if (byte > 33 && byte < 127) {
      process.stdout.write(buffer.slice(i, i+1));
    }
    else {
      process.stdout.write(ANSI.INVERT);
      if (literals[byte]) {
        process.stdout.write(literals[byte]);
      }
      process.stdout.write(buffer.slice(i, i+1));
      process.stdout.write(ANSI.RESET);
    }
  }
}

process.stdin.on('readable', function() {
  var chunk = process.stdin.read();
  printBuffer(chunk);
});

process.stdin.on('end', function() {
  process.stdout.write('\n');
  process.exit();
});

process.on('SIGINT', function() {
  process.stdin.pause();
  process.stdout.write('\n');
  process.exit(1);
});
