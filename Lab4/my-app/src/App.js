import './App.css';
import React from 'react';
import { FormControl, InputLabel, Menu, MenuItem, Table, TableHead, TextField,TableBody, TableCell, Checkbox, Button, Link } from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { DataGrid } from '@mui/x-data-grid';
import DesktopDatePicker from '@mui/lab/DesktopDatePicker';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import io from 'socket.io-client'
import SelectInput from '@mui/material/Select/SelectInput';
import { fontSize } from '@mui/system';

const baseURL = 'http://localhost:3001';
const port = 3001

function App() {

  const GetTask = async(items)=>{        
    let ro=new Array;
    console.log("GetTask");
    console.log(items);
    let Items = JSON.parse(items);
    Items.forEach((elem)=>{
      ro.push(
        {
          id:elem.id,
          TaskName:elem.body?.TaskName,
          Status:elem.body?.Status,
          DateTime:(new Date(Date.parse(elem.body?.DateTime))).toLocaleDateString(),
          file:elem.body?.file,
        }
      )
    })
  setRows([...ro])}

  const [reRender,SetRerender]=React.useState();

  let socket = io(baseURL,{
    reconnection: false,
    autoConnect: false,
    withCredentials:true,
      transports: ['polling', 'websocket'],
      transportOptions: {
        polling: {
          extraHeaders: {
            'cooke': 'will be used'
          }
        }
      }
    }
  )

  async function SendRequst (e){
    
    e.preventDefault();
    if(MethodType==="POST")
    {
      
      let data={};
      data.TaskName=TaskName?.target?.value ?? null;
      data.Status = Status?.target?.value ?? '';
      data.DateTime=DateTime?.toString() ?? '';
      data.file=file?.target?.files[0].name??null;
      data.fileBuffer=file?.target?.files[0];
      socket.emit('AddTask',data);


    }
    if(MethodType==="PUT")
    {
      let data={};
      data.id=ID?.target?.value;
      let method;
      switch(ChooseField)
      {
        case 'TaskName':
          method=TaskName?.target?.value;
          break;
        case 'Status':
          method=Status?.target?.value;
          break;
        case 'DateTime':
          method=DateTime?.toString()??'';
          break;
        case 'file':
          method={
            buffer:file?.target?.files[0]??null,
            fileName:file?.target?.files[0].name??null,
          }
          break;

      }
      data.method=ChooseField;
      data.value=method;

      console.log(data); 
      socket.emit('PUT',data);
      
    }
    if(MethodType==="DELETE")
    {
      
      console.log("Delete");
      let data=selectionModel.map((elem)=>{
        return {'id':elem};
      })

      socket.emit('DeleteTask',data);
      
    }
    socket.emit('GetTask');
  }

  let currentFileData;

  const GetFile= async (data)=>{
    console.log('send GetFile');
    console.log(data);
    let file= new File([...data.data],data.fileName,{type:data.mime});
    let url = window.URL.createObjectURL(file);
    let link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', data.fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }


  socket.on('GetFile',GetFile);
  socket.on('GetTask',GetTask);
  socket.on('Author',(arg)=>{
    let d = socket;
    console.log(d);

  })

  const [MethodType, setMethodType] = React.useState('');
  const [TaskName,ChangeName] = React.useState('');
  const [Status,ChangeStatus] = React.useState('');
  const [DateTime,ChangeDate] = React.useState(Date);
  const [file,setfile]= React.useState();
  const n=0;
  const [rows,setRows]=React.useState('');

    React.useEffect(()=>{
    (
      ()=>{
      socket.connect();
      socket.emit('GetTask');
      
    })();},[]);

    



  const columns=[
  {headerName:'id',field:'id',wodth:200,
  renderCell:(
    (param)=>{return param.row.id.toString()})
  },
  {field:'TaskName',headerName:'TaskName',width:400},
  {field:'DateTime',headerName:'DataTime',width:400},
  {field:'Status',headerName:'Status',width:400},
  {field:'file',headerName:'file',width:400,renderCell:((param)=>{return <Button onClick={(elem)=>{socket.emit('GetFile',(param.row.file))}}>{param.row.file.split("\\").pop()}</Button>})}

]
 
const [ID,setID]=React.useState('');
const [selectionModel, setSelectionModel] = React.useState('');
const [ChooseField,setChooseField] = React.useState('');

const [Email,SetEmail] = React.useState('');
const [Password,SetPassword] = React.useState('');


async function Registrate()
{
  let data= new Object;
  data.Password=Password?.target?.value??'';
  data.Login=Email?.target?.value??'0';
  let response = await fetch('http://localhost:3001/Registrate',{
    method:'POST',
    headers: {'Content-Type': 'application/json'},
    body:JSON.stringify(data),
  });
  console.log(response);

}

async function Author()
{
  console.log(baseURL+'/Author');

  let data= new Object;
  data.Password=Password?.target?.value??'';
  data.Login=Email?.target?.value??'0';
  let response = await fetch('http://localhost:3001/Author',{
    method:'POST',
    headers: {'Content-Type': 'application/json'},
    body:JSON.stringify(data),
  });
  console.log(response);
  
}

const [pageSize, setPageSize] = React.useState(5);

  return (
    <div className="App">
      <header className="App-header">
      </header>
     <div>
       <FormControl>
          <InputLabel id="Method-Avalible">
            Avalibel method
          </InputLabel>
          <Select sx={{minWidth:240}}
            labelId='Method-Avalible'
            id='Transfer-Method'
            value={MethodType}
            onChange={e=>  setMethodType(e.target.value)}
          >
            <MenuItem value="POST">POST</MenuItem>
            <MenuItem value="PUT">PUT</MenuItem>
            <MenuItem value="DELETE">DELETE</MenuItem>
          </Select>

          {(MethodType==='PUT')? 
          //выбор поля
          <div>
          <Select sx={{minWidth:240}}
            labelId='Choose-field'
            id='Choose-field-id'
            value={ChooseField}
            onChange={(e)=>{setChooseField(e.target.value)}}
          >
            <MenuItem value="TaskName">TaskName</MenuItem>
            <MenuItem value="DateTime">DateTime</MenuItem>
            <MenuItem value="Status">Status</MenuItem>
            <MenuItem value="file">file</MenuItem>
          </Select>
          <TextField labelId='Choose-ID' onChange={setID}></TextField>
          { 
          
          (ChooseField==="file")?
          <input type='file' onChange={setfile}></input>: 
          ((ChooseField!=='DateTime')?         
          (<TextField
            label={ChooseField}
            id={ChooseField}
            onChange={ChangeName}
          >
          </TextField>)
          :
          <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DesktopDatePicker
               label="Date desktop"
               inputFormat="MM/dd/yyyy"
               value={DateTime}
               onChange={ChangeDate}
               renderInput={(params) => <TextField {...params} />}
           />
           </LocalizationProvider>
          
          )}
          </div>
          :null}
          {(MethodType==='POST')?
          <div>
          <TextField
            label='Name'
            id='TaskName'
            onChange={ChangeName}
          >
          </TextField>
          <TextField
            label='Status'
            id='Status'
            onChange={ChangeStatus}
          >
          </TextField>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DesktopDatePicker
               label="Date desktop"
               inputFormat="MM/dd/yyyy"
               value={DateTime}
               onChange={ChangeDate}
               renderInput={(params) => <TextField {...params} />}
           />
           </LocalizationProvider>
           <input type='file' onChange={setfile}></input>:
          </div>
          :null}

       </FormControl>
       <Button
       onClick={e=>{SendRequst(e)}}
       >

         Press
       </Button>


     </div>


     <div style={{ height: 400, width: '100%' }}>
     { (MethodType==="DELETE")?  
        <DataGrid
          autoHeight={true}
          rows={rows}
          pageSize={pageSize}
          columns={columns}
          disableSelectionOnClick
          checkboxSelection
          onSelectionModelChange={(selectionModel)=>{setSelectionModel(selectionModel)}}
          selectionModel={selectionModel}
        /> 
        :
        <DataGrid
        pageSize={pageSize}
        autoHeight={true}
        rows={rows}
        columns={columns}
        disableSelectionOnClick
        />}
      
      
     
      
      </div>
      {(MethodType==="DELETE")? <Button onClick={(e)=>{SendRequst(e)}}>Удалить объекты</Button>:null}
        
      <div sx={{ m: 2 }}>
        <TextField
          id="Email-id"
          label='Email'
          type='email'
          onChange={SetEmail}
        >

        </TextField>
        <TextField
          id="Passowrd-id"
          label="Password"
          type="password"
          onChange={SetPassword}
        >
          
        </TextField>
        <Button
          onClick={()=>{Registrate()}}
        >
          Зарегистрироваться
        </Button>
        <Button
          onClick={()=>{Author()}}
        >
            Войти
        </Button>
          </div>
      
        </div>
  );
}




export default {
  App,
}
