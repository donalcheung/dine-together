-- Requires pg_net (enabled by default on Supabase) and pg_cron (enable in Dashboard → Extensions).
--
-- Before running this migration, store your CRON_SECRET in the database so pg_cron can pass it:
--   Run once in the Supabase SQL editor:
--     ALTER DATABASE postgres SET app.cron_secret = '<your-CRON_SECRET-value>';
--   Then disconnect/reconnect for the setting to take effect.

create extension if not exists pg_net schema extensions;

-- Remove old job if it exists (safe no-op if not present)
do $$
begin
  perform cron.unschedule('send-guest-reminders');
exception when others then null;
end;
$$;

-- Call the Edge Function every hour to send 24-hour-ahead dining reminders
select cron.schedule(
  'send-guest-reminders',
  '0 * * * *',
  $$
  select net.http_post(
    url     := 'https://hyhegzrmeewjlevtslbk.supabase.co/functions/v1/send-reminders',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'x-cron-secret', current_setting('app.cron_secret', true)
    ),
    body    := '{}'::jsonb
  )
  $$
);
