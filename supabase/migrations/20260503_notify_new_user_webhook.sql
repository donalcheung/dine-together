-- Triggers an Edge Function email to the admin whenever a new user profile is created.
-- NEW_USER_WEBHOOK_SECRET must be set in the Edge Function's secrets dashboard.

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
      'Content-Type',     'application/json',
      'x-webhook-secret', 'df47759d18c10871ee56ee3718acf90df6e0b1108ba2cbe8f9b2d9cd10405bd4'
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
