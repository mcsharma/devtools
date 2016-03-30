var Utils = {
    trimNewlines: function (q) {
        var i = 0, n = q.length, j = n - 1;
        while (i < n && q[i] == '\n') i++;
        q = q.substring(i);
        var j = q.length - 1;
        while (q[j] == '\n') j--;
        q = q.substring(0, j + 1);
        return q;
    },

    isTopResult: function (filePath, line, query, caseSensitive) {
        query = this.toRegexSafe(query);
        var regexList = [];
        if (this.isJavaFile(filePath)) {
            regexList = [
                "(\\s|^)class\\s+" + query + "(\\{|\\s+)", // class definition
                "(\\s|^)interface\\s+" + query + "(\\{|\\s+)", // interface
                "(public|protected|private|static|\\s)\\s+[\\w\\<\\>\\[\\]]+" +
                  "\\s+(" + query + ")\\s*\\([^\\)]*\\)\\s*(\\{?|[^;])" // method definition
            ];
        } else if (this.isGoFile(filePath)) {
            regexList = [
                "type\\s+"+query+"\\s+struct",    // struct definition
                "type\\s+"+query+"\\s+interface",  // interface definition
                "func\\s+(\\(\\w+\\s+\\*\\w+\\)\\s+)?"+query+"\\s*\\(" // function definition
            ];
        } else if (this.isPyFile(filePath)) {
            regexList = [
                "^\\s*def ("+query+")\\s*\\(\\s*\\S+\\s*(?:,\\s*\\S+)*\\):", // function
                "^\\s*class "+query+":" // class
            ];
        }

        for (var i = 0; i < regexList.length; i++) {
            if (line.match(new RegExp(
                    regexList[i],
                    "g" + (caseSensitive ? "" : "i")))
            ) {
                return true;
            }
        }
        return false;
    },

    isJavaFile: function (filePath) {
        return filePath.endsWith(".java");
    },

    isGoFile: function (filePath) {
        return filePath.endsWith(".go");
    },

    isPyFile: function (filePath) {
        return filePath.endsWith(".py");
    },
    
    toRegexSafe: function (str) {
        var charsToEscape = ".^$*+-?()[]{}\|";
        var regexSafeStr = "";
        for (var i = 0; i < str.length; i++) {
            var c = str[i];
            if (charsToEscape.indexOf(c) !== -1) {
                regexSafeStr += "\\";
            }
            regexSafeStr += c;
        }
        return regexSafeStr;
    },

    htmlize: function (text) {
        var entityMap = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': '&quot;',
            "'": '&#39;',
            "/": '&#x2F;'
        };
        return text.replace(/[&<>"'\/]/g, function (s) {
            return entityMap[s];
        });
    }
};

module.exports = Utils;