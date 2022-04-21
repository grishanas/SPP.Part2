"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddFile = exports.SaveFile = exports.ReadFileAsync = exports.ReadFile = void 0;
const fs_1 = __importDefault(require("fs"));
function ReadFile(Path) {
    let data = '';
    try {
        data = fs_1.default.readFileSync(Path, 'utf8');
    }
    catch (e) {
        console.log(e);
    }
    //console.log(data);
    return data;
}
exports.ReadFile = ReadFile;
function ReadFileAsync(Path, cb) {
    fs_1.default.readFile(Path, 'binary', (err, data) => { cb(data); });
}
exports.ReadFileAsync = ReadFileAsync;
function SaveFile(Path, Data) {
    try {
        //console.log(JSON.stringify(Data));
        fs_1.default.writeFile(Path, (Data), (err) => {
            if (err)
                console.log(err);
        });
    }
    catch (e) {
        console.log(e);
    }
}
exports.SaveFile = SaveFile;
function AddFile(Path, data) {
    try {
        console.log('AddFile');
        fs_1.default.open(Path, 'w', (err, fil) => {
            if (err)
                console.log(err);
            fs_1.default.write(fil, data, 0, data.length, null, (err) => {
                if (err)
                    console.log(err);
                fs_1.default.close(fil);
            });
        });
    }
    catch (e) {
        console.log(e);
    }
}
exports.AddFile = AddFile;
