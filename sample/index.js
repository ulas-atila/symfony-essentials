var container = require("symfony-essentials");

var session = container.get('cookie-session');
var bodyParser = container.get('body-parser');
var app = container.get('app');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({secret: 'todotopsecret5'}));

container.listen(container.getParameter("port"));
