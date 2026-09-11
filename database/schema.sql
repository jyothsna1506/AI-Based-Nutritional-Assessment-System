-- ==========================================================
-- AI-Based Nutritional Assessment System
-- SQLite-compatible Schema (mirrors SQLAlchemy ORM models)
-- ==========================================================
-- NOTE: This schema reflects the actual ORM models used by the application.
--       Run migrations via the application startup (init_db) rather than
--       applying this file directly in production.
-- ==========================================================


-- ==========================================================
-- USERS
-- ==========================================================

CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name   TEXT NOT NULL,
    email       TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    phone       TEXT,
    role        TEXT DEFAULT 'USER',
    is_active   INTEGER DEFAULT 1,  -- SQLite BOOLEAN as integer
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);


-- ==========================================================
-- USER HEALTH PROFILE (one-to-one with users)
-- ==========================================================

CREATE TABLE IF NOT EXISTS health_profiles (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id             INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,

    age                 INTEGER,
    gender              TEXT,
    height_cm           REAL,
    weight_kg           REAL,
    bmi                 REAL,

    activity_level      TEXT,
    dietary_preference  TEXT,
    health_goal         TEXT,

    smoking             INTEGER DEFAULT 0,
    alcohol             INTEGER DEFAULT 0,
    water_intake        REAL,
    sleep_hours         REAL,
    stress_level        TEXT,

    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ==========================================================
-- FOOD DATABASE
-- ==========================================================

CREATE TABLE IF NOT EXISTS foods (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    food_name           TEXT NOT NULL,
    category            TEXT,
    diet_type           TEXT,   -- vegetarian / vegan / non_vegetarian
    meal_type           TEXT,   -- breakfast / lunch / dinner / snack

    energy_kcal         REAL DEFAULT 0,
    protein_g           REAL DEFAULT 0,
    carbohydrate_g      REAL DEFAULT 0,
    fat_g               REAL DEFAULT 0,
    fiber_g             REAL DEFAULT 0,

    iron_mg             REAL DEFAULT 0,
    calcium_mg          REAL DEFAULT 0,
    vitamin_d_mcg       REAL DEFAULT 0,
    vitamin_b12_mcg     REAL DEFAULT 0,
    vitamin_c_mg        REAL DEFAULT 0,
    potassium_mg        REAL DEFAULT 0,
    magnesium_mg        REAL DEFAULT 0,
    zinc_mg             REAL DEFAULT 0,
    folate_mcg          REAL DEFAULT 0,
    sodium_mg           REAL DEFAULT 0,
    vitamin_a_mcg_rae   REAL DEFAULT 0,
    vitamin_e_mg        REAL DEFAULT 0,
    vitamin_k_mcg       REAL DEFAULT 0,
    riboflavin_mg       REAL DEFAULT 0,
    thiamin_mg          REAL DEFAULT 0,
    niacin_mg           REAL DEFAULT 0,
    vitamin_b6_mg       REAL DEFAULT 0,
    sugars_g            REAL DEFAULT 0,
    cholesterol_mg      REAL DEFAULT 0,
    nutriscore_grade    TEXT
);


-- ==========================================================
-- FOOD DIARY
-- ==========================================================

CREATE TABLE IF NOT EXISTS food_diary (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
    food_id     INTEGER REFERENCES foods(id),

    food_name   TEXT NOT NULL,
    meal_type   TEXT,       -- breakfast / lunch / dinner / snack
    quantity    REAL DEFAULT 1.0,
    meal_time   TIMESTAMP,
    calories    REAL DEFAULT 0,
    protein     REAL DEFAULT 0,
    carbs       REAL DEFAULT 0,
    fat         REAL DEFAULT 0,

    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_food_diary_user ON food_diary(user_id);


-- ==========================================================
-- SYMPTOMS
-- ==========================================================

CREATE TABLE IF NOT EXISTS symptom_records (
    id                      INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id                 INTEGER REFERENCES users(id) ON DELETE CASCADE,

    fatigue                 INTEGER DEFAULT 0,
    hair_loss               INTEGER DEFAULT 0,
    muscle_weakness         INTEGER DEFAULT 0,
    dry_skin                INTEGER DEFAULT 0,
    brittle_nails           INTEGER DEFAULT 0,
    mood_changes            INTEGER DEFAULT 0,
    pale_skin               INTEGER DEFAULT 0,
    bone_pain               INTEGER DEFAULT 0,
    poor_vision             INTEGER DEFAULT 0,
    slow_healing            INTEGER DEFAULT 0,
    loss_of_appetite        INTEGER DEFAULT 0,
    tingling                INTEGER DEFAULT 0,
    difficulty_concentrating INTEGER DEFAULT 0,
    frequent_illness        INTEGER DEFAULT 0,

    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ==========================================================
-- BLOOD REPORTS
-- ==========================================================

CREATE TABLE IF NOT EXISTS blood_reports (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER REFERENCES users(id) ON DELETE CASCADE,

    hemoglobin      REAL,
    iron            REAL,
    ferritin        REAL,
    vitamin_d       REAL,
    vitamin_b12     REAL,
    calcium         REAL,
    magnesium       REAL,
    zinc            REAL,
    blood_sugar     REAL,
    cholesterol     REAL,
    report_file     TEXT,

    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_blood_reports_user ON blood_reports(user_id);


-- ==========================================================
-- ML PREDICTIONS
-- NOTE: Columns match the Prediction ORM model exactly.
--       vitamin_b12_risk also stores Riboflavin (R_Deficiency)
--       risk until a dedicated riboflavin_risk column is added.
-- ==========================================================

CREATE TABLE IF NOT EXISTS predictions (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id             INTEGER REFERENCES users(id) ON DELETE CASCADE,

    iron_risk           REAL DEFAULT 0.0,
    vitamin_d_risk      REAL DEFAULT 0.0,
    calcium_risk        REAL DEFAULT 0.0,
    magnesium_risk      REAL DEFAULT 0.0,
    potassium_risk      REAL DEFAULT 0.0,
    vitamin_b12_risk    REAL DEFAULT 0.0,  -- also stores R_Deficiency (Riboflavin B2)

    confidence_score        REAL DEFAULT 0.0,
    deficiencies_detected   TEXT DEFAULT '[]',  -- JSON array of DeficiencyDetail objects

    prediction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_predictions_user ON predictions(user_id);


-- ==========================================================
-- MEAL PLANS
-- ==========================================================

CREATE TABLE IF NOT EXISTS meal_plans (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER REFERENCES users(id) ON DELETE CASCADE,

    week_number     INTEGER NOT NULL,
    year            INTEGER NOT NULL,
    diet_preference TEXT,
    plan_data       TEXT DEFAULT '{}',  -- Full 7-day plan as JSON

    daily_calories  REAL DEFAULT 2000,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ==========================================================
-- PROGRESS LOGS
-- ==========================================================

CREATE TABLE IF NOT EXISTS progress_logs (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id             INTEGER REFERENCES users(id) ON DELETE CASCADE,

    weight              REAL,
    bmi                 REAL,
    calories_consumed   INTEGER,
    water_intake        REAL,
    nutrition_score     REAL,

    log_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_progress_logs_user ON progress_logs(user_id);