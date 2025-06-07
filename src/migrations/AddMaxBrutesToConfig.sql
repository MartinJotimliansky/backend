-- Migration: Add max_brutes field to backoffice_brutes table
-- Date: 2025-06-05
-- Description: Adds configurable maximum number of brutes per user

-- Add the max_brutes column with default value of 5
ALTER TABLE backoffice_brutes 
ADD COLUMN max_brutes INTEGER DEFAULT 5 NOT NULL;

-- Update any existing configuration record to have max_brutes = 50
UPDATE backoffice_brutes 
SET max_brutes = 50
WHERE max_brutes = 5;

-- Verify the change
SELECT * FROM backoffice_brutes;
