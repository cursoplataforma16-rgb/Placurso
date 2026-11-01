-- Phase 10.4: allow the CEO bootstrap audit object type used by annan-growth.
alter table public.growth_audit_log
  drop constraint if exists growth_audit_log_object_type_check;

alter table public.growth_audit_log
  add constraint growth_audit_log_object_type_check
  check (object_type = any (array[
    'account'::text,
    'campaign'::text,
    'content'::text,
    'approval'::text,
    'publication'::text,
    'metric'::text,
    'ceo_identity'::text
  ]));
