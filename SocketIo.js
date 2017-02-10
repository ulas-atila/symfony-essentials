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
                    e = arg[2].toLowerCase() + arg.substr(3);
                    this.socket.on(e, func.bind(this));
                }
            }
        }.bind(this));
        return this;
    }
    this.emit = function(e, m) {
        this.socket.emit(e, m);
    }
    this.emitAll = function(e, m) {
        this.io.emit(e, m);
    }
}


