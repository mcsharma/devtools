module.exports = {
    isGuid: function(str) {
        return str.match(
            new RegExp("^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", "g")
        );
    }
}