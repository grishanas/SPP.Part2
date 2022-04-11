"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignIn = exports.FindUser = exports.User = void 0;
const server_1 = require("./server");
const crypto_1 = __importDefault(require("crypto"));
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
        try {
            user.JWTSecret = crypto_1.default.randomBytes(16).toString('hex');
            user.refreshTokenSecret = crypto_1.default.randomBytes(16).toString('hex');
            user.JWToken = server_1.server.jwt.sign({
                Password: user.Password,
                Login: user.Login
            }, { expiresIn: "30m" });
        }
        catch (e) {
            console.log(e);
        }
        //надо еще создавать refreshtoken 
    }
    console.log(user);
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
