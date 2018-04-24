/*jslint indent: 2, maxlen: 80, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var EX, usc = '_', mozlz4a = require('mozlz4a');

function ifFun(x, d) { return ((typeof x) === 'function' ? x : d); }
function notEmpty(x) { return (x && (+x.length >= 1) && x); }

EX = function extractTabUrlsFromSessionStore(ssData, opt) {
  opt = (opt || false);
  ssData = EX.decode(ssData);
  var found, prep = opt.prepareData,
    cols = (opt && (opt.preCols || []).concat('url', opt.endCols || []));
  if (ifFun(prep)) { ssData = (prep(ssData) || ssData); }
  if (cols) {
    cols.meta = { '?open': 'open', '?nth': 0 };
  }
  found = EX.findTabEntries(opt, ssData).map(function foundTabEntry(ent) {
    //console.log(ent);
    if (!cols) { return ent.url; }
    return cols.map(EX.addCol.bind(null, ent)).join('\t');
  }).filter(Boolean);
  return found;
};


EX.decode = function (ssData) {
  if (String(ssData.slice(0, 6)).toLowerCase() === 'mozlz4') {
    ssData = mozlz4a.decompress(Buffer.from(ssData));
  }
  ssData = JSON.parse(String(ssData));
  if (ssData.version.join(' ') !== 'sessionrestore 1') {
    throw new Error('Unsupported data format');
  }
  return ssData;
};


EX.findTabEntries = function (opt, ssData) {
  var ents = [];
  ssData.windows.forEach(function scanWindow(win) {
    win.tabs.forEach(function scanTab(tab) {
      var add = notEmpty(tab.entries), historyPosition = tab.index,
        histPosOffset = Math.max(0, historyPosition - 1);
      if (!add) { return; }
      if (!opt.history) { add = [ add[histPosOffset] ]; }
      ents.push.apply(ents, add);
    });
  });
  return ents;
};


EX.findClosedTabEntries = function (opt, ssData) {
  //closedTabs = (notEmpty(win.closedTabs)
  //  || notEmpty(win[usc + 'closedTabs']));
  throw new Error('stub!', ssData.stubby);
};


EX.addCol = function (ent, col, idx, cols) {
  cols.meta['?nth'] += 1;
  return (cols.meta[col]
    || ((col === 'ent#') && (idx + 1))
    || ent[col]);
};


module.exports = EX;
