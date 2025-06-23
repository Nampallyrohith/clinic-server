CREATE EXTENSION IF NOT EXISTS pgcrypto;

create table if not exists admin (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_name varchar(100) NOT NULL,
    email varchar(100) UNIQUE NOT NULL,
    password varchar(100) NOT NULL,

    created_at timestamptz default CURRENT_TIMESTAMP
);