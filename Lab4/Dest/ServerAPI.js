"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifeJWT = exports.putTask = exports.DeleteTask = exports.onAuthor = exports.onRegister = exports.GetFile = exports.AddTask = exports.GetTask = void 0;
const path_1 = __importDefault(require("path"));
const ItemsApi_1 = require("./ItemsApi");
const mime_1 = __importDefault(require("mime"));
const fs_1 = __importDefault(require("fs"));
const DataLocation = path_1.default.join(__dirname, 'Data');
const GetTask = async (s, cb) => {
    console.log('GetTask');
    let data = ((0, ItemsApi_1.ReadFileAsync)(path_1.default.join(DataLocation, 'Data.json'), cb));
    return data;
};
exports.GetTask = GetTask;
const AddTask = async (request, file, cb) => {
    console.log('AddTask');
    let data = JSON.parse((0, ItemsApi_1.ReadFile)(path_1.default.join(DataLocation, 'Data.json')));
    let Id = data[data.length - 1]?.id ?? 0;
    Id++;
    let item = {
        id: Id ?? '',
        body: {
            TaskName: request?.TaskName ?? '',
            DateTime: request?.DateTime ?? null,
            Status: request?.Status ?? '',
            file: request?.file ?? '',
        }
    };
    console.log('file:', file);
    console.log('req:', request);
    data.push(item);
    if (request?.file) {
        (0, ItemsApi_1.AddFile)(path_1.default.join(DataLocation, request?.file), request.fileBuffer);
    }
    (0, ItemsApi_1.SaveFile)(path_1.default.join(DataLocation, 'Data.json'), JSON.stringify(data));
};
exports.AddTask = AddTask;
const GetFile = async (s) => {
    console.log('GetFile');
    console.log(path_1.default.join(DataLocation, s));
    let data = (0, ItemsApi_1.ReadFile)(path_1.default.join(DataLocation, s));
    let answ = {
        mime: mime_1.default.getType(path_1.default.join(DataLocation, s)),
        fileName: s,
        data: data
    };
    return answ;
};
exports.GetFile = GetFile;
const DeleteTask = async (request, cb) => {
    try {
        let arr = request;
        let data = (0, ItemsApi_1.ReadFile)(path_1.default.join(DataLocation, 'Data.json'));
        let json = JSON.parse(data);
        console.log(json);
        let Item;
        json.forEach((element, index) => {
            console.log(element);
            request.forEach((e) => {
                if (element.id == (e.id)) {
                    try {
                        Item = element;
                        console.log(index);
                        fs_1.default.unlink(Item.body.path, (err) => { console.log(err); });
                        json.splice(index, 1);
                    }
                    catch (e) {
                        console.log('21', e);
                    }
                }
            });
        });
        (0, ItemsApi_1.SaveFile)(path_1.default.join(DataLocation, 'Data.json'), JSON.stringify(json));
    }
    catch (e) {
        console.log(e);
    }
};
exports.DeleteTask = DeleteTask;
const putTask = async (param) => {
    console.log(param);
    let data = (0, ItemsApi_1.ReadFile)(path_1.default.join(DataLocation, 'Data.json'));
    let json = JSON.parse(data);
    let Item;
    json.forEach((element) => {
        if (element.id == Number(param.id)) {
            Item = element;
        }
    });
    switch (param.method) {
        case ('TaskName'):
            Item.body.TaskName = param.value;
            break;
        case ('Status'):
            Item.body.DateTime = param.value;
            break;
        case ('DateTime'):
            Item.body.Status = param.value;
            break;
        case ('file'):
            fs_1.default.unlink(path_1.default.join(DataLocation, Item.body.file), (err) => { console.log(err); });
            Item.body.file = param.value.fileName;
            (0, ItemsApi_1.AddFile)(path_1.default.join(DataLocation, param.fileName), param.value.buffer);
            break;
    }
    console.log(Item);
    (0, ItemsApi_1.SaveFile)(path_1.default.join(DataLocation, 'Data.json'), JSON.stringify(json));
};
exports.putTask = putTask;
const onRegister = async (param) => {
};
exports.onRegister = onRegister;
const onAuthor = async (param) => {
    return true;
};
exports.onAuthor = onAuthor;
const VerifeJWT = (args) => {
    return true;
};
exports.VerifeJWT = VerifeJWT;
