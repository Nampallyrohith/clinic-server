create type gender_enum as enum ('male', 'female', 'Others');
create type payment_type_enum as enum ('Online', 'Cash');
create type payment_status_enum as enum ('success', 'failure');
create type case_type_enum as enum (
    'musculoskeletal',
    'neurological',
    'cardiopulmonary',
    'sports_injury',
    'post_surgical',
    'pediatric',
    'geriatric',
    'women_health'
);
create type treatment_type_enum as enum (
    'manual_therapy',
    'exercise_therapy',
    'electrotherapy',
    'dry_needling',
    'kinesio_taping',
    'postural_training',
    'gait_training',
    'respiratory_therapy'
);


CREATE EXTENSION IF NOT EXISTS pgcrypto;

create table if not exists admin (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_name varchar(100) NOT NULL,
    email varchar(100) UNIQUE NOT NULL,
    password varchar(100) NOT NULL,

    created_at timestamptz default CURRENT_TIMESTAMP
);

create table if not exists patients (
    id serial primary key,
    patient_name varchar(50),
    patient_age int,
    patient_gender gender_enum default 'male',
    patient_address text
);

create table if not exists cases (
    id serial primary key,
    patient_id int references patients(id) on delete cascade,
    case_type case_type_enum,
    case_description text,
    treatment_type treatment_type_enum,
    registered_date timestamptz default CURRENT_TIMESTAMP
);

create table if not exists visits (
    id serial primary key,
    case_id int references cases(id) on delete cascade,
    visit_date timestamptz,
    amount int,
    payment_type payment_type_enum,
    payment_status payment_status_enum
);