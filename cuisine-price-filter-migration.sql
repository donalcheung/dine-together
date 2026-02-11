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

-- ============================================================================
-- BACKFILLING EXISTING REQUESTS (Optional)
-- ============================================================================
-- To update existing requests with cuisine and price data:
-- 1. Add a BACKFILL_SECRET environment variable to your .env.local file
-- 2. Make a POST request to: /api/backfill-restaurant-data?secret=YOUR_SECRET
-- 3. The API will process up to 100 requests at a time
-- 4. Repeat the request until all requests are updated
--
-- Example using curl:
-- curl -X POST "http://localhost:3000/api/backfill-restaurant-data?secret=YOUR_SECRET"
--
-- Or create a simple button in your admin panel to trigger this endpoint.
