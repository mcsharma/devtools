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
        // Only supporting Java for now.
        query = this.toRegexSafe(query);
        if (this.isJavaFile(filePath)) {
            var regexList = [
                "(\\s|^)class\\s+" + query + "(\\{|\\s+)", // class definition
                "(\\s|^)interface\\s+" + query + "(\\{|\\s+)" // interface
            ];
            for (var i = 0; i < regexList.length; i++) {
                if (line.match(new RegExp(
                        regexList[i],
                        "g" + (caseSensitive ? "" : "i")))
                ) {
                    return true;
                }
            }
        }
        return false;
    },

    isJavaFile: function (filePath) {
        return filePath.endsWith(".java");
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