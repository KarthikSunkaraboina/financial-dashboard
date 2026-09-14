CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS loan_applications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    loan_amount NUMERIC(12, 2) NOT NULL,
    monthly_income NUMERIC(12, 2) NOT NULL,
    tenure INTEGER NOT NULL,
    employment_type VARCHAR(50),
    credit_score INTEGER,
    average_balance NUMERIC(12, 2),
    eligibility_score NUMERIC(5, 2),
    interest_rate NUMERIC(5, 2),
    emi NUMERIC(12, 2),
    status VARCHAR(20) DEFAULT 'PENDING',
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    loan_application_id INTEGER REFERENCES loan_applications(id) ON DELETE CASCADE,
    document_type VARCHAR(30) NOT NULL,
    file_name VARCHAR(255),
    file_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);