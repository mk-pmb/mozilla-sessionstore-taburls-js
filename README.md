
<!--#echo json="package.json" key="name" underline="=" -->
mozilla-sessionstore-taburls
============================
<!--/#echo -->

<!--#echo json="package.json" key="description" -->
Extract the URLs of currently open tabs from a Firefox sessionstore backup.
<!--/#echo -->


Usage
-----

<!--#include file="cli.js" outdent="  " code="javascript"
  start="  // #BEGIN# usage demo" stop="  // #ENDOF# usage demo" -->
<!--#verbatim lncnt="9" -->
```javascript
var findTabUrls = require('mozilla-sessionstore-taburls');
fs.readFile(inputFile, function (err, lz4Buffer) {
  if (err) { throw err; }
  var tabUrls = findTabUrls(lz4Buffer, parseOpt);
  if (tabUrls.length < 1) { return; }
  console.log(tabUrls.join('\n'));
});
```
<!--/include-->


parseOpts
---------

… is an optional options object which supports these options, all optional:

* `history`:
  * `true`: Report all tab history entries.
  * `false`: Report only the history entry currently displayed in that tab.
  * other values: reserved for future features
* `prepareData`: Should be a false-y value, or a function.
  In the latter case, the function is called with the decoded session data.
  If the function returns a true-y value, work with that instead of the
  original session data.



<!--#toc stop="scan" -->



Known issues
------------

* Needs more/better tests and docs.




&nbsp;


License
-------
<!--#echo json="package.json" key=".license" -->
ISC
<!--/#echo -->
