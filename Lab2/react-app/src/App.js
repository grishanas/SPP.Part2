import './App.css';
import * as React from 'react';
import { FormControl, InputLabel, Menu, MenuItem, Table, TableHead, TextField,TableBody, TableCell, Checkbox, Button, Link } from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import axios from 'axios'
import { DataGrid } from '@mui/x-data-grid';
import DesktopDatePicker from '@mui/lab/DesktopDatePicker';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';

const baseURL = 'http://localhost:3001'

function App() {

  const [reRender,SetRerender]=React.useState();

  axios.defaults.withCredentials = true;
  const Requst = axios.create({
    baseURL: baseURL,
    headers:{ 'Content-Type': 'multipart/form-data' },
  })


  async function SendRequst (e){
    
    e.preventDefault();
    if(MethodType==="POST")
    {

      let formData= new FormData();
      formData.append('TaskName',TaskName?.target?.value ?? null);
      formData.append('Status',Status?.target?.value ?? '');
      console.log(DateTime.toString());
      formData.append('DateTime',DateTime?.toString() ?? '');
      formData.append('file',file?.target?.files[0]??null)
    
      let answ =await Requst.post('/',formData);
      if(answ.status===200)
        GetData()

    }
    if(MethodType==="PUT")
    {
      let formData = new FormData();
      formData.append('id',ID?.target?.value);
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
          method=file?.target?.files[0]??null;
          break;

      }

      console.log(file);
      formData.append(ChooseField,method);
      Requst.put('/',formData);
      GetData();
      
    }
    if(MethodType==="DELETE")
    {
      
      let req = axios.create({
        baseURL: 'http://localhost:3001',
        headers: {"Content-Type": "application/json"},
      });
      console.log("Delete");
      console.log(selectionModel);
      req.delete('/',{ data:{'id':selectionModel}}).then((e)=>{console.log(e)});
      GetData();
      
      
    }
  }


  const [MethodType, setMethodType] = React.useState('');
  const [TaskName,ChangeName] = React.useState('');
  const [Status,ChangeStatus] = React.useState('');
  const [DateTime,ChangeDate] = React.useState(Date);
  const [file,setfile]= React.useState();
  const n=0;
  const [rows,setRows]=React.useState('');

  async function GetData()
  {
    let ro=[];
    const Items = await (Requst.get('/'));
    ro = Items.data.map((elem)=>(
    {
    id:elem.id,
    TaskName:elem.body.TaskName,
    Status:elem.body.Status,
    DateTime:(new Date(Date.parse(elem.body.DateTime))).toLocaleDateString(),
    file:elem.body.file,
    }));
    setRows([...ro])
  }

    React.useEffect(()=>{
    (async()=>{
    GetData();
    })();},[]);



  const columns=[
  {headerName:'id',field:'id',wodth:200,
  renderCell:(
    (param)=>{return param.row.id.toString()})
  },
  {field:'TaskName',headerName:'TaskName',width:400},
  {field:'DateTime',headerName:'DataTime',width:400},
  {field:'Status',headerName:'Status',width:400},
  {field:'file',headerName:'file',width:400,renderCell:((param)=>{return <a href={baseURL+'/'+param.row.file} download>{param.row.file.split("\\").pop()}</a>})
}]

const [ID,setID]=React.useState('');
const [selectionModel, setSelectionModel] = React.useState('');
const [ChooseField,setChooseField] = React.useState('');

const [Email,SetEmail] = React.useState('');
const [Password,SetPassword] = React.useState('');


async function Registrate()
{
  let dat={"Login":Email?.target?.value??'','Password':Password?.target?.value??''}
  Requst.post('/Registrate',dat,{headers:{ 'Content-Type': 'application/json' }});

}

async function Author()
{
  let dat={"Login":Email?.target?.value??'','Password':Password?.target?.value??''};
  
  let data = await Requst.post('/Author',dat,{headers:{ 'Content-Type': 'application/json' }});
  console.log(data);
  
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
          //?????????? ????????
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
      {(MethodType==="DELETE")? <Button onClick={(e)=>{SendRequst(e)}}>?????????????? ??????????????</Button>:null}
        
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
          ????????????????????????????????????
        </Button>
        <Button
          onClick={()=>{Author()}}
        >
            ??????????
        </Button>
      </div>
      
    </div>
  );
}




export default {
  App,
}
