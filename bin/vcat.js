#!/usr/bin/env node
'use strict'; /*jslint node: true, es5: true, indent: 2 */
var vcat = require('..');

process.stdin.on('readable', function() {
  var chunk = process.stdin.read();
  vcat.printBuffer(chunk, process.stdout);
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
