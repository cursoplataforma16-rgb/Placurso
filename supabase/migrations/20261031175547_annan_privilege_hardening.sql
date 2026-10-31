revoke all privileges on table public.annan_learning_events from anon, public;
revoke all privileges on table public.annan_learning_events from authenticated;
grant select, insert, update on table public.annan_learning_events to authenticated;

revoke all privileges on table public.annan_student_profiles from anon, public;
revoke all privileges on table public.annan_student_profiles from authenticated;
grant select, insert, update on table public.annan_student_profiles to authenticated;
