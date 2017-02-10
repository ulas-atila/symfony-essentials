var BaseController = function (container) {
    this.container = container;
    
    this.get = function(service) {
        return this.container.get(service);
    }

    this.getParameter = function(name) {
        return this.container.getParameter(name);
    }

    this.redirect = function(route, params) {
        this.get('response').redirect(this.get('router').generate(route, params));
    }
}

var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var ARGUMENT_NAMES = /([^\s,]+)/g;
function getParamNames(func) {
  var fnStr = func.toString().replace(STRIP_COMMENTS, '');
  var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
  if(result === null)
     result = [];
  return result;
}

var setPathToAction = function(container, app, path, controller, action, route, methods) {
    var callback = function(request, response) {
        container.cache['request'] = request;
        container.cache['response'] = response;
        var exp = /:([a-zA-Z0-9]*)/g;
        var params = path.match(exp) || [];
        var func_params = getParamNames(controller[action]);
        if (params.length + 2 !== func_params.length) {
            throw "Nombre de parametres incorrects pour la route " + route;
        }
        func_params[0] = request;
        func_params[1] = response;
        for (var i = params.length - 1; i >= 0; i--) {
            var param = params[i].slice(1);
            var index = func_params.indexOf(param);
            if (index == -1) {
                throw "Parametre " + param + " manquant dans la definition de l'action";
            }
        }

        for (var i = func_params.length - 1; i >= 2; i--) {
            var param = func_params[i];
            func_params[i] = request.params[param];
        }

        controller[action].apply(controller, func_params);
    }
    if (methods) {
        for (var i = methods.length - 1; i >= 0; i--) {
            app[methods[i].toLowerCase()](path, callback);
        }
    } else {
        app.all(path, callback);
    }
}

module.exports = function (container, router, app, fs, express, server) {
    app.set('views', fs.getPath('/src/Views'));
    app.locals.router = router;
    app.use(express.static(fs.getPath('/public')));
    this.controllers = {};
    for (var path in router.paths) {
        var route = router.routes[router.paths[path]];
        var controller = route['defaults']['_controller'];
        controller = controller.split(":");
        if (!this.controllers[controller[0]]) {
            var path2 = fs.getPath('/src/Controller/' + controller[0] + "Controller");
            var obj = require(path2);
            obj.prototype = new BaseController(container);
            obj = new obj();
            this.controllers[controller[0]] = obj;
        }
        setPathToAction(container, app, path, this.controllers[controller[0]], controller[1] + "Action", router.paths[path], route['methods']);
    }
    this.listen = function (port) {
        server.listen(port);
    }
}
