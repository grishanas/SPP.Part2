import { FastifyRequest } from 'fastify';
import path from 'path'
import {AddFile,ReadFile,SaveFile,ReadFileAsync} from './ItemsApi'
import mime from 'mime';
import fs from 'fs'

const DataLocation = path.join(__dirname,'Data');

const GetTask = async (s: any,cb:any)=>
{
    console.log('GetTask');
    let data=(ReadFileAsync(path.join(DataLocation,'Data.json'),cb));
    return data;
}

const AddTask= async(request:any,file: any,cb: any)=>
{
    console.log('AddTask');
    let data = JSON.parse(ReadFile(path.join(DataLocation,'Data.json')));
    let Id = data[data.length-1]?.id??0;
    Id++;
    let item = {
        id:Id ?? '',
        body:{
        TaskName:request?.TaskName ?? '',
        DateTime:request?.DateTime??null,
        Status:request?.Status??'',
        file:request?.file??'',
        }
    }
    console.log('file:',file);
    console.log('req:',request)
    data.push(item);

    if(request?.file)
    {
        AddFile(path.join(DataLocation,request?.file),request.fileBuffer);
    }

    SaveFile(path.join(DataLocation,'Data.json'),JSON.stringify(data));

}

const GetFile = async (s:any)=>{
    console.log('GetFile');
    console.log(path.join(DataLocation,s));
    let data = ReadFile(path.join(DataLocation,s));

    let answ = {
        mime:mime.getType(path.join(DataLocation,s)),
        fileName:s,
        data:data
    }
    return answ;
    
}

const DeleteTask= async (request:any,cb:any)=>{


    try{
    let arr=request;
    let data = ReadFile(path.join(DataLocation,'Data.json'));
    let json = JSON.parse(data);
    console.log(json);
    let Item:any;
    json.forEach((element: { id: number; },index:number) => {
        console.log(element);
        request.forEach((e:any)=>{
            if(element.id==(e.id))
            {
                
                try{
                Item=element;
                console.log(index);
                fs.unlink(Item.body.path,(err)=>{console.log(err)});
                json.splice(index,1);
                }
                catch(e)
                {
                    console.log('21',e);
                }
            }
        });
    });
    SaveFile(path.join(DataLocation,'Data.json'),JSON.stringify(json));
    }
    catch(e)
    {
        console.log(e);
    }
    
    
}

const putTask= async(param:any)=>
{
    console.log(param);
    let data = ReadFile(path.join(DataLocation,'Data.json'));
    let json = JSON.parse(data);
    let Item:any;
    json.forEach((element: { id: number; }) => {
        if(element.id==Number(param.id))
        {
            Item=element;
        }
    });
    switch(param.method){
        case ('TaskName'):
            Item.body.TaskName=param.value;
            break;
        case ('Status'):
            Item.body.DateTime=param.value;    
            break;
        case ('DateTime'):
            Item.body.Status=param.value;    
            break;
        case ('file'):
            fs.unlink(path.join(DataLocation,Item.body.file),(err)=>{console.log(err)});
            Item.body.file=param.value.fileName;
            AddFile(path.join(DataLocation,param.fileName),param.value.buffer);
        break;
    }
    console.log(Item);
    SaveFile(path.join(DataLocation,'Data.json'),JSON.stringify(json));

}


const onRegister = async(param:any)=>{

}

const onAuthor = async(param:any)=>{
    return true;
}

const VerifeJWT = (args:any):boolean=>
{


    return true;
}

export {GetTask,AddTask,GetFile,onRegister,onAuthor,DeleteTask,putTask,VerifeJWT}









