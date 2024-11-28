const fs = require('fs');
const path = require('path');
const log = require('./tools').log || console.log;

var Queries = {};

exports.initialize = function (fileName, cb) {
    fs.exists(fileName, (e) => {
        if (e) {
            if (path.extname(fileName) !== '.sql') {
                console.error(new Error('The Selected File Is not of Type "sql"'));
            } else {
                readQueries(fileName, cb);
            };
        }else{
            console.error(new Error('Cannot Find A File At ' + fileName));
        };
    });
};

function readQueries(fileName, cb) {
    log('Initializing SQL Queries...');
    fs.readFile(fileName, (err, data) => {
        if (err) throw err;
        data = data.toString();
        const queries = data.split('--END_QUERY');
        queries.pop();
        queries.forEach(query => {
            const queryName = query.split('=> QUERY:')[0].trim().split('').splice(2).join('');
            const queryData = query.split('=> QUERY:')[1].trim();
            if (Queries[queryName]) {
                throw new Error('Duplicated Names ' + queryName);
            };
            Queries[queryName] = queryData;
        });
        //console.log(Queries);
        cb();
        
    });
};

exports.query = function (query) {
    return Queries[query] || '';
};