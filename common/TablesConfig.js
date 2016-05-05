module.exports = {
    'answer_book': function (row) {
        if (row.content && row.content.sheets) {
            var sheetType = row.content.sheets[0].sheetType;
            if (sheetType === 'QUESTION') {
                return 'QUESTION_ANSWER_BOOK';
            } else if (sheetType === 'PINBOARD') {
                return 'PINBOARD_ANSWER_BOOK';
            }
        }
        return 'REPORT_BOOK';
    },

    'answer_sheet': function (row) {
        if (row.content.sheetContentType === 'QUESTION') {
            return 'QUESTION_ANSWER_SHEET';
        } else {
            return 'PINBOARD_ANSWER_SHEET';
        }
    },

    'comment_table': function (row) {
        return 'COMMENT';
    },

    'data_source': null,

    'files': function (row) {
        return 'FILE';
    },

    'filter': null,

    'logical_column': null,

    'logical_relationship': null,

    'logical_table': null,

    'principal': function (row) {
        if (row.type === 'LOCAL_USER') {
            return 'USER';
        } else {
            return 'USER_GROUP';
        }
    },

    'role': null,

    'row_security': function(row) {
        return 'DATA_ROW_FILTER';
    },

    'table_filter': null,
    'tag': null,
    'variable': null,
    'visualization': null
};
