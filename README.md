# symfony-essentials

Symfony developer, when i begin nodejs, I wanted to implement some features of symfony.

## Dependancy injection (container)
[Dependancy injection in symfony](https://symfony.com/doc/current/components/dependency_injection.html)
Dependancy injection work with a configuration file named "services.json" to be added to the root of your project.

Example of "services.json":
```json
{
    "parameters": {
        "port": "8080"
    },
    "services": {
        "todo": {
            "class": "/src/Service/ToDoService",
            "arguments": ["@request", "!port"]
        },
        "chat": {
            "class": "/src/Service/ChatService",
            "factory": ["socket.io"]
        }
    }
}
```

Example of a service:
```js
// /src/Service/ToDoService.js
module.exports = function(request, port) {
    this.request = request;
    this.port = port;
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
```


How to use:
```js
// /index.js
var container = require("symfony-essentials");

var todoService = container.get('todo'); // get todo service defined above
var app = container.get('app'); // get express application
var path = container.get('path'); // equivalent to require('path')
var port = container.getParameter('port'); // get parameter port

container.listen(port);
```

## Router / Controller
[Controller in symfony](https://symfony.com/doc/current/controller.html)
[Router in symfony](http://symfony.com/doc/current/routing.html)

Controllers need to be defined in /src/Controller Folder.
Example of a controller:
```js
// src/Controller/DefaultController.js
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
}
```

Example of routing.json
```json
{
    "homepage": {
        "path": "/",
        "defaults": {"_controller": "Default:index" }
    },
    "add_note": {
        "path": "/addNote",
        "defaults": { "_controller": "Default:addNote"},
        "methods": ["POST"]
    },
    "remove_note": {
        "path": "/removeNote/:id",
        "defaults": { "_controller": "Default:removeNote"}
    },
    "chat": {
        "path": "/chat",
        "defaults": { "_controller": "Default:chat"}
    }
}
```

## Easier implementation of socket
Socket is important in node, this module implement a clearer and easier way to use socket. Example of a chat implementation:

Definition of the service in services.json:
```json
{
    "parameters": {
    },
    "services": {
        "chat": {
            "class": "/src/Service/ChatService",
            "factory": ["socket.io", "chat"],
            "autoload": true
        }
    }
}
```

Implementation of the service:
```js
// /src/Service/ChatService.js
module.exports = function() {
    this.onConnection = function () {
        this.emit('start', 'Bonjour !');
    }
    this.onLogin = function(data) {
        this.set('login', data);
    }
    this.onMessage = function(data) {
        this.emitAll('message', {"user": this.get('login'), "message": data});
    }
}
```

This is equivalent of:
```js
// /index.js
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(80);

io.of('chat').on('connection', function (socket) {
    socket.emit('start', 'Bonjour !');
    socket.on('login', function(data) {
        socket.login = data;
    })
    socket.on('message', function (data) {
        io.emit('message', {"user": this.get('login'), "message": data});
    });
});
```
