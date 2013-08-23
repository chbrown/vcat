#!/usr/bin/env node
'use strict'; /*jslint es5: true, node: true, indent: 2 */ /* globals setImmediate */
var os = require('os');
var visible = require('..');

var interrupted = false;
var chunk_size = 256;

var input = process.stdin;
var output = process.stdout;

function print(buffer) {
  for (var i = 0, l = buffer.length; i < l; i++) {
    var character = buffer[i];
    // these are just the ascii invisibles.
    // todo: consider all utf8 visibles
    if (character > 33 && character < 127) {
      output.write(buffer.slice(i, i+1));
    }
    else {
      output.write(visible.ANSI.INVERT);
      if (visible.literals[character]) {
        output.write(visible.literals[character]);
      }
      output.write(buffer.slice(i, i+1));
      output.write(visible.ANSI.RESET);
    }
  }
}

function onReadable() {
  var chunk = process.stdin.read(chunk_size);
  if (!interrupted && chunk !== null) {
    print(chunk);
    setImmediate(onReadable);
  }
}

process.stdin.on('end', function() {
  output.write(visible.ANSI.INVERT);
  output.write('EOF');
  visible.resetStream(output);

  process.stderr.write(os.EOL);
});

input.addListener('readable', onReadable);
process.on('SIGINT', function() {
  interrupted = true;
  input.removeListener('readable', onReadable);

  output.write(visible.ANSI.FG.RED + 'SIGINT');
  visible.resetStream(output);

  process.stderr.write(os.EOL);

  process.exit('SIGINT');
});

output.on('error', function(err) {
  // e.g., if we pipe into head or something
  visible.resetStream(process.stderr);
  process.exit();
});
