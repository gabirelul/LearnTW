
window.addEventListener("load", function () {

    document.getElementById("inp-pret").onchange = function () {
        document.getElementById("infoRange").innerHTML = `(${this.value})`
    }



    function filtrareProduse() {

        var inpNume = document.getElementById("inp-nume").value.toLowerCase().trim();


        // if (inpNume === "" || !inpNume.match(/^[a-zA-Z\s]*$/)) {
        //     alert("Numele introdus nu este valid.");
        //     return;
        // }

        var radioCalorii = document.getElementsByName("gr_rad")
        let inpCalorii;
        for (let rad of radioCalorii) {
            if (rad.checked) {
                inpCalorii = rad.value;
                break;
            }
        }
        let minCalorii, maxCalorii
        if (inpCalorii != "toate") {
            vCal = inpCalorii.split(":")
            minCalorii = parseInt(vCal[0])
            maxCalorii = parseInt(vCal[1])
        }


        var inpPret = parseInt(document.getElementById("inp-pret").value);

        var inpCateg = document.getElementById("inp-categorie").value.toLowerCase().trim()

        const valDescriere = document.getElementById("i_textarea").value.toLowerCase().trim();

        let numarProduseVizibile = 0;

        var produse = document.getElementsByClassName("produs");
        for (let produs of produse) {

            let valNume = produs.getElementsByClassName("val-nume")[0].innerHTML.toLowerCase().trim()

            let cond1 = valNume.startsWith(inpNume)


            let valCalorii = parseInt(produs.getElementsByClassName("val-calorii")[0].innerHTML)

            let cond2 = (inpCalorii == "toate" || (minCalorii <= valCalorii && valCalorii < maxCalorii));

            let valPret = parseFloat(produs.getElementsByClassName("val-pret")[0].innerHTML)
            let cond3 = (valPret > inpPret)


            let valCategorie = produs.getElementsByClassName("val-categorie")[0].innerHTML.toLowerCase().trim()
            let cond4 = (inpCateg == valCategorie || inpCateg == "toate")

            const prodDescriereElement = produs.getElementsByClassName("descriere")[0];
            const prodDescriere = prodDescriereElement ? prodDescriereElement.innerHTML.toLowerCase().trim() : "";

            const cond5 = (valDescriere === "" || prodDescriere.includes(valDescriere));


            if (cond1 && cond2 && cond3 && cond4 && cond5) {
                produs.style.display = "block";
                numarProduseVizibile++;
            }
            else {
                produs.style.display = "none";
            }
        }
        const mesajFiltrare = document.getElementById("mesaj-filtrare");
        mesajFiltrare.style.display = (numarProduseVizibile === 0) ? "block" : "none";
    }

    document.getElementById("inp-nume").addEventListener("input", filtrareProduse);
    document.getElementById("inp-pret").addEventListener("input", function () {
        document.getElementById("infoRange").innerHTML = `${this.value}`;
        filtrareProduse();
    });
    document.getElementById("inp-categorie").addEventListener("change", filtrareProduse);
    document.getElementById("i_textarea").addEventListener("input", filtrareProduse);
    const radioCalorii = document.getElementsByName("gr_rad");
    radioCalorii.forEach(radio => {
        radio.addEventListener("change", filtrareProduse);
    });

    document.getElementById("resetare").onclick = function () {
        var confirmReset = confirm("Doriți să resetați toate filtrele?");
        if (confirmReset) {
            document.getElementById("inp-nume").value = "";
            document.getElementById("inp-pret").value = document.getElementById("inp-pret").min;
            document.getElementById("i_textarea").value = "";
            document.getElementById("inp-categorie").value = "toate";
            document.getElementById("i_rad4").checked = true;
            var produse = document.getElementsByClassName("produs");
            for (let prod of produse) {
                prod.style.display = "block";
            }
        }
    };


    function sorteaza(semn) {
        var produse = document.getElementsByClassName("produs");
        let v_produse = Array.from(produse)
        v_produse.sort(function (a, b) {
            let pret_a = parseInt(a.getElementsByClassName("val-pret")[0].innerHTML)
            let pret_b = parseInt(b.getElementsByClassName("val-pret")[0].innerHTML)
            if (pret_a == pret_b) {
                let nume_a = a.getElementsByClassName("val-nume")[0].innerHTML
                let nume_b = b.getElementsByClassName("val-nume")[0].innerHTML
                return semn * nume_a.localeCompare(nume_b);
            }
            return semn * (pret_a - pret_b);
        })
        console.log(v_produse)
        for (let prod of v_produse) {
            prod.parentNode.appendChild(prod)
        }

    }

    document.getElementById("sortCrescNume").onclick = function () {
        sorteaza(1)
    }
    document.getElementById("sortDescrescNume").onclick = function () {
        sorteaza(-1)
    }



    window.onkeydown = function (e) {
        if (e.key == "c" && e.altKey) {
            var suma = 0;
            var produse = document.getElementsByClassName("produs");
            for (let produs of produse) {
                var stil = getComputedStyle(produs)
                if (stil.display != "none") {
                    suma += parseFloat(produs.getElementsByClassName("val-pret")[0].innerHTML)
                }
            }
            if (!document.getElementById("par_suma")) {
                let p = document.createElement("p")
                p.innerHTML = suma;
                p.id = "par_suma";
                container = document.getElementById("produse")
                container.insertBefore(p, container.children[0])
                setTimeout(function () {
                    var pgf = document.getElementById("par_suma")
                    if (pgf)
                        pgf.remove()
                }, 2000)
            }

        }
    }

    const textarea = document.getElementById("i_textarea");

    function validare(textarea) {
        const valDescriere = textarea.value.toLowerCase();
        const produse = document.getElementsByClassName("produs");
        let isInvalid = true; // Flag to track validation result

        for (let prod of produse) {
            const prod_descriere = prod.getElementsByClassName("val-descriere")[0].innerHTML.toLowerCase();
            if (prod_descriere.includes(valDescriere)) {
                isInvalid = false;
                break; // Exit the loop if a match is found
            }
        }

        if (isInvalid) {
            textarea.classList.add("is-invalid"); // Add the is-invalid class
        } else {
            textarea.classList.remove("is-invalid"); // Remove the is-invalid class
        }
    }
})

