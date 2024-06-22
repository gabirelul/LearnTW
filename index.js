const express = require("express");
const fs = require('fs'); //file system - ex: erifica caile fisierelor (fisier ca obiect)
const path = require('path'); // lucreaza cu caile fisierelor, nu poate accesa fisierul (cale)
const sharp = require('sharp');
const sass = require('sass');
const moment = require('moment');
const nodemailer = require('nodemailer');
const ejs = require('ejs');

obGlobal = {
    obErori: null,
    obImagini: null,
    folderCss: path.join(__dirname, "resurse/css"),
    folderScss: path.join(__dirname, "resurse/scss"),
    folderBackup: path.join(__dirname, "backup")
}

// conectare baza de date
const { Client } = require('pg');
const AccesBD = require("./module_proprii/accesbd.js");
const { Utilizator } = require("./module_proprii/utilizator.js")
const session = require('express-session');
const Drepturi = require("./module_proprii/drepturi.js");

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

// console.log("Folder proiect", __dirname);
// folderul in care se gaseste fisierul (radacina)
// console.log("Cale fisier", __filename);
// dirname + numele fisierului pe care il rulez (index.js)
// console.log("Director de lucru", process.cwd());
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
app.get(["/", "/home", "/index"], function (req, res) {
    let oferte = JSON.parse(fs.readFileSync(path.join(__dirname, "resurse/json/oferte.json")));
    let ofertaCurenta = oferte.oferte[0];
    res.render("pagini/index", { ip: req.ip, imagini: obGlobal.obImagini.imagini, oferta: ofertaCurenta });
});

const T = 100; //minute

function ofertaNoua() {
    const categoriesQuery = "select * from unnest(enum_range(null::categ_masini))";
    client.query(categoriesQuery, (err, result) => {
        if (err) {
            console.error("Eroare la categorii!", err);
            return;
        }

        let categories = result.rows.map(row => row.unnest);
        let currentOffers = JSON.parse(fs.readFileSync(path.join(__dirname, "resurse/json/oferte.json"))).oferte;

        let lastCategory = currentOffers.length > 0 ? currentOffers[0].categorie : null;
        let availableCategories = categories.filter(cat => cat !== lastCategory);

        if (availableCategories.length === 0) {
            console.error("Nu exista categorii din care sa alegi.");
            return;
        }

        let newCategory = availableCategories[Math.floor(Math.random() * availableCategories.length)];
        let newDiscount = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50][Math.floor(Math.random() * 10)];
        let now = moment();

        // Fetch the image URL for the selected category
        client.query("SELECT * FROM masini WHERE categorie = $1 LIMIT 1", [newCategory], (err, res) => {
            if (err) {
                console.error("Eroare la detalii", err);
                return;
            }

            if (res.rows.length === 0) {
                console.error("Nicio masina gasita in categorie.");
                return;
            }

            let car = res.rows[0];

            let newOffer = {
                categorie: newCategory,
                "data-incepere": now.format("YYYY-MM-DD HH:mm:ss"),
                "data-finalizare": now.add(T, 'minutes').format("YYYY-MM-DD HH:mm:ss"),
                reducere: newDiscount
            };

            currentOffers.unshift(newOffer);

            fs.writeFileSync(path.join(__dirname, "resurse/json/oferte.json"), JSON.stringify({ oferte: currentOffers }, null, 2));

            console.log("Oferta noua generata:", newOffer);
        });
    });
}

setInterval(ofertaNoua, T * 60 * 1000);


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
    // console.log("cale:",caleCss);
    if (!caleCss) {
        // let vectorCale=caleScss.split("/")
        // let numeFisExt=vectorCale[vectorCale.length-1];

        let numeFisExt = path.basename(caleScss);
        let numeFis = numeFisExt.split(".")[0]   /// "a.scss"  -> ["a","scss"]
        caleCss = numeFis + ".css";
    }

    if (!path.isAbsolute(caleScss))
        caleScss = path.join(obGlobal.folderScss, caleScss)
    if (!path.isAbsolute(caleCss))
        caleCss = path.join(obGlobal.folderCss, caleCss)

    let caleBackup = path.join(obGlobal.folderBackup, "resurse/css");
    if (!fs.existsSync(caleBackup))
        fs.mkdirSync(caleBackup, { recursive: true });

    // la acest punct avem cai absolute in caleScss si  caleCss
    // let vectorCale=caleCss.split("/");
    // let numeFisCss=vectorCale[vectorCale.length-1];
    let numeFisCss = path.basename(caleCss);
    if (fs.existsSync(caleCss))
        fs.copyFileSync(caleCss, path.join(obGlobal.folderBackup, "resurse/css", numeFisCss))// +(new Date()).getTime()

    rez = sass.compile(caleScss, { "sourceMap": true });
    fs.writeFileSync(caleCss, rez.css)
    // console.log("Compilare SCSS",rez);
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
                    console.log("Eroare", err);
                    return;
                }

                let now = Date.now();
                let endTime = new Date(stats.mtime).getTime() + interval * 60000;

                if (now > endTime) {
                    fs.unlink(caleFisier, (err) => {
                        if (err) {
                            console.log("Eroare la stergere:", err);
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


// ---------------- Utilizatori

app.post("/inregistrare", function (req, res) {
    var username;
    var poza;
    console.log("ceva");
    var formular = new formidable.IncomingForm()
    formular.parse(req, function (err, campuriText, campuriFisier) {//4
        console.log("Inregistrare:", campuriText);

        console.log(campuriFisier);
        var eroare = "";

        var utilizNou = new Utilizator();
        try {
            utilizNou.setareNume = campuriText.nume;
            utilizNou.setareUsername = campuriText.username;
            utilizNou.email = campuriText.email
            utilizNou.prenume = campuriText.prenume

            utilizNou.parola = campuriText.parola;
            utilizNou.culoare_chat = campuriText.culoare_chat;
            utilizNou.poza = poza;
            Utilizator.getUtilizDupaUsername(campuriText.username, {}, function (u, parametru, eroareUser) {
                if (eroareUser == -1) {//nu exista username-ul in BD
                    utilizNou.salvareUtilizator();
                }
                else {
                    eroare += "Mai exista username-ul";
                }

                if (!eroare) {
                    res.render("pagini/inregistrare", { raspuns: "Inregistrare cu succes!" })

                }
                else
                    res.render("pagini/inregistrare", { err: "Eroare: " + eroare });
            })
        }
        catch (e) {
            console.log(e);
            eroare += "Eroare site; reveniti mai tarziu";
            console.log(eroare);
            res.render("pagini/inregistrare", { err: "Eroare: " + eroare })
        }

    });
    formular.on("field", function (nume, val) {  // 1 

        console.log(`--- ${nume}=${val}`);

        if (nume == "username")
            username = val;
    })
    formular.on("fileBegin", function (nume, fisier) { //2
        console.log("fileBegin");

        console.log(nume, fisier);
        //TO DO in folderul poze_uploadate facem folder cu numele utilizatorului
        let folderUser = path.join(__dirname, "poze_uploadate", username);
        //folderUser=__dirname+"/poze_uploadate/"+username
        console.log(folderUser);
        if (!fs.existsSync(folderUser))
            fs.mkdirSync(folderUser);
        fisier.filepath = path.join(folderUser, fisier.originalFilename)
        poza = fisier.originalFilename
        //fisier.filepath=folderUser+"/"+fisier.originalFilename

    })
    formular.on("file", function (nume, fisier) {//3
        console.log("file");
        console.log(nume, fisier);
    });
});

app.post("/login", function (req, res) {
    var username;
    console.log("ceva");
    var formular = new formidable.IncomingForm()
    formular.parse(req, function (err, campuriText, campuriFisier) {
        Utilizator.getUtilizDupaUsername(campuriText.username, {
            req: req,
            res: res,
            parola: campuriText.parola
        }, function (u, obparam) {
            let parolaCriptata = Utilizator.criptareParola(obparam.parola);
            if (u.parola == parolaCriptata && u.confirmat_mail) {
                u.poza = u.poza ? path.join("poze_uploadate", u.username, u.poza) : "";
                obparam.req.session.utilizator = u;

                obparam.req.session.mesajLogin = "Bravo! Te-ai logat!";
                obparam.res.redirect("/index");
                //obparam.res.render("/login");
            }
            else {
                console.log("Eroare logare")
                obparam.req.session.mesajLogin = "Date logare incorecte sau nu a fost confirmat mailul!";
                obparam.res.redirect("/index");
            }
        })
    });
});


app.post("/profil", function (req, res) {
    console.log("profil");
    if (!req.session.utilizator) {
        randeazaEroare(res, 403,)
        res.render("pagini/eroare_generala", { text: "Nu sunteti logat." });
        return;
    }
    var formular = new formidable.IncomingForm();

    formular.parse(req, function (err, campuriText, campuriFile) {

        var parolaCriptata = Utilizator.criptareParola(campuriText.parola);
        // AccesBD.getInstanta().update(
        //     {tabel:"utilizatori",
        //     campuri:["nume","prenume","email","culoare_chat"],
        //     valori:[`${campuriText.nume}`,`${campuriText.prenume}`,`${campuriText.email}`,`${campuriText.culoare_chat}`],
        //     conditiiAnd:[`parola='${parolaCriptata}'`]
        // },  
        AccesBD.getInstanta().updateParametrizat(
            {
                tabel: "utilizatori",
                campuri: ["nume", "prenume", "email", "culoare_chat"],
                valori: [`${campuriText.nume}`, `${campuriText.prenume}`, `${campuriText.email}`, `${campuriText.culoare_chat}`],
                conditiiAnd: [`parola='${parolaCriptata}'`, `username='${campuriText.username}'`]
            },
            function (err, rez) {
                if (err) {
                    console.log(err);
                    randeazaEroare(res, 2);
                    return;
                }
                console.log(rez.rowCount);
                if (rez.rowCount == 0) {
                    res.render("pagini/profil", { mesaj: "Update-ul nu s-a realizat. Verificati parola introdusa." });
                    return;
                }
                else {
                    //actualizare sesiune
                    console.log("ceva");
                    req.session.utilizator.nume = campuriText.nume;
                    req.session.utilizator.prenume = campuriText.prenume;
                    req.session.utilizator.email = campuriText.email;
                    req.session.utilizator.culoare_chat = campuriText.culoare_chat;
                    res.locals.utilizator = req.session.utilizator;
                }


                res.render("pagini/profil", { mesaj: "Update-ul s-a realizat cu succes." });

            });


    });
});


// ------------ Administrare utilizatori

app.get("/useri", function (req, res) {

    if (req?.utilizator?.areDreptul?.(Drepturi.vizualizareUtilizatori)) {
        AccesBD.getInstanta().select({ tabel: "utilizatori", campuri: ["*"] }, function (err, rezQuery) {
            console.log(err);
            res.render("pagini/useri", { useri: rezQuery.rows });
        });
    }
    else {
        afisareEroare(res, 403);
    }
});


app.post("/sterge_utiliz", function (req, res) {
    if (req?.utilizator?.areDreptul?.(Drepturi.stergereUtilizatori)) {
        var formular = new formidable.IncomingForm();

        formular.parse(req, function (err, campuriText, campuriFile) {
            AccesBD.getInstanta().delete({ tabel: "utilizatori", conditiiAnd: [`id=${campuriText.id_utiliz}`] }, function (err, rezQuery) {
                console.log(err);
                res.redirect("/useri");
            });
        });
    } else {
        afisareEroare(res, 403);
    }
});

app.post("/blocare", function (req, res) {
    var userID = req.body.id_utiliz;

    if (req?.utilizator?.areDreptul?.(Drepturi.vizualizareUtilizatori)) {
        AccesBD.getInstanta().update(
            {
                tabel: "utilizatori",
                campuri: { blocat: `true` },
                conditiiAnd: [`id=${userID}`]
            },
            function (err, rezQuery) {
                console.log(err);
                res.redirect("/useri");
            }
        );
    } else {
        afisareEroare(res, 403);
    }
});

app.post("/deblocare", function (req, res) {
    var userID = req.body.id_utiliz;

    if (req?.utilizator?.areDreptul?.(Drepturi.vizualizareUtilizatori)) {
        AccesBD.getInstanta().update(
            {
                tabel: "utilizatori",
                campuri: { blocat: `false` },
                conditiiAnd: [`id=${userID}`]
            },
            function (err, rezQuery) {
                console.log(err);
                res.redirect("/useri");
            }
        );
    } else {
        afisareEroare(res, 403);
    }
});

app.get("/logout", function (req, res) {
    req.session.destroy();
    res.locals.utilizator = null;
    res.render("pagini/logout");
});


//http://${Utilizator.numeDomeniu}/cod/${utiliz.username}/${token}
app.get("/cod/:username/:token", function (req, res) {
    console.log(req.params);
    try {
        Utilizator.getUtilizDupaUsername(req.params.username, { res: res, token: req.params.token }, function (u, obparam) {
            AccesBD.getInstanta().update(
                {
                    tabel: "utilizatori",
                    campuri: { confirmat_mail: 'true' },
                    conditiiAnd: [`cod='${obparam.token}'`]
                },
                function (err, rezUpdate) {
                    if (err || rezUpdate.rowCount == 0) {
                        console.log("Cod:", err);
                        afisareEroare(res, 3);
                    }
                    else {
                        res.render("pagini/confirmare.ejs");
                    }
                })
        })
    }
    catch (e) {
        console.log(e);
        afisareEroare(res, 2);
    }
});

app.listen(8080);
console.log("--------- Server started ---------");
