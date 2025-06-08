-- This script ensures the uploads directory exists
-- Run this after setting up the project

-- Create uploads directory (this will be handled by the Node.js code)
-- The directory will be created automatically when the first file is uploaded

-- Update existing users to have proper referral codes if they don't exist
UPDATE users 
SET referral_code = CONCAT('USER', LPAD(CAST(EXTRACT(EPOCH FROM created_at) AS TEXT), 6, '0'))
WHERE referral_code IS NULL OR referral_code = '';

-- Ensure all users have proper verification status based on payment proofs
UPDATE users 
SET is_verified = true 
WHERE id IN (
  SELECT DISTINCT user_id 
  FROM payment_proofs 
  WHERE status = 'approved'
);
