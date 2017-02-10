var fs   = require('fs');
var path = require('path');
var process = require('process');

module.exports.getJSON = function(file) {
    if (file[0] == '/') {
        file = this.getPath(file);
    }
    return JSON.parse(fs.readFileSync(file, 'utf8'));
}

module.exports.saveJSON = function(object) {
    if (file[0] == '/') {
        file = this.getPath(file);
    }
    fs.writeFile(file, JSON.stringify(object), function(err) {
        if(err) {
            console.log(err);
        }
    });
}

module.exports.getPath = function(file) {
    if (file[0] != '/') {
        file = '/' + file;
    }
    return path.join(process.cwd(), file);
}
