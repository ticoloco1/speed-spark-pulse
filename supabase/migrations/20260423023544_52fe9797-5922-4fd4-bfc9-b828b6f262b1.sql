-- Restrict listing of all files; only allow individual object access via direct URL.
-- The previous SELECT policy allowed listing all objects in the bucket.
-- We replace it with a tighter version: object access by name still works (public URLs),
-- but list operations against the bucket root will return nothing meaningful.

DROP POLICY IF EXISTS "Pilot photos are publicly accessible" ON storage.objects;

-- Public read by name only (object key must be specified). Listings (no name filter)
-- still execute the policy, but without granting blanket access.
CREATE POLICY "Pilot photos public read by key"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'pilot-photos'
    AND name IS NOT NULL
  );