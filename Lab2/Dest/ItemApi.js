"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaveFile = exports.ReadFile = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function ReadFile(Path) {
    let data = '';
    try {
        data = fs_1.default.readFileSync(path_1.default.resolve(__dirname, Path), 'utf8');
    }
    catch (e) {
        console.log(e);
    }
    return data;
}
exports.ReadFile = ReadFile;
function SaveFile(Path, Data) {
    try {
        fs_1.default.writeFile(path_1.default.resolve(__dirname, Path), JSON.stringify(Data), (err) => {
            if (err)
                console.log(err);
        });
    }
    catch (e) {
        console.log(e);
    }
}
exports.SaveFile = SaveFile;
