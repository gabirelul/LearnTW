const express = require("express");
const fs = require('fs'); //file system - ex: erifica caile fisierelor (fisier ca obiect)
const path = require('path'); // lucreaza cu caile fisierelor, nu poate accesa fisierul (cale)
// const sharp=require('sharp');
// const sass=require('sass');
// const ejs=require('ejs');

obGlobal = {
    obErori: null
}

app = express();

console.log("Folder proiect", __dirname);
// folderul in care se gaseste fisierul (radacina)
console.log("Cale fisier", __filename);
// dirname + numele fisierului pe care il rulez (index.js)
console.log("Director de lucru", process.cwd());
// folderul de unde rulez

app.set("view engine", "ejs");


// 20.
vect_foldere = ["temp", "temp1"]
for (let folder of vect_foldere) {
    let caleFolder = path.join(__dirname, folder);
    if (!fs.existsSync(caleFolder))
        fs.mkdirSync(caleFolder);
}


app.use("/resurse", express.static(__dirname + "/resurse"));

app.use(express.static(__dirname));

// app.get("/", function (req, res) {
//     res.sendFile(__dirname + "/index.html")
// })

// 9. 16. req.ip
app.get(["/", "/home", "/index"], function (req, res) {
    res.render("pagini/index", { ip: req.ip });
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

// 18.
app.get("/favicon.ico", function (req, res) {
    res.sendFile(path.join(__dirname, "resurse/favicon/favicon.ico"));
})

// 19.
app.get("/*.ejs", function (req, res) {
    afisareEroare(res, 400);
});

// 17.
app.get(new RegExp("^\/resurse\/[A-Za-z0-9\/]*\/$"), function (req, res) {
    afisareEroare(res, 403);
});

app.get("/*", function (req, res) {
    console.log(req.url)
    //res.send("whatever");
    try {
        res.render("pagini" + req.url, function (err, rezHtml) {
            // console.log(rezHtml);
            console.log("Eroare:" + err)
            // res.send(rezHtml + "");
            if (err) {
                if (err.message.startsWith("Failed to lookup view")) {
                    afisareEroare(res, 404);
                    console.log("Nu a gasit pagina: ", req.url);
                }
            } else {
                res.send(rezHtml + "");
            }
        });
    }
    catch (err1) {
        if (err1.message.startsWith("Cannot find module")) {
            afisareEroare(res, 404);
            console.log("Nu a gasit resursa: ", req.url);
        } else {
            afisareEroare(res)
        }
    }
})

// 13.
function initErori() {
    var continut = fs.readFileSync(path.join(__dirname, "resurse/json/erori.json")).toString("utf-8");
    console.log(continut);

    obGlobal.obErori = JSON.parse(continut);
    for (let eroare of obGlobal.obErori.info_erori) {
        eroare.imagine = path.join(obGlobal.obErori.cale_baza, eroare.imagine)
    }
    console.log(obGlobal.obErori);

}
initErori()

// 14.
function afisareEroare(res, _identificator, _titlu, _text, _imagine) {
    let eroare = obGlobal.obErori.info_erori.find(
        function (elem) {
            return elem.identificator == _identificator
        }
    )
    if (!eroare) {
        let eroare_default = obGlobal.obErori.eroare_default
        res.render("pagini/eroare", {
            titlu: _titlu || eroare_default.titlu,
            text: _text || eroare_default.text,
            imagine: _imagine || eroare_default.imagine
        })

    } else {
        if (eroare.status)
            res.status(eroare.identificator)
        res.render("pagini/eroare", {
            titlu: _titlu || eroare.titlu,
            text: _text || eroare.text,
            imagine: _imagine || eroare.imagine
        })
    }
    // codul pentru succes = 200 (by default)
}

// find = gaseste primul elem pentru care funtia returneaza true


app.listen(8080);
console.log("--------- Serverul a pornit ---------");
