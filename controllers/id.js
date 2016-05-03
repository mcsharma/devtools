var express = require('express');
var router = express.Router();
var pg = require('pg');
var util = require('util');

var tableConfig = {
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
  'visualization': null,
};

module.exports = function (req, res) {
  if (!req.cookies.host || !req.cookies.port || !req.params.id) {
    respond();
    return;
  }

  var conString = "postgres://postgres:@" + req.cookies.host + ":" 
    + req.cookies.port + "/defaultdb";
  var client = new pg.Client(conString);
  client.connect();

  var querries = [];
  for(var tableName in tableConfig) {
    querries.push(util.format(
      "SELECT '%s' as table_name from %s WHERE id = '%s'", 
      tableName, tableName, req.params.id
    ));
  }
  var queryStr = querries.join(' UNION ');

  client.query(queryStr, function (err, result) {
    if (err || result.rows.length === 0) {
      console.log(err);
      console.log(result);
      respond();
    } else {
      fetchRow(req.params.id, result.rows[0].table_name);
    }
  });

  function fetchRow(id, tableName) {
    client.query(
      "SELECT * FROM "+tableName+" WHERE id='"+id+"' limit 1", 
      function (err, result) {
        var metadataType = null, data = null; 
        if (!err && result.rows.length === 1) {
          data = result.rows[0];
          var typeFunc = tableConfig[tableName];
          if (typeFunc) {
            metadataType = typeFunc(data);
          } else {
            metadataType = tableName.toUpperCase();
          }
        } else {
          console.log(err);
          console.log(result);
        }
        respond(metadataType, data);
      }
    );
  }

  function respond(metadataType, data) {
    metadataType = metadataType || null;
    data = data || null;
    if (req.query.ajax) {
      res.send({
        metadataType: metadataType,
        data: data
      });
    } else {
      var bundlejs = process.env.NODE_ENV === 'production' 
        ? 'bundle.min.js'
        : 'bundle.js';
      res.render('id', {
        bundledJSFile: bundlejs,
        metadataType: metadataType,
        data: data
      });
    }
  }
};
