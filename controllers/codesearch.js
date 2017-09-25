var express = require('express');
var router = express.Router();
var fs = require('fs');
var exec = require('child_process').exec;

router.get('/', function (req, res) {

    function preg_quote(str, delimiter) {
        return String(str).replace(
            new RegExp(
                '[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + (delimiter || '') + '-]',
                'g'
            ),
            '\\$&'
        );
    }

    function addslashes(str) {
        return str.replace(/\\/g, '\\\\').replace(/'/g, '\\\'').replace(/"/g, '\\"');
    }

    var q = req.query.q || '';
    var fileType = req.query.fileType || "";
    var cs = req.query.cs === "1" ? 1 : 0;
    var ww = req.query.ww === "1" ? 1 : 0;
    var contextLength = parseInt(req.query.context || '0');

    if (!q) {
        sendResponse({}, 0);
        return;
    }

    var options = "-n";
    if (!cs) {
        options += " -i";
    }
    if (fileType === "js/ts") {
        options += " -f \\." + "[jt]s" + "$";
    } else {
        options += " -f \\." + fileType + "$";
    }

    var escaped_q = addslashes(preg_quote(q));
    if (ww) {
        escaped_q = "\\b" + escaped_q + "\\b";
    }
    var cmd = 'csearch ' + options + ' "' + escaped_q + '"';
    exec(cmd, {maxBuffer: 3000*1024}, function (error, stdout, stderr) {
        var results = stdout.split("\n");
        results.pop(); // Last element will be "", so deleting that
        var prefix = "/home/codemonkey/thoughtspot/";
        var count = results.length;
        var finalResults = {};
        var lineNum, filePath, i;
        for (i = 0; i < count; i++) {
            var parts = results[i].split(':');
            var fullPath = parts[0];
            lineNum = parts[1];
            var line = parts.slice(2).join(':');
            var shortPath = fullPath.slice(prefix.length);
            if (!finalResults[shortPath]) {
                finalResults[shortPath] = {};
            }
            finalResults[shortPath][lineNum] = line;
        }

        if (contextLength) {
            var resultsWithContext = {};
            for (filePath in finalResults) {
                var allLines = {};
                for (lineNum in finalResults[filePath]) {
                    lineNum = parseInt(lineNum);
                    for (i = Math.max(0, lineNum - contextLength);
                         i <= lineNum + contextLength;
                         i++) {
                        allLines[i] = 1;
                    }
                }
                var lines =
                    fs.readFileSync(prefix + filePath).toString().split('\n');
                resultsWithContext[filePath] = {};
                for (lineNum in allLines) {
                    if (lineNum - 1 < lines.length) {
                        resultsWithContext[filePath][lineNum] =
                            lines[lineNum - 1];
                    }
                }
            }
            finalResults = resultsWithContext;
        }
        sendResponse(finalResults, count);
    });

    function sendResponse(finalResults, count) {
        res.render('codesearch', {
            bundledJSFile: process.env.NODE_ENV === 'production' 
                           ? 'bundle.min.js' : 'bundle.js',
            data: {
                "prefix": "http://phab.thoughtspot.co/diffusion/2/browse/master/",
                "q": q,
                "count": count,
                "results": finalResults,
                "fileType": fileType,
                "cs": cs,
                "ww": ww,
                'context': contextLength,
                "execTimeMs": 234 // TODO calculate and pass the correct value!
            }
        });
    }
});

module.exports = router;
