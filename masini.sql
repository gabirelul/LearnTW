GRANT ALL PRIVILEGES ON DATABASE cti_2024 TO gabirelul;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO gabirelul;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO gabirelul;

GRANT ALL PRIVILEGES ON TABLE masini TO gabirelul;
GRANT ALL PRIVILEGES ON TABLE prajituri TO gabirelul;

select * from prajituri;
drop table if exists prajituri;

drop type if exists categ_masini;
drop type if exists tipuri_masini;
drop table if exists masini;

create type categ_masini AS enum (
    'Nedefinit',
    'Audi',
    'BMW',
    'Mercedes-Benz'
);

create type tipuri_masini AS enum(
    'Nedefinit',
    'Electrica',
    'Hybrid',
    'Combustibil'
);

create table if not exists masini (
    id serial primary key,
    nume varchar(50) unique not null,
    descriere TEXT,
    pret numeric(8, 2) not null,
    cc INT not null CHECK (cc >= 0),
    tip_produs tipuri_masini default 'Nedefinit',
    categorie categ_masini default 'Nedefinit',
    dotari varchar [],
    --pot sa nu fie specificare deci nu punem not null
    volan_dreapta boolean not null default FALSE,
    imagine varchar(300),
    data_adaugare timestamp default current_timestamp
);

insert into masini (nume, descriere, pret, cc, tip_produs, categorie, dotari, volan_dreapta, imagine)
values 
    ('Audi A4', 'Sedan premium', 35000.00, 2000, 'Combustibil', 'Audi', ARRAY['Scaune de piele', 'Sistem de navigatie'], FALSE, 'a4-1.jpg'),
    ('Audi Q5', 'SUV premium', 45000.00, 3800, 'Hybrid', 'Audi', ARRAY['Scaune incalzite', 'Camera de marsarier'], FALSE, 'q5-1.jpg'),
    ('Audi TT', 'Sport car', 55000.00, 2700, 'Combustibil', 'Audi', ARRAY['Jante de aliaj', 'Sistem audio premium'], FALSE, 'tt-1.jpg'),
    ('Audi A3', 'Compact sedan', 30000.00, 4000, 'Electrica', 'Audi', ARRAY['Faruri LED', 'Senzori de parcare'], FALSE, 'a3-1.jpg'),
    ('BMW 3 Series', 'Luxury sedan', 40000.00, 2200, 'Electrica', 'BMW', ARRAY['Faruri LED', 'Asistent de parcare'], FALSE, 'bmw_3_series.jpg'),
    ('BMW X3', 'Compact SUV', 48000.00, 2600, 'Combustibil', 'BMW', ARRAY['Scaune ventilate', 'Senzori de ploaie'], FALSE, 'x3-1.jpg'),
    ('BMW i8', 'Plug-in hybrid sports car', 75000.00, 1500, 'Hybrid', 'BMW', ARRAY['Head-up display', 'Asistent de franare'], FALSE, 'i8-1.jpg'),
    ('BMW X5', 'Luxury SUV', 60000.00, 3000, 'Electrica', 'BMW', ARRAY['Sistem de navigatie', 'Suspensie adaptiva'], FALSE, 'x5-1.jpg'),
    ('Mercedes-Benz C-Class', 'Executive sedan', 42000.00, 1800, 'Combustibil', 'Mercedes-Benz', ARRAY['Sistem de climatizare duala', 'Pachet de asistenta la condus'], FALSE, 'c-1.jpg'),
    ('Mercedes-Benz GLE', 'Luxury SUV', 55000.00, 2700, 'Electrica', 'Mercedes-Benz', ARRAY['Sistem de sunet Burmester', 'Asistent la schimbarea benzii'], FALSE, 'gle-1.jpg'),
    ('Mercedes-Benz AMG GT', 'High-performance sports car', 90000.00, 3200, 'Combustibil', 'Mercedes-Benz', ARRAY['Suspensie adaptiva', 'Sistem de monitorizare a unghiului mort'], FALSE, 'gt-1.jpg'),
    ('Mercedes-Benz GLC', 'Midsize SUV', 48000.00, 6000, 'Combustibil', 'Mercedes-Benz', ARRAY['Tapiterie piele', 'Sistem de asistenta la conducere'], FALSE, 'glc-1.jpg');

select * from masini;