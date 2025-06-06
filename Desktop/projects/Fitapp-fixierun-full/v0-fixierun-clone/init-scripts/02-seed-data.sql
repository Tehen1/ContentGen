-- Insert sample users
INSERT INTO users (id, name, email, level, experience, experience_to_next_level, token_balance, streak_days, weekly_distance, weekly_calories, avatar_url)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'John Doe', 'john@example.com', 42, 8750, 10000, 1250, 5, 87.5, 4250, 'https://randomuser.me/api/portraits/men/1.jpg'),
  ('00000000-0000-0000-0000-000000000002', 'Jane Smith', 'jane@example.com', 28, 5600, 8000, 980, 3, 65.2, 3100, 'https://randomuser.me/api/portraits/women/2.jpg'),
  ('00000000-0000-0000-0000-000000000003', 'Mike Johnson', 'mike@example.com', 15, 2300, 5000, 450, 1, 32.8, 1800, 'https://randomuser.me/api/portraits/men/3.jpg');

-- Insert sample NFTs
INSERT INTO nfts (user_id, name, image_url, rarity, level, boost_type, boost_amount)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Neon Velocity X9', '/futuristic-neon-bike.png', 'Legendary', 42, 'earnings', 35),
  ('00000000-0000-0000-0000-000000000002', 'Quantum Cruiser', '/quantum-cruiser.png', 'Epic', 28, 'speed', 25),
  ('00000000-0000-0000-0000-000000000003', 'Eco Rider', '/eco-rider.png', 'Rare', 15, 'endurance', 15);

-- Insert sample activities
INSERT INTO activities (user_id, activity_type, distance, duration, calories, tokens_earned, start_time, end_time)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'cycling', 12.4, 3600, 450, 125, NOW() - INTERVAL '1 day', NOW() - INTERVAL '23 hours'),
  ('00000000-0000-0000-0000-000000000001', 'cycling', 8.7, 2400, 320, 85, NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days 23 hours'),
  ('00000000-0000-0000-0000-000000000002', 'cycling', 10.2, 3000, 380, 95, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day 23 hours'),
  ('00000000-0000-0000-0000-000000000003', 'cycling', 5.6, 1800, 210, 45, NOW() - INTERVAL '1 day', NOW() - INTERVAL '23.5 hours');

-- Insert sample challenges
INSERT INTO challenges (name, description, type, target_value, reward_tokens, start_date, end_date)
VALUES
  ('Daily Streak', '5 days in a row', 'streak', 5, 15, NOW() - INTERVAL '10 days', NOW() + INTERVAL '20 days'),
  ('Distance Milestone', 'Reach 100km this week', 'distance', 100, 50, NOW() - INTERVAL '5 days', NOW() + INTERVAL '2 days'),
  ('Community Challenge', 'Top 100 in city leaderboard', 'leaderboard', 100, 25, NOW() - INTERVAL '3 days', NOW() + INTERVAL '4 days');

-- Insert sample challenge participants
INSERT INTO challenge_participants (challenge_id, user_id, current_value, completed)
VALUES
  ((SELECT id FROM challenges WHERE name = 'Daily Streak'), '00000000-0000-0000-0000-000000000001', 5, TRUE),
  ((SELECT id FROM challenges WHERE name = 'Distance Milestone'), '00000000-0000-0000-0000-000000000001', 100, TRUE),
  ((SELECT id FROM challenges WHERE name = 'Community Challenge'), '00000000-0000-0000-0000-000000000001', 42, TRUE),
  ((SELECT id FROM challenges WHERE name = 'Daily Streak'), '00000000-0000-0000-0000-000000000002', 3, FALSE),
  ((SELECT id FROM challenges WHERE name = 'Distance Milestone'), '00000000-0000-0000-0000-000000000002', 65.2, FALSE),
  ((SELECT id FROM challenges WHERE name = 'Daily Streak'), '00000000-0000-0000-0000-000000000003', 1, FALSE);

-- Insert sample token transactions
INSERT INTO token_transactions (user_id, amount, transaction_type, description)
VALUES
  ('00000000-0000-0000-0000-000000000001', 15, 'reward', 'Daily Streak Completion'),
  ('00000000-0000-0000-0000-000000000001', 50, 'reward', 'Distance Milestone Completion'),
  ('00000000-0000-0000-0000-000000000001', 25, 'reward', 'Community Challenge Completion'),
  ('00000000-0000-0000-0000-000000000001', 125, 'reward', 'Activity Completion'),
  ('00000000-0000-0000-0000-000000000001', 85, 'reward', 'Activity Completion'),
  ('00000000-0000-0000-0000-000000000002', 95, 'reward', 'Activity Completion'),
  ('00000000-0000-0000-0000-000000000003', 45, 'reward', 'Activity Completion');

-- Insert user settings
INSERT INTO user_settings (user_id, menu_position, theme)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'top', 'light'),
  ('00000000-0000-0000-0000-000000000002', 'bottom', 'dark'),
  ('00000000-0000-0000-0000-000000000003', 'top', 'system');
