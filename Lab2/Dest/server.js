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
const fastify_1 = __importDefault(require("fastify"));
const fastify_multer_1 = __importDefault(require("fastify-multer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const ItemApi = __importStar(require("./ItemApi"));
const fastify_jwt_1 = __importDefault(require("fastify-jwt"));
const lodash_1 = __importDefault(require("lodash"));
const DataLocation = path_1.default.join(__dirname, 'Data');
console.log(DataLocation);
const server = (0, fastify_1.default)();
server.register(fastify_multer_1.default.contentParser);
server.register((fastify_jwt_1.default), { secret: 'secret' });
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
server.addHook('onSend', (request, reply, payload, done) => {
    reply.header("Access-Control-Allow-Origin", "*");
    reply.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE,OPTION");
    reply.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Origin");
    done();
});
async function PostAddItem(request, reply) {
    try {
        let tmp = await request.body;
        let file = await request.file;
        console.log(tmp, file);
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
        console.log(id);
        let data = ItemApi.ReadFile(path_1.default.join(DataLocation, 'Data.json'));
        let json = JSON.parse(data);
        let Item;
        json.forEach((element, index) => {
            id.id.forEach((e) => {
                console.log(e);
                if (element.id == (e)) {
                    try {
                        Item = element;
                        console.log(index);
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
async function Opt(request, reply) {
    reply.code(204).send();
}
server.addHook('onRequest', (request, reply) => {
    console.log('request:', request.raw);
});
server.route({
    method: 'POST',
    url: '/',
    handler: PostAddItem,
    preHandler: (0, fastify_multer_1.default)({ storage: post }).single('file')
});
server.route({
    method: 'OPTIONS',
    url: '/',
    handler: Opt,
});
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
        let body = await request.body;
        if (!lodash_1.default.has(body, ['Password', 'Login'])) {
            reply.code(400).send('Bad request');
            return;
        }
        let Password = body.Password;
        let Login = body.Login;
        let json = JSON.parse(ItemApi.ReadFile(path_1.default.join(__dirname, 'Users.json')));
        let author = false;
        json.forEach((element) => {
            if ((element.Login === Login) && (element.Password === Password))
                author = true;
        });
        if (!author) {
            reply.code(404).send();
            return;
        }
        let jwToken = server.jwt.sign({ 'Password': Password, 'Login': Login });
        reply.send(jwToken);
    }
});
server.route({
    method: 'POST',
    url: '/Registrate',
    handler: async (request, reply) => {
        let body = await request.body;
        if (!lodash_1.default.has(body, ['Password', 'Login'])) {
            reply.code(400).send('Bad request');
            return;
        }
        let Password = body.Password;
        let Login = body.Login;
        let json = JSON.parse(ItemApi.ReadFile(path_1.default.join(__dirname, 'Users.json')));
        //тут должна быть проверка на существование данного пользователя
        json.push({ 'Password': Password, 'Login': Login });
        ItemApi.SaveFile(path_1.default.join(__dirname, 'Users.json'), json);
        reply.code(200).send();
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
