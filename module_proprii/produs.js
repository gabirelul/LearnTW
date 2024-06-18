class Produs{

    constructor({id, nume, descriere, pret, cc, tip_produs, categorie, dotari, volan_dreapta, imagine, data_adaugare}={}) {

        for(let prop in arguments[0]){
            this[prop]=arguments[0][prop]
        }
    }
}