var express = require('express');
var pg = require('pg');
var util = require('util');
var tablesConfig = require('../common/TablesConfig');
var Utils = require('../common/Utils');
var _ = require('underscore');

module.exports = function (req, res) {
    var input = req.params.input;

    if (!input) {
        return respond(null, []);
    }
    if (!req.cookies.host || !req.cookies.port) {
        return respond("No host and port info found in cookie");
    }

    var conString = "postgres://postgres:@" + req.cookies.host + ":"
        + req.cookies.port + "/defaultdb";
    var client = new pg.Client(conString);

    client.connect(function (err) {
        if (err) {
            var error = "Error connecting to DB. Please double check host and port setup";
            console.error(error, err);
            return respond(error);
        }
        if (tablesConfig.hasOwnProperty(input)) {
            fetchRows(null, [input], onRowsFetched);
        } else {
            findContainingTables(input, function (err, tableNames) {
                if (err) {
                    var error = "Error finding right table for '" + input + "'";
                    console.error(error, err);
                    return respond(error);
                }
                fetchRows(input, tableNames, onRowsFetched);
            });
        }
    });

    function findContainingTables(input, callback) {
        var queries = [];
        var column = Utils.isGuid(input) ? 'id' : 'name';
        for (var tableName in tablesConfig) {
            if (column === 'name' && tableName === 'comment_table') {
                // Comment table doesn't have name column :/
                continue;
            }
            var op = column === 'id' ? 'id =' : 'name ilike';
            queries.push(util.format(
                "SELECT '%s' as table_name from %s WHERE %s '%s'",
                tableName, tableName, op, input
            ));
        }
        var queryStr = queries.join(' UNION ');

        client.query(queryStr, function (err, result) {
            if (err) {
                return callback(err);
            }
            if (result.rows.length === 0) {
                return callback(null, []);
            }
            callback(null, _.uniq(result.rows.map(function(row) {
                return row.table_name
            })));
        });
    }

    function fetchRows(input, tableNames, callback) {
        var data = {};
        var c = 0;
        var error = null;
        if (tableNames.length === 0) {
            callback(error, data);
            return;
        }
        for (var index in tableNames) {
            fetchRowsFromTable(input, tableNames[index], function(err, tableName, rows) {
                c++;
                if (err) {
                    console.error("Error fetching rows from table " + tableName, err);
                    error = err;
                } else {
                    data[tableName] = rows;
                }
                if (c === tableNames.length) {
                    callback(error, data);
                }
            });
        }
    }

    function fetchRowsFromTable(input, tableName, callback) {
        var where = "";
        if (input) {
            var op = Utils.isGuid(input) ? 'id =' : 'name ilike';
            where = util.format("WHERE %s '%s'", op, input);
        }

        var q = util.format("SELECT * FROM %s %s", tableName, where);
        console.log(q);
        client.query(q, function (err, result) {
            if (err) {
                return callback(err);
            }
            callback(null, tableName, result.rows);
        });
    }

    function onRowsFetched(err, data) {
        if (err) {
            var error = 'Error fetching data';
            console.error(error, err);
            return respond(error);
        }
        var results = [];
        for (var tableName in data) {
            for (var index in data[tableName]) {
                var metadataType = findMetadataType(tableName, data[tableName][index]);
                results.push({type: metadataType, row: data[tableName][index]});
            }
        }
        respond(null, results);
    }

    function findMetadataType(tableName, row) {
        var typeFunc = tablesConfig[tableName];
        if (typeFunc) {
            return typeFunc(row);
        } else {
            return tableName.toUpperCase();
        }
    }

    function respond(err, results) {
        results = results || [];
        var response = {error: err, results: results};
        if (req.query.ajax) {
            res.send(response);
        } else {
            var bundlejs = process.env.NODE_ENV === 'production'
                ? 'bundle.min.js'
                : 'bundle.js';
            res.render('obj', {
                bundledJSFile: bundlejs,
                response: response
            });
        }
    }
};
