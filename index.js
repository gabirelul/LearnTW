const express = require("express");
// const fs = require('fs');
// const path=require('path');
// const sharp=require('sharp');
// const sass=require('sass');
// const ejs=require('ejs');

app = express();

console.log("Folder proiect", __dirname);
// folderul in care se gaseste fisierul (radacina)
console.log("Cale fisier", __filename);
// dirname + numele fisierului pe care il rulez (index.js)
console.log("Director de lucru", process.cwd());
// folderul de unde rulez

app.set("view engine", "ejs");

app.use("/resurse", express.static(__dirname + "/resurse"));

app.use(express.static(__dirname));

// app.get("/", function (req, res) {
//     res.sendFile(__dirname + "/index.html")
// })

app.get(["/", "/home", "/index"], function (req, res) {
    res.render("pagini/index");
});

// trimiterea unui mesaj fix
app.get("/cerere", function (req, res) {
    res.send("<b>Hello</b> <span style='color: green'>world!</span>");
})

//trimiterea unui mesaj dinamic
app.get("/data", function (req, res, next) {
    res.write("Data: "); //write nu opreste trimiterea raspunsului
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

app.get("/*", function (req, res) {
    console.log(req.url)
    //res.send("whatever");
    res.render("pagini" + req.url, function (err, rezHtml) {
        console.log(rezHtml);
        console.log("Eroare:" + err)
        res.send(rezHtml + "");
    });
})


app.listen(8080);
console.log("Serverul a pornit");
