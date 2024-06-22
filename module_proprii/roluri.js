    /**
    * @type {string} - get the type of the role
    * @type {Array<Symbol>} - gets the list of rights associated with the role
    * */



    const Drepturi=require('./drepturi.js');


    class Rol{
        /**
         * @type {string}
         * */
        static get tip() {return "generic"}
        static get drepturi() {return []}
        constructor (){
            this.cod=this.constructor.tip;
        }
    
        /**
         * @param {Symbol} drept - dreptul care trebuie verificat, reprezentat ca simbol
         * @returns {boolean} - true daca rolul are dreptul specificat, false altfel
        * */
        areDreptul(drept){ //drept trebuie sa fie tot Symbol
            console.log("in metoda rol!!!!")
            return this.constructor.drepturi.includes(drept); //pentru ca e admin
        }
    }
    
    class RolAdmin extends Rol{
    
        /**
         * @type {string}
         * */
        static get tip() {return "admin"}
        constructor (){
            super();
        }
    
        /**
         * @returns {boolean} - returneaza intotdeauna adevarat
         * */
        areDreptul(){
            return true; //pentru ca e admin
        }
    }
    
    class RolModerator extends Rol{
        
        /**
         * @type {string} - gets the type of the role
         * */
        static get tip() {return "moderator"}
    
        /**
         * @type {Array<Symbol>} - gets the list of rights associated with the role */
        static get drepturi() { return [
            Drepturi.vizualizareUtilizatori,
            Drepturi.stergereUtilizatori
        ] }
        constructor (){
            super()
        }
    }
    
    class RolClient extends Rol{
        /**
         * @type {string} - gets the type of the role
         * */
        static get tip() {return "comun"}
    
        /**
         * @type {Array<Symbol>} - gets the list of rights associated with the role
         * */
        static get drepturi() { return [
            Drepturi.cumparareProduse
        ] }
        constructor (){
            super()
        }
    }
    
    class RolFactory{
         /**
         * @param {string} tip - tipul rolului
         * @returns {Rol} - returneaza o instanta a clsei rolului corespunzator*/
        static creeazaRol(tip) {
            switch(tip){
                case RolAdmin.tip : return new RolAdmin();
                case RolModerator.tip : return new RolModerator();
                case RolClient.tip : return new RolClient();
            }
        }
    }
    
    
    module.exports={
        RolFactory:RolFactory,
        RolAdmin:RolAdmin
    }