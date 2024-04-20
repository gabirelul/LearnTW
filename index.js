const express = require("express");
const fs = require('fs');
// const path=require('path');
// const sharp=require('sharp');
// const sass=require('sass');
// const ejs=require('ejs');


app = express();
console.log("Folder proiect", __dirname);
console.log("Cale fisier", __filename);
console.log("Director de lucru", process.cwd());

app.set("view engine", "ejs");

app.use("/resurse", express.static(__dirname + "/resurse"));



app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html")
})

// trimiterea unui mesaj fix
app.get("/cerere", function (req, res) {
    res.send("<b>Hello</b> <span style='color:red'>world!</span>");
})

//trimiterea unui mesaj dinamic

app.get("/data", function (req, res, next) {
    res.write("Data: ");
    next();
});
app.get("/data", function (req, res) {
    res.write("" + new Date());
    res.end();

});

app.get("/suma/:a/:b", function (req, res) {
    var suma = parseInt(req.params.a) + parseInt(req.params.b)
    res.send("" + suma);

});

app.listen(8080);
console.log("Serverul a pornit");
