import fs from 'fs'
import path from 'path'

export function ReadFile(Path:string):string
{
    let data:string='';
    try
    {
        data = fs.readFileSync(Path,'utf8');
    }
    catch(e)
    {
        console.log(e);
    }
    //console.log(data);
    return data;
}

export function ReadFileAsync(Path:string,cb:any){

    fs.readFile(Path,'binary',(err,data)=>{cb(data)})

}

export function SaveFile(Path:string,Data:any)
{
    try{
        //console.log(JSON.stringify(Data));
        fs.writeFile(Path,(Data),(err)=>{
            if(err)
                console.log(err);
        });
    }catch(e){
        console.log(e);

    }
}

export function AddFile(Path:string,data:any)
{
    try{
        console.log('AddFile');
        fs.open(Path,'w',(err,fil)=>{
            if(err)console.log(err);
            fs.write(fil,data,0,data.length,null,(err)=>{
                if(err)console.log(err);
                fs.close(fil)})
        });
        


    }catch(e){
        console.log(e);
    }
}


