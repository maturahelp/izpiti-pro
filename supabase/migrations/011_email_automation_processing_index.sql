-- Helps the email runner recover jobs left in processing after a timeout.

create index if not exists email_automation_jobs_processing_started_idx
  on public.email_automation_jobs (processing_started_at)
  where status = 'processing';
