var express = require('express');
var pg = require('pg');
var util = require('util');
var tablesConfig = require('../common/TablesConfig');

module.exports = function (req, res) {
    var id = req.params.id;

    if (!req.cookies.host || !req.cookies.port || !id) {
        return respond();
    }

    var conString = "postgres://postgres:@" + req.cookies.host + ":"
        + req.cookies.port + "/defaultdb";
    var client = new pg.Client(conString);

    client.connect(function (err) {
        if (err) {
            console.error("Error connecting to postgres: ", err);
            // TODO: Send error info on client.
            return respond();
        }
        findContainingTable(id, function (err, tableName) {
            if (err) {
                console.error("Error finding right table for " + id, err);
                return respond();
            }
            fetchRow(id, tableName, function (err, row) {
                if (err) {
                    console.error(
                        util.format("Error fetching row for ID: %s in table: %s", id, tableName),
                        err
                    );
                    return respond();
                }
                var metadataType = findMetadataType(tableName, row);
                respond(metadataType, row);
            });
        });
    });

    function findContainingTable(id, callback) {
        var queries = [];
        for (var tableName in tablesConfig) {
            queries.push(util.format(
                "SELECT '%s' as table_name from %s WHERE id = '%s'",
                tableName, tableName, id
            ));
        }
        var queryStr = queries.join(' UNION ');

        client.query(queryStr, function (err, result) {
            if (err) {
                return callback(err);
            }
            if (result.rows.length === 0) {
                return callback("No table has this id");
            }
            callback(null, result.rows[0].table_name);
        });
    }

    function fetchRow(id, tableName, callback) {
        client.query(
            "SELECT * FROM " + tableName + " WHERE id='" + id + "' limit 1",
            function (err, result) {
                if (err) {
                    return callback(err);
                }
                callback(null, result.rows[0]);
            }
        );
    }

    function findMetadataType(tableName, row) {
        var typeFunc = tablesConfig[tableName];
        if (typeFunc) {
            return typeFunc(row);
        } else {
            return tableName.toUpperCase();
        }
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
