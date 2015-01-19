// BASIC SETUP
// ==============================================
var express = require('express'),
    http = require('http'),
    app = express(),
    mongo = require('mongoose'),
    oler_db = require('./config/oler_database'),
    port = process.env.PORT || 2222,
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    router = express.Router(),
    cors = require('cors'),
    server = http.createServer(app),
    socketio = require('socket.io');

var io = socketio.listen(server);
app.set('socketio', io);
app.set('server', server);

// DATABASE
// ==============================================
mongo.connect(oler_db.url);

// CONFIGURATION
// ==============================================
app.use(cors());
app.use(cors({credentials: true}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(methodOverride());
app.use('/api/v1', router);


// ROUTER
// ==============================================
require('./config/router')(router);

// SERVER START
// ==============================================
server.listen(port);
console.log("Server is running on " + port);