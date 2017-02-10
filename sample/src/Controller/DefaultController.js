module.exports = function() {
    this.indexAction = function (req, res) {
        var todoService = this.get('todo');

        res.render('index.twig', {
           list: todoService.todoList
        });
    }
    this.addNoteAction = function (req, res) {
        if (req.body && req.body.note && req.body.note != "") {
            this.get('todo').addNote(req.body.note);
        }
        this.redirect('homepage');
    }
    this.removeNoteAction = function (req, res, id) {
        this.get('todo').removeNote(id);
        this.redirect('homepage');
    }
    this.chatAction = function(req, res) {
        res.render('chat.twig');
    }
}
