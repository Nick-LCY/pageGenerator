const fs = require("fs")

var readFile = function (path) {
    return fs.readFileSync(path, 'utf8')
}

module.exports = readFile