
var Utils = {
    trimNewlines: function (q) {
        var i = 0, n = q.length, j = n - 1;
        while (i < n && q[i] == '\n') i++;
        q = q.substring(i);
        var j = q.length - 1;
        while (q[j] == '\n') j--;
        q = q.substring(0, j + 1);
        return q;
    }
};

module.exports = Utils;