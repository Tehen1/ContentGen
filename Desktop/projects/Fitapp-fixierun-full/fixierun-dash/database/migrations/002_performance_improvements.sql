-- =====================================================
-- AMÉLIORATIONS DE PERFORMANCE POUR FIXIE.RUN
-- =====================================================

-- Extension pour l'analyse de performance
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Optimisation des index existants
DROP INDEX IF EXISTS idx_activities_user_id;
DROP INDEX IF EXISTS idx_activities_created_at;
DROP INDEX IF EXISTS idx_nft_bikes_user_id;
DROP INDEX IF EXISTS idx_rewards_user_id;
DROP INDEX IF EXISTS idx_comments_user_id;

-- Index optimisés avec INCLUDE pour réduire les lookups
CREATE INDEX idx_activities_user_id_optimized ON cycling_activities(user_id)
INCLUDE (distance, duration, fix_tokens_earned, created_at)
WHERE is_valid = TRUE;

CREATE INDEX idx_activities_date_range ON cycling_activities(created_at)
WHERE created_at > CURRENT_DATE - INTERVAL '30 days';

CREATE INDEX idx_nft_bikes_user_stats ON nft_bikes(user_id)
INCLUDE (level, rarity, earnings_multiplier)
WHERE is_equipped = TRUE;

-- Optimisation des requêtes fréquentes avec des vues matérialisées
CREATE MATERIALIZED VIEW IF NOT EXISTS user_activity_stats AS
SELECT 
    user_id,
    COUNT(*) as total_activities,
    SUM(distance) as total_distance,
    SUM(duration) as total_duration,
    SUM(calories_burned) as total_calories,
    SUM(fix_tokens_earned) as total_tokens,
    MAX(created_at) as last_activity_date
FROM cycling_activities
WHERE is_valid = TRUE
GROUP BY user_id;

CREATE UNIQUE INDEX idx_user_activity_stats ON user_activity_stats(user_id);

-- Vue pour le classement hebdomadaire
CREATE MATERIALIZED VIEW IF NOT EXISTS weekly_leaderboard AS
SELECT 
    u.id as user_id,
    u.username,
    u.wallet_address,
    COALESCE(SUM(ca.distance), 0) as weekly_distance,
    COALESCE(SUM(ca.fix_tokens_earned), 0) as weekly_tokens,
    COUNT(DISTINCT ca.id) as weekly_activities
FROM users u
LEFT JOIN cycling_activities ca ON u.id = ca.user_id
    AND ca.created_at > CURRENT_DATE - INTERVAL '7 days'
    AND ca.is_valid = TRUE
GROUP BY u.id, u.username, u.wallet_address
ORDER BY weekly_distance DESC;

CREATE UNIQUE INDEX idx_weekly_leaderboard ON weekly_leaderboard(user_id);

-- Optimisation des requêtes de recherche
CREATE INDEX idx_users_username_search ON users USING gin(username gin_trgm_ops);
CREATE INDEX idx_nft_bikes_name_search ON nft_bikes USING gin(name gin_trgm_ops);

-- Ajout de statistiques étendues pour l'optimiseur
CREATE STATISTICS IF NOT EXISTS user_activity_stats (dependencies) 
ON user_id, created_at FROM cycling_activities;

CREATE STATISTICS IF NOT EXISTS bike_stats (dependencies)
ON user_id, rarity, level FROM nft_bikes;

-- Optimisation des requêtes JSON
CREATE INDEX idx_activities_route_data ON cycling_activities USING gin(route_data);
CREATE INDEX idx_nft_bikes_metadata ON nft_bikes USING gin(metadata);

-- Procédure pour rafraîchir les vues matérialisées
CREATE OR REPLACE PROCEDURE refresh_materialized_views()
LANGUAGE plpgsql
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY user_activity_stats;
    REFRESH MATERIALIZED VIEW CONCURRENTLY weekly_leaderboard;
    REFRESH MATERIALIZED VIEW CONCURRENTLY user_leaderboard;
    REFRESH MATERIALIZED VIEW CONCURRENTLY challenge_stats;
END;
$$;
