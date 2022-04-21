"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignIn = exports.FindUser = exports.User = void 0;
const server_1 = require("./server");
const crypto_1 = __importDefault(require("crypto"));
const crypto_js_1 = __importDefault(require("crypto-js"));
class User {
    constructor(Password, Login) {
        this.Password = Password;
        this.Login = Login;
        this.JWToken = '';
        this.refreshToken = '';
        this.JWTSecret = '';
        this.refreshTokenSecret = '';
    }
    IsUniqUser(Users) {
        let b = true;
        Users.forEach((element) => {
            if ((element.Login == this.Login) && (element.Password == this.Password)) {
                b = false;
            }
        });
        return b;
    }
}
exports.User = User;
function SignIn(user) {
    if (user.refreshToken !== '') {
        console.log('empty');
    }
    else {
        console.log('sigin');
        try {
            user.JWTSecret = crypto_1.default.randomBytes(16).toString('hex');
            user.refreshTokenSecret = crypto_1.default.randomBytes(16).toString('hex');
            let pas = crypto_js_1.default.SHA256(user.Password).toString();
            let log = crypto_js_1.default.SHA256(user.Login).toString();
            console.log(pas, log);
            user.JWToken = server_1.server.jwt.sign({
                Password: pas,
                Login: log,
            }, { expiresIn: "30*60" });
        }
        catch (e) {
            console.log(e);
        }
        //надо еще создавать refreshtoken 
    }
    return user.JWToken;
}
exports.SignIn = SignIn;
function FindUser(Users, user) {
    let i = -1;
    Users.forEach((element, index) => {
        if ((element.Login == user.Login) && element.Password == user.Password)
            i = index;
    });
    return i;
}
exports.FindUser = FindUser;
