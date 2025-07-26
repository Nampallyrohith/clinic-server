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

create type payment_category_enum as enum ('general', 'package');


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
    patient_dob date,
    mobile varchar(10),
    patient_gender gender_enum default 'Male',
    patient_address text,
    created_at timestamptz default current_timestamp
);

create table if not exists cases (
    id VARCHAR(10) primary key,
    patient_id varchar(10) references patients(id) on delete cascade,
    case_type case_type_enum,
    case_description text,
    visit_type visit_type_enum default 'Clinic',
    amount_per_visit int,
    payment_category payment_category_enum,
    is_case_open boolean default TRUE,
    registered_date timestamptz default CURRENT_TIMESTAMP
);

create table if not exists case_treatments (
  id SERIAL PRIMARY KEY,
  case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
  treatment_type treatment_type_enum NOT NULL
);

create table if not exists visits (
    id VARCHAR(10) primary key,
    case_id VARCHAR(10) references cases(id) on delete cascade,
    visit_date timestamptz,
    payment_type payment_type_enum,
    payment_status payment_status_enum default 'not-paid'
);

-- Create a trigger function to generate the ID
-- Case id
create sequence if not exists case_seq start 1;
CREATE OR REPLACE FUNCTION generate_case_id()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.id := 'CS' || LPAD(nextval('case_seq')::TEXT, 3, '0');
        RETURN NEW;
    END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the function before insert
CREATE TRIGGER set_case_id
    BEFORE INSERT ON cases
    FOR EACH ROW
    WHEN (NEW.id IS NULL)
EXECUTE FUNCTION generate_case_id();

-- Visit ids generation
create sequence if not exists visit_seq start 1;
CREATE OR REPLACE FUNCTION generate_visit_id()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.id := 'VT' || LPAD(nextval('visit_seq')::TEXT, 3, '0');
        RETURN NEW;
    END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the function before insert
CREATE TRIGGER set_visit_id
    BEFORE INSERT ON visits
    FOR EACH ROW
    WHEN (NEW.id IS NULL)
EXECUTE FUNCTION generate_visit_id();

-- Patient ids generation
create sequence if not exists patient_seq start 1;
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
EXECUTE FUNCTION generate_patient_id();