import fastify, { FastifyReply, FastifyRequest } from 'fastify'; 
import multer from 'fastify-multer';
import fs from 'fs'
import path from 'path'
import lobash from 'lodash'
import _ from 'lodash';
import * as ItemApi from './ItemApi'
import fastifyJwt from 'fastify-jwt';
import cookie, { fastifyCookie } from 'fastify-cookie'
import { User,FindUser,SignIn } from './User';
import fastifyCors from 'fastify-cors';
import cryptojs from 'crypto-js'


const DataLocation = path.join(__dirname,'Data');

console.log(DataLocation);

const server = fastify();

const method = ['POST', 'PUT', 'DELETE','OPTIONS']

server.register(fastifyCors,{
    credentials:true,
    methods:method,
    origin:(origin,cb)=>{
        console.log(origin);
        cb(null,true);
    }
    });


server.addHook('onSend', (request, reply, payload, done) => {
    done()
})



server.register(multer.contentParser);
server.register(fastifyCookie);
const key='dsadwqtgrfajYHGNUJIH99521jiohu';
server.register((fastifyJwt),{secret: key});
let upload = multer();

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



async function PostAddItem(request:any,reply:FastifyReply)
{   
    try
    {
        let tmp= await request.body;
        let file= await request.file;
        let Task = new ReqBody(<IReqBody>tmp,file.path);
        let data = ItemApi.ReadFile(path.join(DataLocation,'Data.json'));
        let json = JSON.parse(data);
        let id=1;
        json.forEach((element: { id: number; }) => {
            element.id=id++;
        });
        

        let Item = new IJSONItem(id,Task);
        json.push(Item);
        ItemApi.SaveFile(path.join(DataLocation,'Data.json'),json);
        
        reply.code(200).send('Addition was successful');
    }
    catch(err)
    {
        let error:IRequestError = err as IRequestError;
        if(error)
        {
            reply.code(400);
        }

        reply.send();
    }
    finally
    {
     
    }

}

async function GetAllItem(request:FastifyRequest,reply:FastifyReply){
    console.log('data')
    let Data = fs.createReadStream(path.join(DataLocation,'Data.json'));
    reply.header('Content-Type','application/octet-stream');
    reply.send(Data); 
    
}

server.get('/*',async (request:FastifyRequest,reply:FastifyReply)=>{
    console.log('GetFile');
    reply.send(fs.readFileSync(path.join(__dirname,'Data',<string>request.url.split("/").pop())));
}
)

async function PUT(request:any,reply:FastifyReply)
{
    try
    {
        let id:any = await request.body;
        console.log(id);
        let data = ItemApi.ReadFile(path.join(DataLocation,'Data.json'));
        let json = JSON.parse(data);
        let Item:any;
        json.forEach((element: { id: number; }) => {
            if(element.id==Number(id.id))
            {
                Item=element;
            }
        });
        if(!Item)
            reply.code(404).send('Task not found');
        console.log(2);
        if(id['TaskName'])
            Item.body.TaskName=id.TaskName;
        if(id['DateTime'])
            Item.body.DateTime=id.DateTime;
        if(id['Status'])
            Item.body.Status=id.Status;
        if(request.file)
            Item.body.file=request.file.path;

        
        console.log(Item);
        ItemApi.SaveFile(path.join(DataLocation,'Data.json'),json);
        reply.code(200).send('ok');
    }
    catch
    {
        reply.code(500).send('server errore');

    }
    

}


async function Delete(request:any,reply:FastifyReply) {

    console.log('Delete');
    try
    {

        let id:any = await request.body;
        if((id===undefined)||(id===null))
        {
            reply.code(404).send('id not found');
            return;
        }
        let data = ItemApi.ReadFile(path.join(DataLocation,'Data.json'));
        let json = JSON.parse(data);
        let Item:any;
        json.forEach((element: { id: number; },index:number) => {
            id.id.forEach((e:any)=>{
       
            if(element.id==(e))
            {
                try{
                Item=element;
                json.splice(index,1);
                }
                catch(e)
                {
                    console.log(e);
                }
            }
            })
        });
        if(!Item)
            reply.code(404).send('no task with this id');
        
        ItemApi.SaveFile(path.join(DataLocation,'Data.json'),json);
        fs.unlink(Item.body.path,(err)=>{console.log(err)});
        reply.code(200).send('ok');
    }
    catch
    {
        reply.send(500).send('server Errore')
    }
}

const post = multer.diskStorage({
    destination:function(req,file,callback){
        console.log('dest');
        callback(null,'./Dest/Data');
    },
    filename:(req,file,callback)=>{ 
        console.log('filename');
        console.log(file.originalname);
        callback(null,file.originalname);
    }

})

const put = multer.diskStorage({
    destination:function(req,file,callback){
        callback(null,'./Dest/Data');
    },
    filename:(req,file,callback)=>{ 
        callback(null,file.originalname);
    }
})

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


server.route(
    {
        method:'POST',
        url:'/',
        handler: PostAddItem,
        preHandler:multer({ storage:post }).single('file')
        
    },
)

/*server.route({
    method:'OPTIONS',
    url:'/*',
    handler:Opt,
})*/

server.route(
    {
        method:'GET',
        url:'/',
        handler:GetAllItem,
    },
);

server.route(
    {
        method:'PUT',
        url:'/',
        handler:PUT,
        preHandler:multer({storage:put}).single('file'),
    }
);

server.route(
    {
        method:'DELETE',
        url:'/',
        handler:Delete,
    }
)

server.route({
    method:'POST',
    url:'/Author',
    handler:async (request:FastifyRequest,reply:FastifyReply)=>{


        console.log('Author');
        let body:any= await request.body;
        //console.log(body);


        if(!(body?.Password&&body?.Login)) 
        {
            reply.code(400).send('Bad request');
            return;
        }
        let user = new User(body.Password,body.Login);
        let json = JSON.parse(ItemApi.ReadFile(path.join(__dirname,'Users.json')));
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
        //console.log(usr.JWToken);
        reply.setCookie("JWToken",usr.JWToken,{maxAge:60*60,httpOnly:true});
        }
        catch(e)
        {
            console.log(e);
        }

        reply.code(200).send();
        ItemApi.SaveFile(path.join(__dirname,'Users.json'),Users);
    }
    }
)

server.route({
    method:'POST',
    url:'/Registrate',
    handler:async (request:FastifyRequest,reply:FastifyReply)=>{

        console.log('reg');
        let body:any= await request.body;

       //console.log(body);
        if(!(body?.Password&&body?.Login)) 
        {
            reply.code(400).send('Bad request');
            return;
        }

        let Password:any = body.Password;
        let Login:any = body.Login;

        let user = new User(Password,Login);
        let json = JSON.parse(ItemApi.ReadFile(path.join(__dirname,'Users.json')));

        if(!user.IsUniqUser(json))
        {
            reply.code(401).send()
            return;
        }
        json.push(user);
        ItemApi.SaveFile(path.join(__dirname,'Users.json'),json);
        reply.code(200).send();
    }
})


function isVerifyJWT(jwToken:string):boolean
{

    if(jwToken==null)
        return false;
    try
    {
    let verify=server.jwt.verify(jwToken);
    console.log("Token:",verify);
    }
    catch(e)
    {
        console.log("token errore:",e);
        throw new expiredJWT("jwt Token",'jwt token has expired'); 
    }

    return true;
}


server.addHook('onRequest',(request:FastifyRequest,reply:FastifyReply,done)=>{

    let method= request.method;
    console.log("Request method:",method);
    try{
    if (method=='GET')
    {
        done();
        return;
    }
    if (method.indexOf(method) >=-1)
    {
        if((request.url !== '/Registrate')&&(request.url !== '/Author'))
        {
            console.log()
            if(request?.cookies?.JWToken??null)
            {
                try{
                if(!isVerifyJWT(request?.cookies?.JWToken))
                {
                    reply.code(401).send('incorected jwt token')
                    return;
                }
                else
                {

        
                    let token:any=server.jwt.verify(request?.cookies?.JWToken);
                    let Users = JSON.parse(ItemApi.ReadFile('Users.json'));
                    Users.forEach((e:any)=>{
                        console.log(e.Password);
                        console.log(cryptojs.SHA256(e.Password).toString());
                        if((cryptojs.SHA256(e.Password).toString()===token.Password)&&(cryptojs.SHA256(e.Login).toString()===token.Login))
                            console.log(true);
                            else
                            {
                            throw new expiredJWT('',"");
                            }
                    })

                }
                }
                catch(e)
                {
                    console.log(e);
                    if(e instanceof expiredJWT)
                    {
                        console.log('expiredJWT');
                        reply.setCookie("JWToken",'');
                        reply.code(401).send();
                        return;
                    }
                    

                }

            }
            else
            {
                console.log('Unauthorized');
                reply.code(401).send('Unauthorized');
                return;
            }
            
        }
        else
        {

        }
        done();
    }

    }
    catch(e)
    {
        console.log(e);
    }


})


const start = async () => {
    try {
        await server.listen(3001)
    } catch (err) {
        server.log.error(err)
        process.exit(1)
    }
  }

start();

export{ server};