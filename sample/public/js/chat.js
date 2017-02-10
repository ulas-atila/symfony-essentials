$(document).ready(function(){
    var socket;
    $('#frm_login').on('submit', function(e) {
        e.stopPropagation();
        e.preventDefault();
        var val = $("#login").val();
        if (val == "") {
            return;
        }
        socket = io.connect('http://localhost:8080');
        socket.on('message', function(data) {
            $('#chat_msg').append("<li><strong>" + data.user + "</strong> " + data.message + "</li>");
        });
        socket.emit('login', val);
        $('#frm_login').hide();
        $('#frm_msg').show();
    });

    $("#frm_msg").on('submit', function(e) {
        e.stopPropagation();
        e.preventDefault();
        var val = $("#msg").val();
        if (val == "") {
            return;
        }
        socket.emit('message', val);
        $("#msg").val('');
    });
})
