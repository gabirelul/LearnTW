CREATE TABLE utilizatori (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    nume VARCHAR(100) NOT NULL,
    prenume VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    parola VARCHAR(255) NOT NULL,
    rol_id INT NOT NULL,
    culoare_chat VARCHAR(20) DEFAULT 'black',
    poza TEXT,
    blocat BOOLEAN DEFAULT false
);


CREATE TABLE roluri (
    id SERIAL PRIMARY KEY,
    nume VARCHAR(100) NOT NULL,
    descriere TEXT
);
