
const express = require("express");
const fs = require("fs");
const app = express();
const logProcessErrors = require("log-process-errors").default;

logProcessErrors();
app.use(express.json());
app.use(express.static("public"));

const DB_FILE = "db.json";

const readDB = () => JSON.parse(fs.readFileSync(DB_FILE));
const writeDB = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

app.get("/products", (req,res)=>res.json(readDB()));

app.get("/products/:barcode",(req,res)=>{
  const data = readDB();
  res.json(data.find(p=>p.barcode===req.params.barcode)||null);
});

app.post("/products",(req,res)=>{
  const data = readDB();
  data.push(req.body);
  writeDB(data);
  res.json({success:true});
});

app.put("/products/:barcode",(req,res)=>{
  const data = readDB();
  const i = data.findIndex(p=>p.barcode===req.params.barcode);

  if(i !== -1){
    data[i].nama = req.body.nama;
    data[i].harga = req.body.harga;
    data[i].image = req.body.image;
  }

  writeDB(data);
  res.json({success:true});
});

app.delete("/products/:barcode",(req,res)=>{
  let data = readDB();
  data = data.filter(p=>p.barcode!==req.params.barcode);
  writeDB(data);
  res.json({success:true});
});

app.listen(3000);