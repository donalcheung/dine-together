-- Migration: Add cuisine_type and price_level columns to dining_requests table
-- Run this in your Supabase SQL Editor to add the new filter columns

-- Add the new columns
ALTER TABLE dining_requests 
ADD COLUMN IF NOT EXISTS price_level TEXT,
ADD COLUMN IF NOT EXISTS cuisine_type TEXT;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_dining_requests_price_level ON dining_requests(price_level);
CREATE INDEX IF NOT EXISTS idx_dining_requests_cuisine_type ON dining_requests(cuisine_type);

-- Done! The new columns are now available for filtering.
-- Existing requests will have NULL values for these fields.
-- New requests created after this migration will automatically populate these fields.
