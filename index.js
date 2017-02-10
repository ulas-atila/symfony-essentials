var fs = new require('./FileSystem');

function isFunction(functionToCheck) {
    var getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

function convertArguments(base, _arguments) {
    var arguments = base;
    for(var i in _arguments) {
        var argument = _arguments[i];
        if (argument == null) {
            arguments.push(argument);
        } else if (argument[0] == "@") {
            arguments.push(this.get(argument.substr(1)));
        } else if (argument[0] == "%") {
            arguments.push(this.getParameter(argument.slice(1)))
        } else {
            arguments.push(argument);
        }
    }
    return arguments;
}

var Container = function () {
    var file = fs.getJSON('/services.json');
    this.services = file['services'];
    this.services['app'] = {
        'class': 'express'
    }
    this.services['router'] = {
        'class': 'symfony-essentials/Router',
        'arguments': ["routing.json", "@filesystem"]
    }
    this.services['controller'] = {
        'class': 'symfony-essentials/Controller',
        'arguments': ["@container", "@router", "@app", "@filesystem", "@express", "@server"]
    }
    this.services['server'] = {
        'class': 'http',
        'function': {
            'name': 'Server',
            'arguments': ['@app']
        }
    }
    this.services['socket.io'] = {
        'class': 'socket.io',
        'arguments': ["@server"]
    }
    for (var name in this.services) {
        var service = this.services[name];
        if (service["factory"]) {
            if (service["factory"][0] == "socket.io") {
                this.services[name]["parent"] = "chat_parent";
                this.services[name]["function"] = {"name":"init"};
                this.services[name + '_parent'] = {
                    "class": "symfony-essentials/SocketIo",
                    "arguments": ["@socket.io", service["factory"][1]]
                }
            }
        }
    }
    this.parameters = file['parameters'];
    this.cache = {"container": this, "filesystem": fs, "response": null, "request": null};

    this.getParameter = function(name) {
        return this.parameters[name];
    }

    this.get = function(name) {
        if (name in this.cache) {
            return this.cache[name];
        }
        if (!(name in this.services)) {
            this.cache[name] = require(name);

            return this.cache[name];
        }

        var service = this.services[name];
        var className = service["class"];
        if (className[0] == "/") {
            className = fs.getPath(className);
        }

        var obj = require(className);

        if (typeof obj == "function") {
            var arguments = convertArguments.call(this, [null], service['arguments']);
            if (service['tags']) {
                for (var i = service['tags'].length - 1; i >= 0; i--) {
                    var tag = service['tags'][i];
                    if (tag['name'] != "socket") {
                        continue;
                    }

                    var SocketIo = require('./SocketIo');
                    var socket = new SocketIo(this.get('socket.io'), tag['suffix']);
                    obj.prototype = socket;
                }
            }
            if (service['parent']) {
                obj.prototype = this.get(service['parent']);
            }
            obj = new (Function.prototype.bind.apply(obj, arguments));
        }

        if ("function" in service) {
            var arguments = convertArguments.call(this, [], service['function']['arguments']);
            obj = obj[service['function']['name']].apply(obj, arguments);
        }

        this.cache[name] = obj;

        return this.cache[name];
    }

    this.listen = function(port) {
        for (var name in this.services) {
            var service = this.services[name];
            if (service['autoload']) {
                this.get(name);
            }
        }
        this.get('controller').listen(port);
    }
}

module.exports = new Container();
