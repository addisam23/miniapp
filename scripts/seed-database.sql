-- Create initial admin user
INSERT INTO users (id, email, name, password, role, referral_code, created_at, updated_at)
VALUES (
  'admin-001',
  'admin@safon.com',
  'Admin User',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9S2', -- password: admin123
  'admin',
  'ADMIN001',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Create sample users
INSERT INTO users (id, email, name, password, role, referral_code, balance, total_earnings, created_at, updated_at)
VALUES 
  ('user-001', 'john@example.com', 'John Doe', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9S2', 'user', 'USER001', 2500.00, 3200.00, NOW(), NOW()),
  ('user-002', 'sara@example.com', 'Sara Smith', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9S2', 'user', 'USER002', 1800.00, 2400.00, NOW(), NOW()),
  ('user-003', 'mike@example.com', 'Mike Johnson', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9S2', 'user', 'USER003', 3200.00, 4100.00, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Create sample referrals
INSERT INTO referrals (id, referrer_id, referred_id, status, reward, created_at, updated_at)
VALUES 
  ('ref-001', 'user-001', 'user-002', 'completed', 50.00, NOW() - INTERVAL '10 days', NOW()),
  ('ref-002', 'user-001', 'user-003', 'completed', 50.00, NOW() - INTERVAL '5 days', NOW()),
  ('ref-003', 'user-002', 'user-003', 'pending', 0.00, NOW() - INTERVAL '2 days', NOW())
ON CONFLICT (referrer_id, referred_id) DO NOTHING;

-- Create sample withdraw requests
INSERT INTO withdraw_requests (id, user_id, method, amount, account_info, status, created_at, updated_at)
VALUES 
  ('withdraw-001', 'user-001', 'telebirr', 500.00, '+251911234567', 'completed', NOW() - INTERVAL '3 days', NOW()),
  ('withdraw-002', 'user-002', 'cbe', 300.00, '1234567890', 'pending', NOW() - INTERVAL '1 day', NOW())
ON CONFLICT (id) DO NOTHING;

-- Create sample payment proofs
INSERT INTO payment_proofs (id, user_id, image_url, status, admin_id, admin_note, created_at, updated_at)
VALUES 
  ('proof-001', 'user-001', '/uploads/sample-payment-1.jpg', 'approved', 'admin-001', 'Payment verified successfully', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days'),
  ('proof-002', 'user-002', '/uploads/sample-payment-2.jpg', 'pending', NULL, NULL, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  ('proof-003', 'user-003', '/uploads/sample-payment-3.jpg', 'rejected', 'admin-001', 'Payment amount does not match required amount', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

-- Update user verification status for approved payments
UPDATE users SET is_verified = true WHERE id = 'user-001';
