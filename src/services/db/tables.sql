create type gender_enum as enum ('Male', 'Female', 'Others');
create type payment_type_enum as enum ('Online', 'Cash');
create type payment_status_enum as enum ('paid', 'not-paid');
create type visit_type_enum as enum('Home', 'Clinic', 'Consultation');
create type case_type_enum as enum (
    'frozen_shoulder',
    'osteo_arthritis',
    'cervical_spondylitis',
    'low_back_ache',
    'hemiplegia',
    'bells_palsy',
    'sciatica',
    'fractures',
    'knee_replacement',
    'ligament_injuries',
    'ligament_surgeries',
    'delayed_milestones',
    'bow_legs',
    'cerebral_palsy',
    'plantar_fasciitis',
    'calcaneal_spur',
    'bursitis',
    'nerve_injuries',
    'prenatal_postnatal_care',
    'cardiac_rehab',
    'tennis_elbow',
    'golfers_elbow',
    'tendinitis',
    'sprains',
    'strains',
    'dislocations',
    'muscle_contusion'
);
create type treatment_type_enum as enum (
    'ift',
    'tens',
    'ultrasound',
    'hot_pack',
    'wax',
    'dryneedling',
    'cupping',
    'mobilisations',
    'stretchings',
    'stimulations',
    'exercises',
    'traction',
    'taping',
    'passive_movements'
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
    id VARCHAR(10) primary key,
    patient_name varchar(50),
    patient_age int,
    mobile varchar(10),
    patient_gender gender_enum default 'Male',
    patient_address text,
    created_at timestamptz default current_timestamp
);

create table if not exists cases (
    id serial primary key,
    patient_id varchar(10) references patients(id) on delete cascade,
    case_type case_type_enum,
    case_description text,
    treatment_type treatment_type_enum,
    visit_type visit_type_enum default 'Clinic',
    is_case_open boolean default TRUE,
    registered_date timestamptz default CURRENT_TIMESTAMP
);

create table if not exists visits (
    id serial primary key,
    case_id int references cases(id) on delete cascade,
    visit_date timestamptz,
    amount int,
    payment_type payment_type_enum,
    payment_status payment_status_enum default 'not-paid'
);

create sequence if not exists patient_seq start 1;

-- Create a trigger function to generate the ID
CREATE OR REPLACE FUNCTION generate_patient_id()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.id := 'AC' || LPAD(nextval('patient_seq')::TEXT, 3, '0');
        RETURN NEW;
    END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the function before insert
CREATE TRIGGER set_patient_id
    BEFORE INSERT ON patients
    FOR EACH ROW
    WHEN (NEW.id IS NULL)
EXECUTE FUNCTION generate_patient_id()