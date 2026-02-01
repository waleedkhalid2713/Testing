-- Email verification codes (user signup OTP)
CREATE TABLE IF NOT EXISTS public.email_verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  purpose TEXT NOT NULL DEFAULT 'signup',
  code_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_verification_codes_email_created_at
  ON public.email_verification_codes (email, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_verification_codes_expires_at
  ON public.email_verification_codes (expires_at);

ALTER TABLE public.email_verification_codes ENABLE ROW LEVEL SECURITY;

-- No RLS policies on purpose: table is only accessed via backend functions using service role.
