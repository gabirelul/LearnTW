window.addEventListener("load", function () {

    // Funcția pentru actualizarea textului infoRange
    document.getElementById("inp-pret").onchange = function () {
        document.getElementById("infoRange").innerHTML = `(${this.value})`
    }

    // Funcția pentru filtrarea produselor
    function filtrareProduse() {
        var inpNume = document.getElementById("inp-nume").value.toLowerCase().trim();
        var radioCalorii = document.getElementsByName("gr_rad");
        let inpCalorii;
        for (let rad of radioCalorii) {
            if (rad.checked) {
                inpCalorii = rad.value;
                break;
            }
        }
        let minCalorii, maxCalorii;
        if (inpCalorii != "toate") {
            vCal = inpCalorii.split(":");
            minCalorii = parseInt(vCal[0]);
            maxCalorii = parseInt(vCal[1]);
        }
        var inpPret = parseInt(document.getElementById("inp-pret").value);
        var inpCateg = document.getElementById("inp-categorie").value.toLowerCase().trim();
        const valDescriere = document.getElementById("i_textarea").value.toLowerCase().trim();
        let numarProduseVizibile = 0;
        var produse = document.getElementsByClassName("produs");
        for (let produs of produse) {
            let valNume = produs.getElementsByClassName("val-nume")[0].innerHTML.toLowerCase().trim();
            let cond1 = valNume.startsWith(inpNume);

            let valCalorii = parseInt(produs.getElementsByClassName("val-cc")[0].innerHTML);
            let cond2 = (inpCalorii == "toate" || (minCalorii <= valCalorii && valCalorii < maxCalorii));

            let valPret = parseFloat(produs.getElementsByClassName("val-pret")[0].innerHTML);
            let cond3 = (valPret > inpPret);

            let valCategorie = produs.getElementsByClassName("val-categorie")[0].innerHTML.toLowerCase().trim();
            let cond4 = (inpCateg == valCategorie || inpCateg == "toate");
            
            const prodDescriereElement = produs.getElementsByClassName("descriere")[0];
            const prodDescriere = prodDescriereElement ? prodDescriereElement.innerHTML.toLowerCase().trim() : "";
            const cond5 = (valDescriere === "" || prodDescriere.includes(valDescriere));

            // Verificăm dacă produsul este pinnuit
            const isPinned = produs.classList.contains('pinned');

            // Aplicăm condițiile de afișare
            if ((cond1 && cond2 && cond3 && cond4 && cond5) || isPinned) {
                produs.style.display = "block";
                numarProduseVizibile++;
            } else {
                produs.style.display = "none";
            }
        }
        let numarProduseVizibileElement = document.getElementById('numar-produse-vizibile');
        if (numarProduseVizibileElement) {
            numarProduseVizibileElement.textContent = numarProduseVizibile;
        }

        const mesajFiltrare = document.getElementById("mesaj-filtrare");
        mesajFiltrare.style.display = (numarProduseVizibile === 0) ? "block" : "none";
    }

    // Adăugăm ascultători de evenimente pentru filtre
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

    // Funcția pentru pinuirea produsului
    function pinProduct(button) {
        var produs = button.closest('.produs');
        var gridProduse = document.querySelector('.grid-produse');
        var isPinned = produs.classList.toggle('pinned');

        // Schimbăm iconița în funcție de starea de pin
        var iconElement = button.querySelector('i');
        if (isPinned) {
            iconElement.classList.remove('bi-pin');
            iconElement.classList.add('bi', 'bi-pin-angle-fill');
            button.title = 'Dezactivează acest produs';
        } else {
            iconElement.classList.remove('bi-pin-angle-fill');
            iconElement.classList.add('bi', 'bi-pin');
            button.title = 'Păstrează acest produs';

            // Produsul nu mai este pinnuit, îl readucem la poziția originală
            var sibling = produs.nextElementSibling;
            while (sibling && sibling.classList.contains('produs')) {
                if (!sibling.classList.contains('pinned')) {
                    gridProduse.insertBefore(produs, sibling);
                    break;
                }
                sibling = sibling.nextElementSibling;
            }
        }

        // Reordonăm produsele pinuite la început
        var pinnedProduse = gridProduse.querySelectorAll('.produs.pinned');
        pinnedProduse.forEach(function (pinnedProdus) {
            gridProduse.insertBefore(pinnedProdus, gridProduse.firstChild);
        });
    }

    // Setăm inițial butoanele să afișeze iconița goală
    document.querySelectorAll('.keep-button').forEach(function (button) {
        var iconElement = button.querySelector('i');
        iconElement.classList.add('bi', 'bi-pin');
    });


    // Funcția pentru toggle pin
    function togglePin(button) {
        pinProduct(button);
        filtrareProduse(); // Actualizăm vizibilitatea produselor după toggle pin
    }


    // Adăugăm ascultători de evenimente pentru butoanele de pinuire
    document.querySelectorAll('.keep-button').forEach(function (button) {
        button.addEventListener('click', function (event) {
            event.preventDefault();
            togglePin(this);
        });
    });

    // Funcție pentru sortarea produselor
    function sorteaza(semn) {
        var produse = document.getElementsByClassName("produs");
        let v_produse = Array.from(produse);
        v_produse.sort(function (a, b) {
            let pret_a = parseInt(a.getElementsByClassName("val-pret")[0].innerHTML);
            let pret_b = parseInt(b.getElementsByClassName("val-pret")[0].innerHTML);
            if (pret_a == pret_b) {
                let nume_a = a.getElementsByClassName("val-nume")[0].innerHTML;
                let nume_b = b.getElementsByClassName("val-nume")[0].innerHTML;
                return semn * nume_a.localeCompare(nume_b);
            }
            return semn * (pret_a - pret_b);
        });
        for (let prod of v_produse) {
            prod.parentNode.appendChild(prod);
        }
        // După sortare, reordonăm produsele pinuite la început
        var gridProduse = document.querySelector('.grid-produse');
        var pinnedProduse = gridProduse.querySelectorAll('.produs.pinned');
        pinnedProduse.forEach(function (pinnedProdus) {
            gridProduse.insertBefore(pinnedProdus, gridProduse.firstChild);
        });
    }

    // Adăugăm ascultători de evenimente pentru butoanele de sortare
    document.getElementById("sortCrescNume").onclick = function () {
        sorteaza(1);
    };
    document.getElementById("sortDescrescNume").onclick = function () {
        sorteaza(-1);
    };

    // Funcție pentru calcularea celui mai mic preț
    function calculeazaCelMaiMicPret() {
        var produse = document.getElementsByClassName("produs");
        let celMaiIeftinPret = Infinity;
        for (let prod of produse) {
            let pretProdus = parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML);
            if (pretProdus < celMaiIeftinPret) {
                celMaiIeftinPret = pretProdus;
            }
        }
        return celMaiIeftinPret;
    }

    // Aplicăm stilurile pentru cel mai mic preț
    const pretmic = calculeazaCelMaiMicPret();
    const produse = document.getElementsByClassName("produs");
    for (let produs of produse) {
        let pretProdus = parseFloat(produs.getElementsByClassName("val-pret")[0].innerHTML);
        if (pretProdus === pretmic) {
            produs.getElementsByClassName("cmmpret")[0].style.display = "block";
        }
    }

    // Funcționalitate pentru suma prețurilor
    window.onkeydown = function (e) {
        if (e.key == "c" && e.altKey) {
            var suma = 0;
            var produse = document.getElementsByClassName("produs");
            for (let produs of produse) {
                var stil = getComputedStyle(produs);
                if (stil.display != "none") {
                    suma += parseFloat(produs.getElementsByClassName("val-pret")[0].innerHTML);
                }
            }
            if (!document.getElementById("par_suma")) {
                let p = document.createElement("p");
                p.innerHTML = suma;
                p.id = "par_suma";
                container = document.getElementById("produse");
                container.insertBefore(p, container.children[0]);
                setTimeout(function () {
                    var pgf = document.getElementById("par_suma");
                    if (pgf) pgf.remove();
                }, 2000);
            }
        }
    }

    // Funcție pentru validarea textului
    const textarea = document.getElementById("i_textarea");
    function validare(textarea) {
        const valDescriere = textarea.value.toLowerCase();
        const produse = document.getElementsByClassName("produs");
        let isInvalid = true;
        for (let prod of produse) {
            const prod_descriere = prod.getElementsByClassName("val-descriere")[0].innerHTML.toLowerCase();
            if (prod_descriere.includes(valDescriere)) {
                isInvalid = false;
                break;
            }
        }
        if (isInvalid) {
            textarea.classList.add("is-invalid");
        } else {
            textarea.classList.remove("is-invalid");
        }
    }

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

    // Funcția pentru ștergerea temporară a produsului
    function deleteProductSession(button) {
        var produs = button.closest('.produs');
        var produsId = produs.getAttribute('data-id');

        // Ascundem produsul
        produs.style.display = 'none';

        // Salvăm ID-ul produsului în sessionStorage
        var hiddenProducts = JSON.parse(sessionStorage.getItem('hiddenProducts')) || [];
        if (!hiddenProducts.includes(produsId)) {
            hiddenProducts.push(produsId);
            sessionStorage.setItem('hiddenProducts', JSON.stringify(hiddenProducts));
        }

        // Afisăm mesajul de filtrare dacă nu mai sunt produse vizibile
        var mesajFiltrare = document.getElementById('mesaj-filtrare');
        var produseVizibile = document.querySelectorAll('.produs:not([style*="display: none"])');
        mesajFiltrare.style.display = produseVizibile.length === 0 ? 'block' : 'none';
    }

    // Funcția pentru a arăta produsele ascunse
    function showHiddenProducts() {
        var hiddenProducts = JSON.parse(sessionStorage.getItem('hiddenProducts')) || [];
        var produse = document.getElementsByClassName("produs");
        for (let produs of produse) {
            var produsId = produs.getAttribute('data-id');
            if (hiddenProducts.includes(produsId)) {
                produs.style.display = 'none';
            }
        }
    }

    showHiddenProducts();

    document.querySelectorAll('.sesiune-button').forEach(function (button) {
        button.addEventListener('click', function (event) {
            event.preventDefault();
            deleteProductSession(this);
        });
    });

}); //sfarsit window.addEventListener("load")


// Funcția pentru ștergerea temporară a produsului
function deleteProduct(button) {
    var produs = button.closest('.produs');
    produs.style.display = 'none';

    // Afisăm mesajul de filtrare dacă nu mai sunt produse vizibile
    var mesajFiltrare = document.getElementById('mesaj-filtrare');
    var produseVizibile = document.querySelectorAll('.produs:not([style*="display: none"])');
    mesajFiltrare.style.display = produseVizibile.length === 0 ? 'block' : 'none';
}


document.querySelectorAll('.delete-button').forEach(function (button) {
    button.addEventListener('click', function (event) {
        event.preventDefault();
        deleteProduct(this);
    });
});


function normalizeString(str) {
    const diacriticsMap = {
        'ă': 'a', 'â': 'a', 'î': 'i', 'ș': 's', 'ț': 't',
        'Ă': 'A', 'Â': 'A', 'Î': 'I', 'Ș': 'S', 'Ț': 'T'
    };
    return str.replace(/[ăâîșțĂÂÎȘȚ]/g, match => diacriticsMap[match]);
}

const inpNume = normalizeString(document.getElementById("inp-nume").value.toLowerCase().trim());

