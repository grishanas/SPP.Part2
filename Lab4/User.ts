
import {server} from './server'
import crypto from 'crypto'

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
    public JWToken:string;
    public JWTSecret:string;
    public refreshTokenSecret:string;
    public refreshToken:string;



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
        let b:boolean=true;
        Users.forEach((element) => 
        {
            if((element.Login==this.Login)&&(element.Password==this.Password))
            {
                b=false;
            }
            
        });
        return b;
    }



}

function SignIn(user:User):string
    {
        if(user.refreshToken!=='')
        {
            console.log('empty');
        }
        else
        {
            try{
            user.JWTSecret=crypto.randomBytes(16).toString('hex');
            user.refreshTokenSecret = crypto.randomBytes(16).toString('hex');
            user.JWToken = server.jwt.sign(
                {
                Password:user.Password,
                Login:user.Login
                },
                {expiresIn:"30m"}
                );
            }
            catch(e)
            {
                console.log(e);
            }
            //надо еще создавать refreshtoken 
        }

        console.log(user);
        return user.JWToken;

    }

function FindUser(Users:User[],user:User):number
{
    let i=-1;
    Users.forEach((element,index)=>{
        if((element.Login==user.Login)&&element.Password==user.Password)
            i=index;
    })
    return i;
}




export {User,FindUser,SignIn};