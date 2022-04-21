import fs from 'fs'
import path from 'path'



export function ReadFile(Path:string):string
{
    let data:string='';
    try
    {
        data = fs.readFileSync(path.resolve(__dirname,Path),'utf8');
    }
    catch(e)
    {
        console.log(e);
    }
    return data;
}

export function SaveFile(Path:string,Data:any)
{
    try{
        fs.writeFile(path.resolve(__dirname,Path),JSON.stringify(Data),(err)=>{
            if(err)
                console.log(err);
        });
    }catch(e){
        console.log(e);

    }
}


