const express = require("express");
const fs = require('fs'); //file system - ex: erifica caile fisierelor (fisier ca obiect)
const path = require('path'); // lucreaza cu caile fisierelor, nu poate accesa fisierul (cale)
const sharp = require('sharp');
const sass = require('sass');
const moment = require('moment');
const ejs = require('ejs');

obGlobal = {
    obErori: null,
    obImagini: null,
    folderCss: path.join(__dirname, "resurse/css"),
    folderScss: path.join(__dirname, "resurse/scss"),
    folderBackup: path.join(__dirname, "backup")
}

// conectare baza de date
const Client = require('pg').Client;

var client = new Client({
    database: "cti_2024",
    user: "gabirelul",
    password: "alexgab",
    host: "localhost",
    port: 5432
});
client.connect();

// client.query("select * from masini", function(err, rez){
//     console.log(rez);
// })

app = express();

console.log("Folder proiect", __dirname);
// folderul in care se gaseste fisierul (radacina)
console.log("Cale fisier", __filename);
// dirname + numele fisierului pe care il rulez (index.js)
console.log("Director de lucru", process.cwd());
// folderul de unde rulez

app.set("view engine", "ejs");

app.use("/resurse", express.static(path.join(__dirname, "resurse")));
app.use("/node_modules", express.static(path.join(__dirname, "node_modules")));

app.use(express.static(__dirname));


app.use(function (req, res, next) {
    client.query("select * from unnest(enum_range(null::tipuri_masini))", function (err, rezOptiuni) {
        res.locals.optiuniMeniu = rezOptiuni.rows;
        next();
    });
});


// ---------------------------- PRODUSE ----------------------------

app.get("/produse", function (req, res) {
    // console.log(req.query)
    var conditieQuery = "";
    if (req.query.tip) {
        conditieQuery = ` where tip_produs='${req.query.tip}'`
    }
    client.query("select * from unnest(enum_range(null::categ_masini))", function (err, rezOptiuni) {

        client.query(`select * from masini ${conditieQuery}`, function (err, rez) {
            if (err) {
                console.log(err);
                afisareEroare(res, 2);
            }
            else {
                res.render("pagini/produse", { produse: rez.rows, optiuni: rezOptiuni.rows })
            }
        })
    });
})

// ----------- Produse similare

// app.get("/produs/:id", function (req, res) {
//     client.query(`select * from masini where id=${req.params.id}`, function (err, rez) {
//         if (err) {
//             console.log(err);
//             afisareEroare(res, 2);
//         }
//         else {
//             res.render("pagini/produs", { prod: rez.rows[0] })
//         }
//     })
// })


app.get("/produs/:id", function (req, res) {
    client.query(`select * from masini where id=${req.params.id}`, function (err, rez) {
        if (err) {
            console.log(err);
            afisareEroare(res, 2);
        } else {
            let produs = rez.rows[0];
            client.query(`select * from masini where id != ${req.params.id} and tip_produs='${produs.tip_produs}' limit 3`, function (err, rezSimilare) {
                if (err) {
                    console.log(err);
                    afisareEroare(res, 2);
                } else {
                    res.render("pagini/produs", { prod: produs, produse_similare: rezSimilare.rows });
                }
            });
        }
    });
});

// -------------------------------

// app.get(["/", "/home", "/index"], function (req, res) {
//     let oferte = JSON.parse(fs.readFileSync(path.join(__dirname, "resurse/json/oferte.json")));
//     let ofertaCurenta = oferte.oferte[0]; // Assuming the first element is the latest offer
//     res.render("pagini/index", { ip: req.ip, imagini: obGlobal.obImagini.imagini, oferta: ofertaCurenta });
// });

app.get(["/", "/home", "/index"], function (req, res) {
    let oferte = JSON.parse(fs.readFileSync(path.join(__dirname, "resurse/json/oferte.json")));
    let ofertaCurenta = oferte.oferte[0];
    res.render("pagini/index", { ip: req.ip, imagini: obGlobal.obImagini.imagini, oferta: ofertaCurenta });
});

const T = 0.5; //minute

// function generateNewOffer() {
//     const categoriesQuery = "select * from unnest(enum_range(null::categ_masini))";
//     client.query(categoriesQuery, (err, result) => {
//         if (err) {
//             console.error("Error fetching categories", err);
//             return;
//         }

//         let categories = result.rows.map(row => row.unnest);
//         let currentOffers = JSON.parse(fs.readFileSync(path.join(__dirname, "resurse/json/oferte.json"))).oferte;

//         let lastCategory = currentOffers.length > 0 ? currentOffers[0].categorie : null;
//         let availableCategories = categories.filter(cat => cat !== lastCategory);

//         if (availableCategories.length === 0) {
//             console.error("No available categories to choose from.");
//             return;
//         }

//         let newCategory = availableCategories[Math.floor(Math.random() * availableCategories.length)];
//         let newDiscount = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50][Math.floor(Math.random() * 10)];
//         let now = moment();

//         // Fetch the image URL for the selected category
//         client.query("SELECT * FROM masini WHERE categorie = $1 LIMIT 1", [newCategory], (err, res) => {
//             if (err) {
//                 console.error("Error fetching car details", err);
//                 return;
//             }

//             if (res.rows.length === 0) {
//                 console.error("No car found for the selected category.");
//                 return;
//             }

//             let car = res.rows[0];

//             let newOffer = {
//                 categorie: newCategory,
//                 "data-incepere": now.format("YYYY-MM-DD HH:mm:ss"),
//                 "data-finalizare": now.add(T, 'minutes').format("YYYY-MM-DD HH:mm:ss"),
//                 reducere: newDiscount,
//                 image_url: car.image_url // Ensure this column exists in your database
//             };

//             currentOffers.unshift(newOffer);

//             fs.writeFileSync(path.join(__dirname, "resurse/json/oferte.json"), JSON.stringify({ oferte: currentOffers }, null, 2));

//             console.log("New offer generated:", newOffer);
//         });
//     });
// }

function generateNewOffer() {
    const categoriesQuery = "select * from unnest(enum_range(null::categ_masini))";
    client.query(categoriesQuery, (err, result) => {
        if (err) {
            console.error("Error fetching categories", err);
            return;
        }

        let categories = result.rows.map(row => row.unnest);
        let currentOffers = JSON.parse(fs.readFileSync(path.join(__dirname, "resurse/json/oferte.json"))).oferte;

        // Get the last generated category from the offers list
        let lastCategory = currentOffers.length > 0 ? currentOffers[0].categorie : null;
        let availableCategories = categories.filter(cat => cat !== lastCategory);

        if (availableCategories.length === 0) {
            console.error("No available categories to choose from.");
            return;
        }

        let newCategory = availableCategories[Math.floor(Math.random() * availableCategories.length)];
        let newDiscount = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50][Math.floor(Math.random() * 10)];
        let now = moment();

        // Fetch the image URL for the selected category
        client.query("SELECT * FROM masini WHERE categorie = $1 LIMIT 1", [newCategory], (err, res) => {
            if (err) {
                console.error("Error fetching car details", err);
                return;
            }

            if (res.rows.length === 0) {
                console.error("No car found for the selected category.");
                return;
            }

            let car = res.rows[0];

            let newOffer = {
                categorie: newCategory,
                "data-incepere": now.format("YYYY-MM-DD HH:mm:ss"),
                "data-finalizare": now.add(T, 'minutes').format("YYYY-MM-DD HH:mm:ss"),
                reducere: newDiscount,
                image_url: car.image_url // Ensure this column exists in your database
            };

            currentOffers.unshift(newOffer);

            fs.writeFileSync(path.join(__dirname, "resurse/json/oferte.json"), JSON.stringify({ oferte: currentOffers }, null, 2));

            console.log("New offer generated:", newOffer);
        });
    });
}

setInterval(generateNewOffer, T * 60 * 1000);


// -------------------------------------------------------------------

// app.get("/", function (req, res) {
//     res.sendFile(__dirname + "/index.html")
// })

// 9. 16. req.ip
app.get(["/", "/home", "/index"], function (req, res) {
    res.render("pagini/index", { ip: req.ip, imagini: obGlobal.obImagini.imagini });
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

app.get("/galerie-animata", function (req, res) {
    client.query("SELECT * FROM masini", function (err, rez) {
        res.render("pagini/galerie-animata", { produse: rez.rows, imagini: obGlobal.obImagini.imagini });
    });
});

app.get("/galerie-statica", function (req, res) {
    client.query("SELECT * FROM masini", function (err, rez) {
        res.render("pagini/galerie-statica", { produse: rez.rows, imagini: obGlobal.obImagini.imagini });
    });
});

//  ---------------------- Oferte


// 19.
app.get("/*.ejs", function (req, res) {
    afisareEroare(res, 400);
});

// 20.
vect_foldere = ["temp", "temp1", "backup"]
for (let folder of vect_foldere) {
    let caleFolder = path.join(__dirname, folder);
    if (!fs.existsSync(caleFolder))
        fs.mkdirSync(caleFolder);
}

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
    // console.log(continut);

    obGlobal.obErori = JSON.parse(continut);
    for (let eroare of obGlobal.obErori.info_erori) {
        eroare.imagine = path.join(obGlobal.obErori.cale_baza, eroare.imagine)
    }
    // console.log(obGlobal.obErori);
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
        let eroare_default = obGlobal.obErori.eroare_default;
        res.render("pagini/eroare", {
            titlu: _titlu || eroare_default.titlu,
            text: _text || eroare_default.text,
            imagine: _imagine || eroare_default.imagine,
        }) //al doilea argument este locals
        return;
    }
    else {
        if (eroare.status)
            res.status(eroare.identificator)

        res.render("pagini/eroare", {
            titlu: _titlu || eroare.titlu,
            text: _text || eroare.text,
            imagine: _imagine || eroare.imagine,
        })
        return;
    }
}

// ---------------------- GALERIE STATICA
function initImagini() {
    var continut = fs.readFileSync(__dirname + "/resurse/json/galerie.json").toString("utf-8");

    obGlobal.obImagini = JSON.parse(continut);
    let vImagini = obGlobal.obImagini.imagini;

    let caleAbs = path.join(__dirname, obGlobal.obImagini.cale_galerie);
    let caleAbsMediu = path.join(__dirname, obGlobal.obImagini.cale_galerie, "mediu");
    let caleAbsMic = path.join(__dirname, obGlobal.obImagini.cale_galerie, "mic");

    if (!fs.existsSync(caleAbsMediu))
        fs.mkdirSync(caleAbsMediu);

    if (!fs.existsSync(caleAbsMic))
        fs.mkdirSync(caleAbsMic);

    //for (let i=0; i< vErori.length; i++ )
    for (let imag of vImagini) {
        [numeFis, ext] = imag.cale_imagine.split(".");
        let caleFisAbs = path.join(caleAbs, imag.cale_imagine);
        let caleFisMediuAbs = path.join(caleAbsMediu, numeFis + ".webp");
        let caleFisMicAbs = path.join(caleAbsMic, numeFis + ".webp");
        sharp(caleFisAbs).resize(400).toFile(caleFisMediuAbs);
        sharp(caleFisAbs).resize(50).toFile(caleFisMicAbs);
        imag.fisier_mediu = path.join("/", obGlobal.obImagini.cale_galerie, "mediu", numeFis + ".webp")
        imag.fisier_mic = path.join("/", obGlobal.obImagini.cale_galerie, "mic", numeFis + ".webp")
        imag.cale_imagine = path.join("/", obGlobal.obImagini.cale_galerie, imag.cale_imagine)
        //eroare.imagine="/"+obGlobal.obErori.cale_baza+"/"+eroare.imagine;
    }
}
initImagini();



app.get("/galerie-animata", function (req, res) {
    let nrImagini = getRandomFromSet(); // Selectează un număr de imagini din mulțimea {2, 4, 8, 16}

    let fisScss = path.join(__dirname, "resurse/scss/galerie-animata.scss");
    let liniiFisScss = fs.readFileSync(fisScss).toString().split('\n');

    let stringImg = "$nrImg: " + nrImagini + ";";
    liniiFisScss.shift();
    liniiFisScss.unshift(stringImg);
    fs.writeFileSync(fisScss, liniiFisScss.join('\n'));

    res.render("pagini/galerie-animata", { imagini: obGlobal.obImagini.imagini, nrImagini: nrImagini });
});

// Et 5
function compileazaScss(caleScss, caleCss) {
    console.log("cale:", caleCss);
    if (!caleCss) {

        let numeFisExt = path.basename(caleScss);
        let numeFis = numeFisExt.split(".")[0]   /// "a.scss"  -> ["a","scss"]
        caleCss = numeFis + ".css";
    }

    if (!path.isAbsolute(caleScss))
        caleScss = path.join(obGlobal.folderScss, caleScss)
    if (!path.isAbsolute(caleCss))
        caleCss = path.join(obGlobal.folderCss, caleCss)


    let caleBackup = path.join(obGlobal.folderBackup, "resurse/css");
    if (!fs.existsSync(caleBackup)) {
        fs.mkdirSync(caleBackup, { recursive: true })
    }

    // la acest punct avem cai absolute in caleScss si  caleCss

    let numeFisCss = path.basename(caleCss);
    if (fs.existsSync(caleCss)) {
        fs.copyFileSync(caleCss, path.join(obGlobal.folderBackup, "resurse/css", numeFisCss))// +(new Date()).getTime()
    }
    rez = sass.compile(caleScss, { "sourceMap": true });
    fs.writeFileSync(caleCss, rez.css)
    //console.log("Compilare SCSS",rez);
}
//compileazaScss("a.scss");
vFisiere = fs.readdirSync(obGlobal.folderScss);
for (let numeFis of vFisiere) {
    if (path.extname(numeFis) == ".scss") {
        compileazaScss(numeFis);
    }
}


fs.watch(obGlobal.folderScss, function (eveniment, numeFis) {
    console.log(eveniment, numeFis);
    if (eveniment == "change" || eveniment == "rename") {
        let caleCompleta = path.join(obGlobal.folderScss, numeFis);
        if (fs.existsSync(caleCompleta)) {
            compileazaScss(caleCompleta);
        }
    }
})

// ---------- Stergerea fisierelor vechi din backup

function stergeFisiereVechi(folder, interval) {
    fs.readdir(folder, (err, files) => {
        if (err) {
            console.log("Eroare la citirea folderului:", err);
            return;
        }

        files.forEach(file => {
            let caleFisier = path.join(folder, file);
            fs.stat(caleFisier, (err, stats) => {
                if (err) {
                    console.log("Eroare la citirea informațiilor despre fișier:", err);
                    return;
                }

                let now = Date.now();
                let endTime = new Date(stats.mtime).getTime() + interval * 60000;

                if (now > endTime) {
                    fs.unlink(caleFisier, (err) => {
                        if (err) {
                            console.log("Eroare la ștergerea fișierului:", err);
                        } else {
                            console.log(`Fișierul ${file} a fost șters.`);
                        }
                    });
                }
            });
        });
    });
}

const intervalT = 10;

setInterval(() => {
    stergeFisiereVechi(obGlobal.folderBackup, intervalT);
}, intervalT * 60000);



app.listen(8080);
console.log("--------- Server started ---------");
