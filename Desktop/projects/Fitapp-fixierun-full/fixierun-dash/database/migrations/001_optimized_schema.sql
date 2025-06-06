-- =====================================================
-- OPTIMISATION DU SCHÉMA DE BASE DE DONNÉES FIXIE.RUN
-- =====================================================

-- Extension pour UUID et crypto
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Suppression des tables existantes pour recréation
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS challenge_participants CASCADE;
DROP TABLE IF EXISTS challenges CASCADE;
DROP TABLE IF EXISTS rewards CASCADE;
DROP TABLE IF EXISTS cycling_activities CASCADE;
DROP TABLE IF EXISTS nft_bikes CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Types ENUM pour validation
CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator');
CREATE TYPE bike_rarity AS ENUM ('common', 'uncommon', 'rare', 'epic', 'legendary');
CREATE TYPE reward_type AS ENUM ('activity_completion', 'challenge_completion', 'milestone', 'referral', 'special_event');
CREATE TYPE activity_status AS ENUM ('started', 'in_progress', 'completed', 'cancelled');

-- =====================================================
-- TABLE: users (optimisée)
-- =====================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address VARCHAR(42) UNIQUE NOT NULL CHECK (wallet_address ~ '^0x[a-fA-F0-9]{40}$'),
    username VARCHAR(30) UNIQUE CHECK (username ~ '^[a-zA-Z0-9_]{3,30}$'),
    email VARCHAR(255) UNIQUE CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    email_verified BOOLEAN DEFAULT FALSE,
    password_hash TEXT, -- Pour authentification optionnelle
    role user_role DEFAULT 'user',
    
    -- Données de profil
    avatar_url TEXT CHECK (avatar_url ~ '^https?://.*'),
    bio TEXT CHECK (LENGTH(bio) <= 500),
    
    -- Statistiques dénormalisées pour performance
    total_distance DECIMAL(10,2) DEFAULT 0 CHECK (total_distance >= 0),
    total_activities INTEGER DEFAULT 0 CHECK (total_activities >= 0),
    total_tokens_earned DECIMAL(15,4) DEFAULT 0 CHECK (total_tokens_earned >= 0),
    
    -- Métadonnées
    last_login_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index optimisés pour users
CREATE INDEX idx_users_wallet_lower ON users(LOWER(wallet_address));
CREATE INDEX idx_users_email_lower ON users(LOWER(email)) WHERE email IS NOT NULL;
CREATE INDEX idx_users_created_at ON users(created_at DESC);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = TRUE;

-- =====================================================
-- TABLE: user_sessions (pour authentification)
-- =====================================================
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_session CHECK (expires_at > created_at)
);

CREATE INDEX idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_sessions_expires ON user_sessions(expires_at) WHERE expires_at > CURRENT_TIMESTAMP;

-- =====================================================
-- TABLE: nft_bikes (optimisée)
-- =====================================================
CREATE TABLE nft_bikes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_id VARCHAR(100) UNIQUE NOT NULL,
    contract_address VARCHAR(42) NOT NULL CHECK (contract_address ~ '^0x[a-fA-F0-9]{40}$'),
    
    -- Attributs du vélo
    name VARCHAR(100) NOT NULL CHECK (LENGTH(name) >= 3),
    rarity bike_rarity NOT NULL,
    level INTEGER DEFAULT 1 CHECK (level BETWEEN 1 AND 100),
    experience INTEGER DEFAULT 0 CHECK (experience >= 0),
    
    -- Stats avec contraintes
    speed INTEGER DEFAULT 50 CHECK (speed BETWEEN 1 AND 100),
    endurance INTEGER DEFAULT 50 CHECK (endurance BETWEEN 1 AND 100),
    acceleration INTEGER DEFAULT 50 CHECK (acceleration BETWEEN 1 AND 100),
    handling INTEGER DEFAULT 50 CHECK (handling BETWEEN 1 AND 100),
    
    -- Multiplicateurs
    earnings_multiplier DECIMAL(3,2) DEFAULT 1.00 CHECK (earnings_multiplier BETWEEN 0.50 AND 3.00),
    
    -- Métadonnées
    image_url TEXT CHECK (image_url ~ '^https?://.*'),
    metadata JSONB DEFAULT '{}',
    is_equipped BOOLEAN DEFAULT FALSE,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index optimisés pour nft_bikes
CREATE INDEX idx_bikes_user_id ON nft_bikes(user_id);
CREATE INDEX idx_bikes_rarity ON nft_bikes(rarity);
CREATE INDEX idx_bikes_equipped ON nft_bikes(user_id, is_equipped) WHERE is_equipped = TRUE;
CREATE INDEX idx_bikes_metadata ON nft_bikes USING GIN(metadata);

-- Contrainte: un seul vélo équipé par utilisateur
CREATE UNIQUE INDEX idx_one_equipped_bike ON nft_bikes(user_id) WHERE is_equipped = TRUE;

-- =====================================================
-- TABLE: cycling_activities (partitionnée par mois)
-- =====================================================
CREATE TABLE cycling_activities (
    id UUID DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    bike_id UUID,
    
    -- Données de l'activité
    status activity_status DEFAULT 'started',
    distance DECIMAL(10,2) CHECK (distance >= 0),
    duration INTEGER CHECK (duration >= 0), -- secondes
    average_speed DECIMAL(5,2) CHECK (average_speed >= 0 AND average_speed <= 200),
    max_speed DECIMAL(5,2) CHECK (max_speed >= 0 AND max_speed <= 200),
    elevation_gain DECIMAL(8,2) CHECK (elevation_gain >= -1000 AND elevation_gain <= 10000),
    
    -- Calculs
    calories_burned INTEGER CHECK (calories_burned >= 0),
    fix_tokens_earned DECIMAL(10,4) CHECK (fix_tokens_earned >= 0),
    
    -- Données GPS
    route_data JSONB,
    start_location POINT,
    end_location POINT,
    
    -- Validation anti-triche
    is_valid BOOLEAN DEFAULT TRUE,
    validation_score DECIMAL(3,2) CHECK (validation_score BETWEEN 0 AND 1),
    suspicious_flags TEXT[],
    
    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Contraintes
    CONSTRAINT valid_duration CHECK (
        (status = 'completed' AND completed_at > started_at) OR 
        status != 'completed'
    ),
    CONSTRAINT valid_speed CHECK (average_speed <= max_speed),
    
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Créer les partitions pour les 12 prochains mois
DO $$
DECLARE
    start_date DATE;
    end_date DATE;
    partition_name TEXT;
BEGIN
    FOR i IN 0..11 LOOP
        start_date := DATE_TRUNC('month', CURRENT_DATE + (i || ' months')::INTERVAL);
        end_date := start_date + INTERVAL '1 month';
        partition_name := 'cycling_activities_' || TO_CHAR(start_date, 'YYYY_MM');
        
        EXECUTE format('
            CREATE TABLE IF NOT EXISTS %I PARTITION OF cycling_activities
            FOR VALUES FROM (%L) TO (%L)',
            partition_name, start_date, end_date
        );
        
        -- Index pour chaque partition
        EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_user_id ON %I(user_id)', 
            partition_name, partition_name);
        EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_created_at ON %I(created_at DESC)', 
            partition_name, partition_name);
    END LOOP;
END $$;

-- =====================================================
-- TABLE: challenges (optimisée)
-- =====================================================
CREATE TABLE challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Objectifs
    target_distance DECIMAL(10,2) CHECK (target_distance > 0),
    target_duration INTEGER CHECK (target_duration > 0),
    target_activities INTEGER CHECK (target_activities > 0),
    
    -- Récompenses
    reward_tokens DECIMAL(10,4) NOT NULL CHECK (reward_tokens > 0),
    reward_nft_id UUID,
    
    -- Période
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Limites
    max_participants INTEGER CHECK (max_participants > 0),
    current_participants INTEGER DEFAULT 0 CHECK (current_participants >= 0),
    
    -- Métadonnées
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_challenge_period CHECK (end_date > start_date),
    CONSTRAINT valid_participants CHECK (current_participants <= COALESCE(max_participants, current_participants))
);

CREATE INDEX idx_challenges_active ON challenges(start_date, end_date) 
    WHERE is_active = TRUE;
CREATE INDEX idx_challenges_created_by ON challenges(created_by);

-- =====================================================
-- TABLE: rewards (optimisée)
-- =====================================================
CREATE TABLE rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_id UUID,
    challenge_id UUID REFERENCES challenges(id),
    
    -- Détails de la récompense
    reward_type reward_type NOT NULL,
    amount DECIMAL(10,4) NOT NULL CHECK (amount > 0),
    description TEXT,
    
    -- Statut
    is_claimed BOOLEAN DEFAULT FALSE,
    claimed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Transaction blockchain
    transaction_hash VARCHAR(66) UNIQUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_claim CHECK (
        (is_claimed = TRUE AND claimed_at IS NOT NULL) OR 
        (is_claimed = FALSE AND claimed_at IS NULL)
    ),
    CONSTRAINT valid_expiry CHECK (
        expires_at IS NULL OR expires_at > created_at
    )
);

CREATE INDEX idx_rewards_user_unclaimed ON rewards(user_id, created_at DESC) 
    WHERE is_claimed = FALSE;
CREATE INDEX idx_rewards_type ON rewards(reward_type);
CREATE INDEX idx_rewards_expires ON rewards(expires_at) 
    WHERE is_claimed = FALSE AND expires_at IS NOT NULL;

-- =====================================================
-- TABLE: audit_logs (pour sécurité et conformité)
-- =====================================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_action ON audit_logs(action, created_at DESC);
CREATE INDEX idx_audit_table ON audit_logs(table_name, record_id);

-- =====================================================
-- FONCTIONS ET TRIGGERS
-- =====================================================

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nft_bikes_updated_at BEFORE UPDATE ON nft_bikes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour valider les activités (anti-triche)
CREATE OR REPLACE FUNCTION validate_activity()
RETURNS TRIGGER AS $$
DECLARE
    speed_variance DECIMAL;
    reasonable_max_speed CONSTANT DECIMAL := 80.0; -- km/h
    reasonable_avg_speed CONSTANT DECIMAL := 40.0; -- km/h
BEGIN
    -- Validation de base
    IF NEW.status = 'completed' THEN
        -- Vérifier la vitesse
        IF NEW.max_speed > reasonable_max_speed THEN
            NEW.suspicious_flags = array_append(NEW.suspicious_flags, 'high_max_speed');
            NEW.validation_score = GREATEST(0, NEW.validation_score - 0.3);
        END IF;
        
        IF NEW.average_speed > reasonable_avg_speed THEN
            NEW.suspicious_flags = array_append(NEW.suspicious_flags, 'high_avg_speed');
            NEW.validation_score = GREATEST(0, NEW.validation_score - 0.2);
        END IF;
        
        -- Vérifier la cohérence distance/temps
        IF NEW.distance > 0 AND NEW.duration > 0 THEN
            speed_variance := ABS(NEW.average_speed - (NEW.distance / (NEW.duration / 3600.0)));
            IF speed_variance > 5 THEN
                NEW.suspicious_flags = array_append(NEW.suspicious_flags, 'speed_inconsistency');
                NEW.validation_score = GREATEST(0, NEW.validation_score - 0.2);
            END IF;
        END IF;
        
        -- Marquer comme invalide si le score est trop bas
        IF NEW.validation_score < 0.5 THEN
            NEW.is_valid = FALSE;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_activity_before_insert
    BEFORE INSERT OR UPDATE ON cycling_activities
    FOR EACH ROW EXECUTE FUNCTION validate_activity();

-- Fonction pour mettre à jour les stats utilisateur
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'completed' AND NEW.is_valid THEN
        UPDATE users
        SET 
            total_distance = total_distance + NEW.distance,
            total_activities = total_activities + 1,
            total_tokens_earned = total_tokens_earned + NEW.fix_tokens_earned,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_stats_after_activity
    AFTER INSERT ON cycling_activities
    FOR EACH ROW EXECUTE FUNCTION update_user_stats();

-- =====================================================
-- VUES MATÉRIALISÉES POUR PERFORMANCE
-- =====================================================

-- Vue pour le classement des utilisateurs
CREATE MATERIALIZED VIEW user_leaderboard AS
SELECT 
    u.id,
    u.username,
    u.wallet_address,
    u.avatar_url,
    u.total_distance,
    u.total_activities,
    u.total_tokens_earned,
    RANK() OVER (ORDER BY u.total_distance DESC) as distance_rank,
    RANK() OVER (ORDER BY u.total_tokens_earned DESC) as tokens_rank
FROM users u
WHERE u.is_active = TRUE;

CREATE UNIQUE INDEX idx_leaderboard_user ON user_leaderboard(id);
CREATE INDEX idx_leaderboard_distance ON user_leaderboard(distance_rank);
CREATE INDEX idx_leaderboard_tokens ON user_leaderboard(tokens_rank);

-- Vue pour les statistiques des défis
CREATE MATERIALIZED VIEW challenge_stats AS
SELECT 
    c.id,
    c.name,
    COUNT(DISTINCT cp.user_id) as participant_count,
    AVG(cp.progress) as avg_progress,
    COUNT(DISTINCT cp.user_id) FILTER (WHERE cp.completed = TRUE) as completed_count
FROM challenges c
LEFT JOIN challenge_participants cp ON c.id = cp.challenge_id
GROUP BY c.id, c.name;

CREATE UNIQUE INDEX idx_challenge_stats_id ON challenge_stats(id);

-- =====================================================
-- POLITIQUES DE SÉCURITÉ (Row Level Security)
-- =====================================================

-- Activer RLS sur les tables sensibles
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE nft_bikes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cycling_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;

-- Politique pour les utilisateurs
CREATE POLICY users_select_policy ON users
    FOR SELECT USING (true);

CREATE POLICY users_update_policy ON users
    FOR UPDATE USING (id = current_setting('app.current_user_id')::UUID);

-- Politique pour les vélos NFT
CREATE POLICY bikes_owner_policy ON nft_bikes
    FOR ALL USING (user_id = current_setting('app.current_user_id')::UUID);

-- Politique pour les activités
CREATE POLICY activities_owner_policy ON cycling_activities
    FOR ALL USING (user_id = current_setting('app.current_user_id')::UUID);

-- Politique pour les récompenses
CREATE POLICY rewards_owner_policy ON rewards
    FOR ALL USING (user_id = current_setting('app.current_user_id')::UUID);

-- =====================================================
-- PROCÉDURES STOCKÉES
-- =====================================================

-- Procédure pour créer une activité complète avec validation
CREATE OR REPLACE PROCEDURE create_cycling_activity(
    p_user_id UUID,
    p_bike_id UUID,
    p_distance DECIMAL,
    p_duration INTEGER,
    p_route_data JSONB,
    OUT p_activity_id UUID,
    OUT p_tokens_earned DECIMAL,
    OUT p_is_valid BOOLEAN
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_bike_multiplier DECIMAL;
    v_base_tokens DECIMAL;
BEGIN
    -- Récupérer le multiplicateur du vélo
    SELECT earnings_multiplier INTO v_bike_multiplier
    FROM nft_bikes
    WHERE id = p_bike_id AND user_id = p_user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Vélo non trouvé ou non autorisé';
    END IF;
    
    -- Calculer les tokens de base (0.1 par km)
    v_base_tokens := p_distance * 0.1;
    p_tokens_earned := v_base_tokens * COALESCE(v_bike_multiplier, 1.0);
    
    -- Créer l'activité
    INSERT INTO cycling_activities (
        user_id, bike_id, distance, duration,
        average_speed, fix_tokens_earned, route_data,
        status, started_at, completed_at, validation_score
    ) VALUES (
        p_user_id, p_bike_id, p_distance, p_duration,
        (p_distance / (p_duration / 3600.0)), p_tokens_earned, p_route_data,
        'completed', CURRENT_TIMESTAMP - (p_duration || ' seconds')::INTERVAL,
        CURRENT_TIMESTAMP, 1.0
    ) RETURNING id, is_valid INTO p_activity_id, p_is_valid;
    
    -- Créer la récompense si l'activité est valide
    IF p_is_valid THEN
        INSERT INTO rewards (
            user_id, activity_id, reward_type, amount, description
        ) VALUES (
            p_user_id, p_activity_id, 'activity_completion',
            p_tokens_earned, 'Récompense pour activité cycliste'
        );
        
        -- Mettre à jour le vélo
        UPDATE nft_bikes
        SET last_used_at = CURRENT_TIMESTAMP
        WHERE id = p_bike_id;
    END IF;
    
    COMMIT;
END;
$$;

-- =====================================================
-- JOBS DE MAINTENANCE (avec pg_cron)
-- =====================================================

-- Créer l'extension pg_cron si disponible
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Job pour rafraîchir les vues matérialisées
-- SELECT cron.schedule('refresh-leaderboard', '0 * * * *', 
--     'REFRESH MATERIALIZED VIEW CONCURRENTLY user_leaderboard');

-- Job pour nettoyer les sessions expirées
-- SELECT cron.schedule('cleanup-sessions', '0 0 * * *',
--     'DELETE FROM user_sessions WHERE expires_at < CURRENT_TIMESTAMP');

-- Job pour archiver les vieilles activités
-- SELECT cron.schedule('archive-activities', '0 2 * * 0',
--     'INSERT INTO cycling_activities_archive SELECT * FROM cycling_activities WHERE created_at < CURRENT_DATE - INTERVAL ''6 months''');
