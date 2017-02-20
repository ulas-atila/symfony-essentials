var setEvent = function(socket, func, _this) {
    var event = func[2].toLowerCase() + func.substr(3);
    socket.on(event, function(data) {
        _this.socket = socket;
        _this[func](data);
    })
}
module.exports = function (io, suffix) {
    this.io = suffix ? 
        suffix[0] == '/' ? io.of(suffix) : io.of('/' + suffix)
        : io;
    this.init = function() {
        this.io.on('connection', function (socket) {
            this.socket = socket;
            if (typeof this.onConnection == "function") {
                this.onConnection();
            }
            for(var arg in this) {
                var func = this[arg];
                if(typeof func != "function") {
                    continue;
                }
                if (arg.substr(0,2) == "on" && arg[2].toUpperCase() == arg[2]) {
                    setEvent(socket, arg, this);
                }
            }
        }.bind(this));
        return this;
    }
    this.emit = function() {
        this.socket.emit.apply(this.socket, arguments);
    }
    this.emitAll = function() {
        this.io.emit.apply(this.io, arguments);
    }
    this.broadcast = function() {
        this.socket.broadcast.emit.apply(this.socket.broadcast, arguments);
    }
    this.broadcastTo = function() {
        var to = arguments.shift(1);
        to = this.socket.broadcast.to(to);
        to.emit.apply(to, arguments);
    }
    this.set = function(name, value) {
        this.socket[name] = value;
    }
    this.get = function(name) {
        return this.socket[name];
    }
}
