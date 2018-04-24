/*jslint indent: 2, maxlen: 80, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var parseOpt = {}, fs = require('fs'), inputFile,
  cliOpt = require('minimist')(process.argv.slice(2));

function throwIf(err) { if (err) { throw err; } }


function maybeDumpJson(dest) {
  return (dest && function dump(data) {
    var json = '\uFEFF' + JSON.stringify(data, null, 2) + '\n';
    fs.writeFile(dest, json, throwIf);
  });
}

(function parseCliOpt(co) {
  var inFn = cliOpt.input;
  if (inFn === '-') { inFn = null; }
  if (!inFn) { inFn = process.stdin.fd; }
  inputFile = inFn;
  parseOpt = {
    openTabs:     !co.noopen,
    closedTabs:   co.closed,
    history:      co.history,
    prepareData:  maybeDumpJson(co['dump-full-json']),
    preCols: [
      (((co.noopen && co.closed) || co.status) && '?open'),
      (co.title && 'title'),
    ].filter(Boolean),
  };
}(cliOpt));



(function readmeDemo() {
  // #BEGIN# usage demo
  var findTabUrls = require('mozilla-sessionstore-taburls');
  fs.readFile(inputFile, function (err, lz4Buffer) {
    if (err) { throw err; }
    var tabUrls = findTabUrls(lz4Buffer, parseOpt);
    if (tabUrls.length < 1) { return; }
    console.log(tabUrls.join('\n'));
  });
  // #ENDOF# usage demo
}());
