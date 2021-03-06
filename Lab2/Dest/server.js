"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = void 0;
const fastify_1 = __importDefault(require("fastify"));
const fastify_multer_1 = __importDefault(require("fastify-multer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const ItemApi = __importStar(require("./ItemApi"));
const fastify_jwt_1 = __importDefault(require("fastify-jwt"));
const fastify_cookie_1 = require("fastify-cookie");
const User_1 = require("./User");
const fastify_cors_1 = __importDefault(require("fastify-cors"));
const crypto_js_1 = __importDefault(require("crypto-js"));
const DataLocation = path_1.default.join(__dirname, 'Data');
console.log(DataLocation);
const server = (0, fastify_1.default)();
exports.server = server;
const method = ['POST', 'PUT', 'DELETE', 'OPTIONS'];
server.register(fastify_cors_1.default, {
    credentials: true,
    methods: method,
    origin: (origin, cb) => {
        console.log(origin);
        cb(null, true);
    }
});
server.addHook('onSend', (request, reply, payload, done) => {
    done();
});
server.register(fastify_multer_1.default.contentParser);
server.register(fastify_cookie_1.fastifyCookie);
const key = 'dsadwqtgrfajYHGNUJIH99521jiohu';
server.register((fastify_jwt_1.default), { secret: key });
let upload = (0, fastify_multer_1.default)();
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
async function PostAddItem(request, reply) {
    try {
        let tmp = await request.body;
        let file = await request.file;
        let Task = new ReqBody(tmp, file.path);
        let data = ItemApi.ReadFile(path_1.default.join(DataLocation, 'Data.json'));
        let json = JSON.parse(data);
        let id = 1;
        json.forEach((element) => {
            element.id = id++;
        });
        let Item = new IJSONItem(id, Task);
        json.push(Item);
        ItemApi.SaveFile(path_1.default.join(DataLocation, 'Data.json'), json);
        reply.code(200).send('Addition was successful');
    }
    catch (err) {
        let error = err;
        if (error) {
            reply.code(400);
        }
        reply.send();
    }
    finally {
    }
}
async function GetAllItem(request, reply) {
    console.log('data');
    let Data = fs_1.default.createReadStream(path_1.default.join(DataLocation, 'Data.json'));
    reply.header('Content-Type', 'application/octet-stream');
    reply.send(Data);
}
server.get('/*', async (request, reply) => {
    console.log('GetFile');
    reply.send(fs_1.default.readFileSync(path_1.default.join(__dirname, 'Data', request.url.split("/").pop())));
});
async function PUT(request, reply) {
    try {
        let id = await request.body;
        console.log(id);
        let data = ItemApi.ReadFile(path_1.default.join(DataLocation, 'Data.json'));
        let json = JSON.parse(data);
        let Item;
        json.forEach((element) => {
            if (element.id == Number(id.id)) {
                Item = element;
            }
        });
        if (!Item)
            reply.code(404).send('Task not found');
        console.log(2);
        if (id['TaskName'])
            Item.body.TaskName = id.TaskName;
        if (id['DateTime'])
            Item.body.DateTime = id.DateTime;
        if (id['Status'])
            Item.body.Status = id.Status;
        if (request.file)
            Item.body.file = request.file.path;
        console.log(Item);
        ItemApi.SaveFile(path_1.default.join(DataLocation, 'Data.json'), json);
        reply.code(200).send('ok');
    }
    catch {
        reply.code(500).send('server errore');
    }
}
async function Delete(request, reply) {
    console.log('Delete');
    try {
        let id = await request.body;
        if ((id === undefined) || (id === null)) {
            reply.code(404).send('id not found');
            return;
        }
        let data = ItemApi.ReadFile(path_1.default.join(DataLocation, 'Data.json'));
        let json = JSON.parse(data);
        let Item;
        json.forEach((element, index) => {
            id.id.forEach((e) => {
                if (element.id == (e)) {
                    try {
                        Item = element;
                        json.splice(index, 1);
                    }
                    catch (e) {
                        console.log(e);
                    }
                }
            });
        });
        if (!Item)
            reply.code(404).send('no task with this id');
        ItemApi.SaveFile(path_1.default.join(DataLocation, 'Data.json'), json);
        fs_1.default.unlink(Item.body.path, (err) => { console.log(err); });
        reply.code(200).send('ok');
    }
    catch {
        reply.send(500).send('server Errore');
    }
}
const post = fastify_multer_1.default.diskStorage({
    destination: function (req, file, callback) {
        console.log('dest');
        callback(null, './Dest/Data');
    },
    filename: (req, file, callback) => {
        console.log('filename');
        console.log(file.originalname);
        callback(null, file.originalname);
    }
});
const put = fastify_multer_1.default.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './Dest/Data');
    },
    filename: (req, file, callback) => {
        callback(null, file.originalname);
    }
});
/*async function Opt(request:FastifyRequest,reply:FastifyReply)
{

    let hostname=request.url;
    console.log(hostname);
    reply.header('Access-Control-Allow-Origin','127.0.0.1:3000');
    reply.header('Access-Control-Allow-Credentials', true);
    reply.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    reply.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Origin, Cache-Control");
    reply.header('access-control-max-age',7200);
    reply.code(204).send();
}*/
server.route({
    method: 'POST',
    url: '/',
    handler: PostAddItem,
    preHandler: (0, fastify_multer_1.default)({ storage: post }).single('file')
});
/*server.route({
    method:'OPTIONS',
    url:'/*',
    handler:Opt,
})*/
server.route({
    method: 'GET',
    url: '/',
    handler: GetAllItem,
});
server.route({
    method: 'PUT',
    url: '/',
    handler: PUT,
    preHandler: (0, fastify_multer_1.default)({ storage: put }).single('file'),
});
server.route({
    method: 'DELETE',
    url: '/',
    handler: Delete,
});
server.route({
    method: 'POST',
    url: '/Author',
    handler: async (request, reply) => {
        console.log('Author');
        let body = await request.body;
        //console.log(body);
        if (!(body?.Password && body?.Login)) {
            reply.code(400).send('Bad request');
            return;
        }
        let user = new User_1.User(body.Password, body.Login);
        let json = JSON.parse(ItemApi.ReadFile(path_1.default.join(__dirname, 'Users.json')));
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
            //console.log(usr.JWToken);
            reply.setCookie("JWToken", usr.JWToken, { maxAge: 60 * 60, httpOnly: true });
        }
        catch (e) {
            console.log(e);
        }
        reply.code(200).send();
        ItemApi.SaveFile(path_1.default.join(__dirname, 'Users.json'), Users);
    }
});
server.route({
    method: 'POST',
    url: '/Registrate',
    handler: async (request, reply) => {
        console.log('reg');
        let body = await request.body;
        //console.log(body);
        if (!(body?.Password && body?.Login)) {
            reply.code(400).send('Bad request');
            return;
        }
        let Password = body.Password;
        let Login = body.Login;
        let user = new User_1.User(Password, Login);
        let json = JSON.parse(ItemApi.ReadFile(path_1.default.join(__dirname, 'Users.json')));
        if (!user.IsUniqUser(json)) {
            reply.code(401).send();
            return;
        }
        json.push(user);
        ItemApi.SaveFile(path_1.default.join(__dirname, 'Users.json'), json);
        reply.code(200).send();
    }
});
function isVerifyJWT(jwToken) {
    if (jwToken == null)
        return false;
    try {
        let verify = server.jwt.verify(jwToken);
        console.log("Token:", verify);
    }
    catch (e) {
        console.log("token errore:", e);
        throw new expiredJWT("jwt Token", 'jwt token has expired');
    }
    return true;
}
server.addHook('onRequest', (request, reply, done) => {
    let method = request.method;
    console.log("Request method:", method);
    try {
        if (method == 'GET') {
            done();
            return;
        }
        if (method.indexOf(method) >= -1) {
            if ((request.url !== '/Registrate') && (request.url !== '/Author')) {
                console.log();
                if (request?.cookies?.JWToken ?? null) {
                    try {
                        if (!isVerifyJWT(request?.cookies?.JWToken)) {
                            reply.code(401).send('incorected jwt token');
                            return;
                        }
                        else {
                            let token = server.jwt.verify(request?.cookies?.JWToken);
                            let Users = JSON.parse(ItemApi.ReadFile('Users.json'));
                            Users.forEach((e) => {
                                console.log(e.Password);
                                console.log(crypto_js_1.default.SHA256(e.Password).toString());
                                if ((crypto_js_1.default.SHA256(e.Password).toString() === token.Password) && (crypto_js_1.default.SHA256(e.Login).toString() === token.Login))
                                    console.log(true);
                                else {
                                    throw new BadRequest('', "");
                                }
                            });
                        }
                    }
                    catch (e) {
                        console.log(e);
                        if (e instanceof expiredJWT) {
                            console.log('expiredJWT');
                            reply.setCookie("JWToken", '');
                            reply.code(401).send();
                            return;
                        }
                    }
                }
                else {
                    console.log('Unauthorized');
                    reply.code(401).send('Unauthorized');
                    return;
                }
            }
            else {
            }
            done();
        }
    }
    catch (e) {
        console.log(e);
    }
});
const start = async () => {
    try {
        await server.listen(3001);
    }
    catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};
start();
