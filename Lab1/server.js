const fastify = require('fastify')({ logger: true })
const path= require('path');
const ApiControl = require('../Lab1/ItemControl');
const Handlebars = require('handlebars');
const { Exception } = require('handlebars');
const fs = require('fs');  
const url = require('url');
const { request } = require('http');


const data = [];


fastify.register(require('fastify-formbody'))
fastify.register(require("fastify-multipart"))

fastify.register(require("point-of-view"), {
  engine: {
    handlebars: require("handlebars"),
  },
  root: path.join(__dirname,'/View'),
  includeViewExtension:true,
});

Handlebars.registerHelper('GetStatus',(json)=>{
  try{
  if(json['body']['Status']===undefined)
    throw new Exception();
    let type="";
  
    switch(json['body']['Status'])
    {
      case '1':
        {
      
          type="Выполнена"
          break;
        }
      case '2':
        {
          type="Отменено"
          break;
        }
      case '3':
        {
          type="Выполняется"
          break;
        }  
    }
    
  return new Handlebars.SafeString(type)
  }
  catch(e)
  {

  }
})

Handlebars.registerHelper('GetUrl',(json,option)=>{
  try{
    if(json['body']['file']=='')
      throw new Exception();
  return new Handlebars.SafeString("<a download href=\"Data/" + json["body"]["file"] +"\" >" + "скачать файл: "+json["body"]["file"]+"</a>") 
  }
  catch(e)
  {
    return new Handlebars.SafeString("<p> Файл не найден </p>");
  }
});

async function IndexGet (request, reply){

  let data = await ApiControl.ReadAllItem();
  let url_ = (url.parse(request.url,true));


  try{
    if(url_.query['Column']=='id')
      if(url_.query['Course']=='UP')
      {
        console.log('UP');
        data.sort(function (a,b) {
          return a['id']-b['id'];
        });
      } 
      else
      data.sort((a,b)=>{
        return b['id']-a['id'];
      });
      if(url_.query['Column']=='Status')
        if(url_.query['Course']=='UP')
        {
          data.sort((a,b)=>{
            return a['body']['Status']-b['body']['Status'];
          })
        }else{
          data.sort((a,b)=>
          {
            return b['body']['Status']-a['body']['Status'];
          })
        }
  }
  finally
  {

  reply.view('index', { tabel: (data)} );
  }

}

async function IndexPost(request,reply){
  await ApiControl.AddItem(request,reply);
  reply.redirect('/');
}

async function DeleteData(request,reply){
  console.log("new Delete");
}

const routers =[{
  method: 'POST',
  url:'/',
  handler: IndexPost,
  },
  {
    method:'GET',
    url:'/',
    handler: IndexGet,
  },
]


fastify.get('/*',async (request,reply)=>{
  reply.type('text/css');
  reply.send(fs.readFileSync(path.join(__dirname,request.url)));
})


fastify.get('/Data/*',async (request,reply)=>{
  reply.send(fs.readFileSync(path.join(__dirname,request.url)));
})


routers.forEach((route,index)=>{
  fastify.route(route);
})


const start = async () => {
  try {
    await fastify.listen(3001)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()