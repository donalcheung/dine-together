-- Track authenticated user page visits for admin analytics
CREATE TABLE IF NOT EXISTS page_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  page TEXT NOT NULL,
  page_params JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_page_events_user_id ON page_events(user_id);
CREATE INDEX IF NOT EXISTS idx_page_events_page ON page_events(page);
CREATE INDEX IF NOT EXISTS idx_page_events_created_at ON page_events(created_at DESC);

ALTER TABLE page_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own page events"
  ON page_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all page events"
  ON page_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
