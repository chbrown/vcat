#!/usr/bin/env node
'use strict'; /*jslint node: true, es5: true, indent: 2 */
var util = require('util');

console.log('big-little, hex, inspect(utf8), raw');
for (var b = 0; b < 256; b++) { // big
  for (var l = 0; l < 256; l++) { // little
    var buffer = new Buffer(b ? [b, l] : [l]);
    var hex = buffer.toString('hex');
    var string = buffer.toString('utf8');
    console.log('%d-%d, %s, %s, %s', b, l, hex, util.inspect(string), string);
  }
}
