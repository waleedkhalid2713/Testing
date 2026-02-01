-- Silence linter: explicit deny-all policies (table is backend-function only)
DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'email_verification_codes'
      AND policyname = 'email_verification_codes_deny_all_select'
  ) THEN
    EXECUTE $pol$
      CREATE POLICY email_verification_codes_deny_all_select
      ON public.email_verification_codes
      FOR SELECT
      USING (false)
    $pol$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'email_verification_codes'
      AND policyname = 'email_verification_codes_deny_all_insert'
  ) THEN
    EXECUTE $pol$
      CREATE POLICY email_verification_codes_deny_all_insert
      ON public.email_verification_codes
      FOR INSERT
      WITH CHECK (false)
    $pol$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'email_verification_codes'
      AND policyname = 'email_verification_codes_deny_all_update'
  ) THEN
    EXECUTE $pol$
      CREATE POLICY email_verification_codes_deny_all_update
      ON public.email_verification_codes
      FOR UPDATE
      USING (false)
    $pol$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'email_verification_codes'
      AND policyname = 'email_verification_codes_deny_all_delete'
  ) THEN
    EXECUTE $pol$
      CREATE POLICY email_verification_codes_deny_all_delete
      ON public.email_verification_codes
      FOR DELETE
      USING (false)
    $pol$;
  END IF;
END
$do$;
