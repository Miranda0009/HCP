'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');

const migrationsDir = path.resolve(__dirname, '../supabase/migrations');
// Read-only snapshot of supabase_migrations.schema_migrations on 2026-10-01.
// This is a regression baseline, not a replacement for live migration verification.
const appliedHistory = [
  "20260807015846_add_profile_phone_and_avatar_storage.sql",
  "20260811192535_add_lead_feedback_and_email_lookup.sql",
  "20260811192659_remove_email_lookup_function.sql",
  "20260811201641_make_feedback_user_count_optional.sql",
  "20260812164722_create_client_focus_profiles.sql",
  "20260815144347_monthly_feedback_limits_and_accounts.sql",
  "20260815144703_allow_rls_account_membership_helper.sql",
  "20260815150941_lead_credit_ledger_and_consumption.sql",
  "20260815151200_account_token_balance_rpc.sql",
  "20260905031826_create_adi_flights.sql",
  "20260928225232_create_private_and_shared_crm_boards.sql",
  "20260928234314_add_hcp_usernames_and_invitations.sql"
];
const recoveredSqlMd5 = {
  '20260905031826_create_adi_flights.sql': '4a03d0bb05112760f147484c539dd003',
  '20260928234314_add_hcp_usernames_and_invitations.sql': '9b96716f708bb1a796c33bf78f9dfb98'
};

test('every applied Supabase migration has its original version and filename', () => {
  const files = fs.readdirSync(migrationsDir).filter(name => name.endsWith('.sql'));
  const missing = appliedHistory.filter(name => !files.includes(name));
  assert.deepEqual(missing, [], 'Remote migration versions not found in local migrations directory');
  const historicalFiles = files.filter(name => name.slice(0, 14) <= '20260928234314');
  assert.deepEqual(historicalFiles.sort(), [...appliedHistory].sort(),
    'Historical migrations must not be duplicated under a different version');
});

test('recovered SQL matches the statements actually applied in Supabase', () => {
  for (const [name, expectedMd5] of Object.entries(recoveredSqlMd5)) {
    const sql = fs.readFileSync(path.join(migrationsDir, name), 'utf8')
      .replace(/\r/g, '').replace(/^\n+|\n+$/g, '');
    // MD5 is only a content comparison with PostgreSQL md5(), not a security primitive.
    assert.equal(createHash('md5').update(sql, 'utf8').digest('hex'), expectedMd5, name);
  }
});

test('Supabase migration versions are valid and unique', () => {
  const files = fs.readdirSync(migrationsDir).filter(name => name.endsWith('.sql'));
  for (const name of files) assert.match(name, /^\d{14}_[a-z0-9_]+\.sql$/);
  const versions = files.map(name => name.slice(0, 14));
  assert.equal(new Set(versions).size, versions.length);
});
