module.exports = function() {
    this.login = null;
    this.onConnection = function () {
        console.log('connection');
    }
    this.onLogin = function(data) {
        this.set('login', data);
        this.emit('start', 'Bonjour !');
    }
    this.onMessage = function(data) {
        this.emitAll('message', {"user": this.get('login'), "message": data});
    }
}