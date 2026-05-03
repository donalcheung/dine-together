-- Triggers an Edge Function email to the admin whenever a new user profile is created.
--
-- Before running this migration, store your webhook secret in the database:
--   Run once in the Supabase SQL editor:
--     ALTER DATABASE postgres SET app.new_user_webhook_secret = '<your-secret>';
--   Then in the Edge Function dashboard, set NEW_USER_WEBHOOK_SECRET to the same value.

create extension if not exists pg_net schema extensions;

create or replace function notify_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  perform net.http_post(
    url     := 'https://hyhegzrmeewjlevtslbk.supabase.co/functions/v1/notify-new-user',
    headers := jsonb_build_object(
      'Content-Type',    'application/json',
      'x-webhook-secret', current_setting('app.new_user_webhook_secret', true)
    ),
    body    := jsonb_build_object('record', row_to_json(new))
  );
  return new;
end;
$$;

drop trigger if exists on_new_user_notify on public.profiles;

create trigger on_new_user_notify
  after insert on public.profiles
  for each row
  execute function notify_new_user();
