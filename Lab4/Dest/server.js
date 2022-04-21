"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = void 0;
const fastify_cors_1 = __importDefault(require("fastify-cors"));
const fastify_1 = __importDefault(require("fastify"));
const fastify_multer_1 = __importDefault(require("fastify-multer"));
const fastify_socket_io_1 = __importDefault(require("fastify-socket.io"));
const fastify_cookie_1 = __importDefault(require("fastify-cookie"));
const fastify_jwt_1 = __importDefault(require("fastify-jwt"));
const User_1 = require("./User");
const path_1 = __importDefault(require("path"));
const ItemsApi_1 = require("./ItemsApi");
const ServerAPI_1 = require("./ServerAPI");
class BadRequest {
    constructor(name, message) {
        this.name = name;
        this.message = message;
    }
    CreateReply(reply) {
        reply.statusCode = 400;
        return reply;
    }
}
class expiredJWT {
    constructor(name, message) {
        this.name = name;
        this.message = message;
    }
    CreateReply(reply) {
        reply.statusCode = 401;
        return reply;
    }
}
class IJSONItem {
    constructor(id, body) {
        this.id = id;
        this.body = body;
    }
}
class ReqBody {
    constructor(InputData, file) {
        if (InputData.TaskName)
            this.TaskName = InputData.TaskName;
        else {
            console.log('Bad Request');
            throw new BadRequest('', '');
        }
        if (InputData.DateTime)
            this.DateTime = InputData.DateTime;
        else {
            console.log('Bad Request');
            throw new BadRequest('', '');
        }
        if (InputData.Status)
            this.Status = InputData.Status;
        else {
            console.log('Bad Request');
            throw new BadRequest('', '');
        }
        if (file)
            this.file = file;
        else
            this.file = '';
        if (!file)
            console.log(' fff');
    }
}
const port = 3001;
const method = ['POST', 'PUT', 'DELETE', 'OPTIONS'];
const server = (0, fastify_1.default)();
exports.server = server;
server.register(fastify_cors_1.default, {
    credentials: true,
    methods: method,
    origin: (origin, cb) => {
        cb(null, true);
    },
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept',
});
server.register(fastify_socket_io_1.default, { 'cors': {
        credentials: true,
        methods: method,
        origin: (origin, cb) => {
            //console.log(origin);
            cb(null, true);
        },
        allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept,cooke',
    },
    cookie: true,
});
server.register(fastify_cookie_1.default);
const key = 'dsadwqtgrfajYHGNUJIH99521jiohu';
server.register((fastify_jwt_1.default), { secret: key });
server.register(fastify_multer_1.default.contentParser);
server.route({
    method: 'POST',
    url: '/Author',
    handler: async (request, reply) => {
        console.log('Author');
        let body = await request.body;
        console.log(body);
        if (!(body?.Password && body?.Login)) {
            reply.code(400).send('Bad request');
            return;
        }
        let user = new User_1.User(body.Password, body.Login);
        let json = JSON.parse((0, ItemsApi_1.ReadFile)(path_1.default.join(__dirname, 'Users.json')));
        let Users = json;
        let index = (0, User_1.FindUser)(Users, user);
        if (index == -1) {
            reply.code(404).send();
            return;
        }
        let usr = Users[index];
        try {
            (0, User_1.SignIn)(usr);
        }
        catch (e) {
            console.log(e);
        }
        try {
            console.log(usr.JWToken);
            reply.setCookie("JWToken", usr.JWToken, { maxAge: 60 * 60, httpOnly: true });
        }
        catch (e) {
            console.log(e);
        }
        reply.code(200).send();
        (0, ItemsApi_1.SaveFile)(path_1.default.join(__dirname, 'Users.json'), JSON.stringify(Users));
    }
});
server.route({
    method: 'POST',
    url: '/Registrate',
    handler: async (request, reply) => {
        console.log('reg');
        let body = await request.body;
        console.log(body);
        if (!(body?.Password && body?.Login)) {
            reply.code(400).send('Bad request');
            return;
        }
        let Password = body.Password;
        let Login = body.Login;
        let user = new User_1.User(Password, Login);
        let json = JSON.parse((0, ItemsApi_1.ReadFile)(path_1.default.join(__dirname, 'Users.json')));
        if (!user.IsUniqUser(json)) {
            reply.code(401).send('');
            return;
        }
        json.push(user);
        (0, ItemsApi_1.SaveFile)(path_1.default.join(__dirname, 'Users.json'), JSON.stringify(json));
        reply.code(200).send();
    }
});
server.ready().then(() => {
    console.log('server start');
    server.io.on('connection', onConnection);
});
const onConnection = async (client) => {
    console.log(client.headers);
    console.log('Client connected');
    client.on('connection', () => {
        console.log(client);
    });
    client.on('Author', (param) => {
        console.log('Author');
        //client.headers['Set-Cookie']='1';
        //onAuthor(param)
        console.log("client Cookie:", client.handshake.headers.cooke);
        client.handshake.headers.cooke = 1;
        console.log(client.handshake);
        client.emit('Author', 2);
    });
    client.prependAny((eventName, ...args) => {
        console.log(eventName);
        if ((eventName != 'Register') && (eventName != 'Author')) {
            (0, ServerAPI_1.VerifeJWT)(args);
        }
    });
    client.on('AddTask', ServerAPI_1.AddTask);
    client.on('PUT', ServerAPI_1.putTask);
    client.on('DeleteTask', ServerAPI_1.DeleteTask);
    client.on('GetTask', async () => {
        (0, ServerAPI_1.GetTask)(client, (arg) => { console.log(arg); client.emit('GetTask', arg); });
    });
    client.on('GetFile', async (arg) => {
        console.log(arg);
        let data = await (0, ServerAPI_1.GetFile)(arg);
        client.emit('GetFile', data);
    });
    client.on('disconnect', () => {
        console.log('User disconnected');
    });
};
const start = async () => {
    try {
        server.listen(port);
    }
    catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};
start();
