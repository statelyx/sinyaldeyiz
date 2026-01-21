-- Add status message fields to location_status table
ALTER TABLE location_status
ADD COLUMN IF NOT EXISTS status_message TEXT,
ADD COLUMN IF NOT EXISTS status_expires_at TIMESTAMPTZ;

-- Create index for status queries
CREATE INDEX IF NOT EXISTS idx_location_status_status
ON location_status(status_expires_at)
WHERE status_message IS NOT NULL;

-- Add comment
COMMENT ON COLUMN location_status.status_message IS 'Optional status message displayed on map (max 100 chars)';
COMMENT ON COLUMN location_status.status_expires_at IS 'Expiry time for status message (typically 1 hour)';
