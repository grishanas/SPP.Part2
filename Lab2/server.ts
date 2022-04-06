import fastify, { FastifyReply, FastifyRequest } from 'fastify'; 
import multer from 'fastify-multer';
import fs, { mkdir, unlink } from 'fs'
import path from 'path'
import lobash from 'lodash'
import _ from 'lodash';
import * as ItemApi from './ItemApi'
import { nextTick } from 'process';

const DataLocation = path.join(__dirname,'Data');

console.log(DataLocation);

const server = fastify();
server.register(multer.contentParser);
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


server.addHook('onSend', (request, reply, payload, done) => {
    reply.header("Access-Control-Allow-Origin", "*");
    reply.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE,OPTION")
    reply.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Origin");
    done()
})

async function PostAddItem(request:any,reply:FastifyReply)
{   
    try
    {
        let tmp= await request.body;
        let file= await request.file;
        console.log(tmp,file);
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
        console.log(id);
        let data = ItemApi.ReadFile(path.join(DataLocation,'Data.json'));
        let json = JSON.parse(data);
        let Item:any;
        json.forEach((element: { id: number; },index:number) => {
            id.id.forEach((e:any)=>{
                console.log(e);
            if(element.id==(e))
            {
                try{
                Item=element;
                console.log(index);
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

async function Opt(request:any,reply:FastifyReply)
{
    reply.code(204).send();
}




server.route(
    {
        method:'POST',
        url:'/',
        handler: PostAddItem,
        preHandler:multer({ storage:post }).single('file')
        
    },
)

server.route({
    method:'OPTIONS',
    url:'/',
    handler:Opt,
})

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



const start = async () => {
    try {
        await server.listen(3001)
    } catch (err) {
        server.log.error(err)
        process.exit(1)
    }
  }

start();