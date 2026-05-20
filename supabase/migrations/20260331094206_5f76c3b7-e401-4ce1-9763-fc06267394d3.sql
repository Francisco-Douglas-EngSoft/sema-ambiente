
-- Update profile position
UPDATE profiles SET position = 'Desenvolvedor' WHERE user_id = 'cf2bb93e-51c5-46db-8f1e-4e905305cab3';

-- Assign admin role
INSERT INTO user_roles (user_id, role) VALUES ('cf2bb93e-51c5-46db-8f1e-4e905305cab3', 'admin') ON CONFLICT (user_id, role) DO NOTHING;
