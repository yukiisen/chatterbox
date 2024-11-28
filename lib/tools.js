const fs = require('fs');
const moment = require('moment');
const Console = require('console').Console;

var outLog;
var errLog;

let logs = {
    red: ['\u001b[31m', '\u001b[39m'],
    blue: ['\u001b[34m', '\u001b[39m'],
    yellow: ['\u001b[33m', '\u001b[39m'],
    green: ['\u001b[32m', '\u001b[39m']
};

global.logs = logs;
exports.setLog = (logFile, errorFile) => {
    var data = fs.readFileSync(logFile);
    outLog = fs.createWriteStream(logFile, {encoding: 'utf8'});
    outLog.write(data);
    data = fs.readFileSync(errorFile);
    errLog = fs.createWriteStream(errorFile, {encoding: 'utf8'});
    errLog.write(data);
    exports.console = new Console({ stdout: outLog, stderr: errLog, colorMode: true });
    exports.log('Log Tool Ready...');
};

exports.basicLog = function (data, col) {
    if (col) {
        console.log(logs[col][0] + data + logs[col][1]);
    } else {
        console.log(data);
    };
};

exports.log = function (data, col) {
    if (col) {
        console.log(logs[col][0] + data + logs[col][1]);
    } else {
        console.log(data);
    };
    
    if (outLog && errLog) {
        if (typeof data === 'object') {
            data = JSON.stringify(data);
        };
        exports.console.log(moment().format('dd MMMM Do YYYY - h:mm') + ' ' + data);
    } else {
        console.error(new Error('No Log File Selected'));
    };
};
exports.error = function (err) {
    console.error(logs.red[0] + err + logs.red[1]);
    
    if (outLog && errLog) {
        if (typeof data === 'object') {
            data = JSON.stringify(moment().format('dd MMMM Do YYYY - h:mm') + ' ' + data);
        };
        exports.console.error(err.stack);
    } else {
        console.error(new Error('No Log File Selected'));
    };
};

exports.parseNumber = function (num) {
    let reg = /[a-z]/gi;
    if (num.toString().match(reg)) {
        let arrayNum = num.split('');
        let multiplyer = arrayNum.pop().toUpperCase();
        switch (multiplyer) {
            case 'K':
                return +arrayNum.join('') * 1000;
                break;
            case 'M':
                return +arrayNum.join('') * 1000 * 1000;
                break;
        };
    } else {
        if (+num >= 1000 * 1000) {
            return (+num / 1000000).toFixed(1) + 'M';
        } else if (+num >= 1000){
            return (+num / 1000).toFixed(1) + 'K';
        }else{
            return +num;
        };
    };
};

exports.containsArabic = function containsArabic(text) {
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return arabicRegex.test(text);
};
exports.containsJapanese = function containsJapanese(text) {
    const japaneseRegex = /[\u3040-\u30FF\u31F0-\u31FF\uFF00-\uFFEF\u4E00-\u9FAF\u3400-\u4DBF]/;
    return japaneseRegex.test(text);
};
exports.containsEnglish = function containsEnglish(text) {
    const englishRegex = /[a-z A-Z]/;
    return englishRegex.test(text.split(' ').join(''));
};


/**
 * Normalizes A given Matrix.
 * @param matrix Object Containing Raw Matrix
 * @returns Another object with the same structure containing the normalized data.
 * 
 * @throws an error if no matrix was given...
 */
function normalize(matrix) {
    if (!matrix || typeof matrix != 'object') {
        throw new Error('No Matrix Given');
    };
    let min = 0, max = 0;
    for (const key in matrix) {
        if (!Object.hasOwnProperty.call(matrix, key)) {
            return NaN;
        }
        const element = matrix[key];
        const Min = Math.min(...Object.values(element).flat());
        const Max = Math.max(...Object.values(element).flat());
        min = Math.min(Min, min);
        max = Math.max(Max, max);
    }
    return Object.fromEntries(
        Object.entries(matrix).map(([user, posts]) => [
            user,
            Object.fromEntries(
                Object.entries(posts).map(([post, count]) => [post, (count - min) / (max - min)])
            )
        ])
    );
}

module.exports.normalize = normalize;

/**
 * Counts the similarity between two objects with normalized data
 * @param {Object} vecA Object containing indexed normalized data
 * @param {Object} vecB Object containing indexed normalized data
 * @returns {Number} The similarity between the two objects
 * @throws An error if the specified arguments aren't numbers
 */

const cosineSimilarity = (vecA, vecB) => {
    if (typeof vecA !== 'number' || typeof vecB !== 'number') {
        throw new Error('Wrong Arguments');
    }
    const dotProduct = Object.keys(vecA).reduce((acc, key) => acc + (vecA[key] * (vecB[key] || 0)), 0);
    const magnitudeA = Math.sqrt(Object.values(vecA).reduce((acc, val) => acc + (val * val), 0));
    const magnitudeB = Math.sqrt(Object.values(vecB).reduce((acc, val) => acc + (val * val), 0));
    return dotProduct / (magnitudeA * magnitudeB);
};

module.exports.cosineSimilarity = cosineSimilarity;


function countSimilarity(normalizedMatrix) {
    const userSimilarity = {};
    Object.keys(normalizedMatrix).forEach(userA => {
        userSimilarity[userA] = {};
        Object.keys(normalizedMatrix).forEach(userB => {
            if (userA !== userB) {
                userSimilarity[userA][userB] = cosineSimilarity(normalizedMatrix[userA], normalizedMatrix[userB]);
            }
        });
    });
    return userSimilarity;
};

module.exports.countSimilarity = countSimilarity;



const getRecommendations = exports.getRecommendations = (userId, userSimilarity, userPostMatrix, n = 5) => {
    const similarUsers = Object.entries(userSimilarity[userId]).sort(([, a], [, b]) => b - a).slice(0, n).map(([user]) => user);
    const similarUsersPosts = similarUsers.flatMap(user => Object.keys(userPostMatrix[user]));
    const recommendedPosts = Array.from(new Set(similarUsersPosts)).filter(post => !userPostMatrix[userId][post]);
    return recommendedPosts.slice(0, n);
};

module.exports.getRecommendations = getRecommendations;