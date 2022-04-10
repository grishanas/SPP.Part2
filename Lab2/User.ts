
import {server} from './server'
import crypto from 'crypto'
import { partial } from 'lodash';

interface IUser
{
    Password:string;
    Login:string;
    IsUniqUser(Users:IUser[]):boolean;
}

class User implements IUser
{

    Password:string;
    Login:string;
    private JWToken:string;
    private JWTSecret:string;
    private refreshTokenSecret:string;
    private refreshToken:string;

    constructor(Password:string,Login:string)
    {
        this.Password=Password;
        this.Login=Login;
        this.JWToken='';
        this.refreshToken='';
        this.JWTSecret = ''; 
        this.refreshTokenSecret=''
    }

    IsUniqUser(Users:IUser[]):boolean
    {
        Users.forEach((element) => 
        {
            if((element.Login===this.Login)&&(element.Password===this.Password))
                return true;
            
        });
        return false;
    }

    public SignIn():string
    {
        if(this.refreshToken==='')
        {

        }
        else
        {
            this.JWTSecret=crypto.randomBytes(16).toString('hex');
            this.refreshTokenSecret = crypto.randomBytes(16).toString('hex');
            this.JWToken = server.jwt.sign(
                {
                Password:this.Password,
                Login:this.Login
                },
                {algorithm:'RS512',
                expiresIn:"30m"}
            );
            //надо еще создавать refreshtoken 
        }

        return this.JWToken;

    }

}

export {User};