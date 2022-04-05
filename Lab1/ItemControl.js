const fs = require('fs');  
const { request } = require('http');
const path = require('path')
const DataPath = 'Data/data.json';

const util = require('util')
const { pipeline } = require('stream');
const pump = util.promisify(pipeline)

const fastify = require('fastify')({ logger: true })
fastify.register(require('fastify-multipart'))

function readFile(filePath){
    try{
       let Data = fs.readFileSync(path.resolve(__dirname,filePath));
        //console.log(Data);
        return Data;
    }catch(e){
        
        console.log(e);
    }

}



function SaveNewUpdate(filePath,data)
{
    try{
        console.log(JSON.stringify(data));
        fs.writeFile(path.resolve(__dirname,filePath),JSON.stringify(data),(err)=>{
            if(err)
                console.log(err);
        });
    }catch(e){
        console.log(e);

    }
}


const GetAllItems = async (Request,reply)=>{
    reply.body = readFile(DataPath);
    return reply;
}

const GetItemWithId= async (Request,Reply)=>{
    let id = Number(Request.params.id);

}

const AddItem = async (Request,Reply)=>{

    let data = readFile(DataPath);
    let json = JSON.parse(data);
    let max=0;
    try{
        json.forEach(element => {
            if(element.id>max)
                max=element.id;
        });
        max++;
    }catch(e){
        console.log(e);
    }

    let buffer = await Request.file();
    
    let body = new Object();
    if(buffer.fields.TaskName.value==='undefined')
        body.TaskName="";
    else
        body.TaskName = buffer.fields.TaskName.value;

    if(buffer.fields.DateTime.value==='undefined')
        body.DateTime="";
    else
        body.DateTime = buffer.fields.DateTime.value;
    

    try{
    if(buffer.fields['Status']==void (0) )
        body.Status="";
    else
        body.Status = buffer.fields['Status'].value;
        
    }
    catch(e){
        body.Status="";
    }

    if (buffer.filename!='')
    {
        body.file=buffer.filename;
        await pump(buffer.file, fs.createWriteStream(path.join(__dirname,'Data',buffer.filename)));
    }
    else
        body.file='';
    
    let newItem={
        id : max,
        body:body,
    }
    json.push(newItem);
    SaveNewUpdate(DataPath,json)
    
    return newItem;
}

const ReadAllItem = async()=>{
    return JSON.parse(readFile(DataPath));

}


module.exports = {
    GetAllItems,
    GetItemWithId,
    AddItem,
    ReadAllItem,
}