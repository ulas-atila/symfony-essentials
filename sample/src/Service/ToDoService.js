module.exports = function(request) {
    this.request = request;
    this.todoList = (request.session.todoList || []);

    this.addNote = function(note) {
        this.todoList.push(note);
        this.save();
    }

    this.removeNote = function(index) {
        this.todoList.splice(index, 1);
        this.save();
    }

    this.save = function() {
        this.request.session.todoList = this.todoList;
    }
}
