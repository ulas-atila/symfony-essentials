module.exports = function (file, fs) {
    this.routes = fs.getJSON(file, 'utf8');
    this.paths = {};
    for (var name in this.routes) {
        var route = this.routes[name];
        this.paths[route['path']] = name;
    }

    this.generate = function(route, params) {
        params = params || [];
        var path = this.routes[route]['path'];
        var defaults = this.routes[route]['defaults'];
        var exp = /:([a-zA-Z0-9]*)/g;
        var path_params = path.match(exp) || [];
        for (var i = path_params.length - 1; i >= 0; i--) {
            var param = path_params[i].slice(1);
            if (params[param] != undefined) {
                path = path.replace(':' + param, params[param]);
            } else if (defaults[param] != undefined) {
                path = path.replace(':' + param, defaults[param]);
            } else {
                throw "Impossible de générer la route " + route + ". Paramétre " + param + " manquant";
            }
        }

        return path;
    }
}
