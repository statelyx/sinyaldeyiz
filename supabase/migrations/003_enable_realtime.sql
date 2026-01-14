-- Enable Realtime for location_status table
-- This allows instant updates when users go online/offline

ALTER PUBLICATION supabase_realtime ADD TABLE location_status;

-- Add index for better performance on real-time queries
CREATE INDEX IF NOT EXISTS idx_location_status_realtime
  ON location_status(is_visible, expires_at)
  WHERE is_visible = TRUE AND expires_at > NOW();

-- Add comment for documentation
COMMENT ON TABLE location_status IS 'User location visibility status - realtime enabled for instant updates';
