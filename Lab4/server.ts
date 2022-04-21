import fastifyCors from "fastify-cors";
import fastify, { FastifyReply, FastifyRequest } from "fastify";
import multer from 'fastify-multer';
import fastifyIO from 'fastify-socket.io'
import fastifyCookie from 'fastify-cookie';
import fastifyJwt from 'fastify-jwt'
import {User,FindUser,SignIn} from './User'
import path from 'path'
import {AddFile,ReadFile,SaveFile,ReadFileAsync} from './ItemsApi'


import { GetTask,AddTask,GetFile,onRegister,onAuthor,DeleteTask,putTask,VerifeJWT } from "./ServerAPI";

interface IRequestError extends Error {

    CreateReply(reply:FastifyReply):FastifyReply;
}

class BadRequest implements IRequestError
{
    name: string;
    message: string;

    constructor(name:string,message:string)
    {
        this.name=name;
        this.message=message;
    }

    public CreateReply(reply:FastifyReply):FastifyReply
    {
        reply.statusCode=400;
        return reply; 
    }

}

class expiredJWT implements IRequestError
{
    name: string;
    message: string;

    constructor(name:string,message:string)
    {
        this.name=name;
        this.message=message;
    }

    public CreateReply(reply:FastifyReply):FastifyReply
    {
        reply.statusCode=401;
        return reply; 
    }
} 


interface IReqBody
{
    TaskName:string;
    DateTime:string;
    Status:string;
}

class IJSONItem
{
    id:number;
    body:IReqBody;

    constructor(id:number,body:IReqBody)
    {
        this.id=id;
        this.body=body;
    }
}

class ReqBody
{
    TaskName:string;
    DateTime:string;
    Status:string;
    file:any;
    
    constructor(InputData:IReqBody,file:string)
    {

        if(InputData.TaskName)
        this.TaskName=InputData.TaskName;
        else
        {   
            console.log('Bad Request');
            throw new BadRequest('','');
        }

        if(InputData.DateTime)
        this.DateTime=InputData.DateTime;
        else
        {   
            console.log('Bad Request');
            throw new BadRequest('','');
        }

        if(InputData.Status)
        this.Status=InputData.Status;  
        else
        {   
            console.log('Bad Request');
            throw new BadRequest('','');
        }
        if(file)
            this.file=file;
        else
            this.file='';
        if(!file)
            console.log(' fff')
    }
   
}

const port=3001;
const method = ['POST', 'PUT', 'DELETE','OPTIONS']

const server = fastify();

server.register(fastifyCors,{
    credentials:true,
    methods:method,
    origin:(origin,cb)=>{
        cb(null,true);
    },
    allowedHeaders:'Origin, X-Requested-With, Content-Type, Accept',
});

server.register(fastifyIO,{'cors':{
    credentials:true,
    methods:method,
    origin:(origin,cb)=>{
        //console.log(origin);
        cb(null,true);
    },
    allowedHeaders:'Origin, X-Requested-With, Content-Type, Accept,cooke',
    
    
    },
    cookie:true,
});

server.register(fastifyCookie);
const key='dsadwqtgrfajYHGNUJIH99521jiohu';
server.register((fastifyJwt),{secret: key});

server.register(multer.contentParser);


server.route({
    method:'POST',
    url:'/Author',
    handler:async (request:FastifyRequest,reply:FastifyReply)=>{


        console.log('Author');
        let body:any= await request.body;
        console.log(body);


        if(!(body?.Password&&body?.Login)) 
        {
            reply.code(400).send('Bad request');
            return;
        }
        let user = new User(body.Password,body.Login);
        let json = JSON.parse(ReadFile(path.join(__dirname,'Users.json')));
        let Users:User[]=json;

        let index = FindUser(Users,user);

        if(index==-1)
        {
            reply.code(404).send();
            return;
        }

        let usr:User=Users[index];
   
        try
        {
            SignIn(usr);
        }
        catch(e)
        {
            console.log(e);
        }
        try
        {
        console.log(usr.JWToken);
        reply.setCookie("JWToken",usr.JWToken,{maxAge:60*60,httpOnly:true});
        }
        catch(e)
        {
            console.log(e);
        }

        reply.code(200).send();
        SaveFile(path.join(__dirname,'Users.json'),JSON.stringify(Users));
    }
    }
)

server.route({
    method:'POST',
    url:'/Registrate',
    handler:async (request:FastifyRequest,reply:FastifyReply)=>{

        console.log('reg');
        let body:any= await request.body;

        console.log(body);
        if(!(body?.Password&&body?.Login)) 
        {
            reply.code(400).send('Bad request');
            return;
        }

        let Password:any = body.Password;
        let Login:any = body.Login;

        let user = new User(Password,Login);
        let json = JSON.parse(ReadFile(path.join(__dirname,'Users.json')));

        if(!user.IsUniqUser(json))
        {
            reply.code(401).send('')
            return;
        }
        json.push(user);
        SaveFile(path.join(__dirname,'Users.json'),JSON.stringify(json));
        reply.code(200).send();
    }
})

server.ready().then(()=>{
    console.log('server start');

    server.io.on('connection',onConnection);
})

const onConnection = async (client:any)=>{

    client.on('connection',()=>{
        console.log(client);
    })
    

    client.on('Author',(param:any)=>{
        console.log('Author');
        //client.headers['Set-Cookie']='1';
        //onAuthor(param)
        console.log("client Cookie:",client.handshake.headers.cooke);
        client.handshake.headers.cooke=1;
        console.log(client.handshake)
        client.emit('Author',2);
    });

    client.prependAny((eventName:any, ...args:any) => {
        console.log(eventName);
        if((eventName!='Register')&&(eventName!='Author'))
        {
            VerifeJWT(args);
        }
      });

    client.on('AddTask',AddTask);

    client.on('PUT',putTask)
  
    client.on('DeleteTask',DeleteTask);
    client.on('GetTask',async ()=>{
        GetTask(client,(arg:any)=>{console.log(arg);client.emit('GetTask',arg);});
        
    });

    client.on('GetFile',async (arg:any)=>{
        console.log(arg);
        let data =await GetFile(arg);
        client.emit('GetFile',data);
    });

    client.on('disconnect', () => {
        console.log('User disconnected');
    });

}

const start = async () => {
    try {
        server.listen(port);
    } catch (err) {
        server.log.error(err)
        process.exit(1)
    }
  }

start();

export{ server};