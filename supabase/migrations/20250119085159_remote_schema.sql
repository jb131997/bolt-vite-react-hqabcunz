set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    gym_name
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'gym_name', NULL)
  );
  RETURN new;
END;
$function$
;

create policy "Gym owners can read their members' activities"
on "public"."member_activities"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM members
  WHERE ((members.id = member_activities.member_id) AND (members.gym_id = auth.uid())))));


CREATE TRIGGER "create-connect-account" AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION supabase_functions.http_request('https://csudvzeumqvhxllbcsrl.supabase.co/functions/v1/create-connect-account', 'POST', '{"Content-type":"application/json"}', '{}', '5000');


