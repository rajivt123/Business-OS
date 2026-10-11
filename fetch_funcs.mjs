import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const QA_EMAIL = process.env.QA_EMAIL;
const QA_PASSWORD = process.env.QA_PASSWORD;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !QA_EMAIL || !QA_PASSWORD) {
  throw new Error(
    'Missing required environment variables: SUPABASE_URL, SUPABASE_ANON_KEY, QA_EMAIL, QA_PASSWORD'
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: QA_EMAIL,
    password: QA_PASSWORD,
  });

  if (signInError) {
    throw new Error(`QA sign-in failed: ${signInError.message}`);
  }

  const funcs = [
    'create_vendor_atomic',
    'create_vendor_quotation_atomic',
    'create_purchase_order_atomic',
    'create_purchase_bill_atomic',
    'create_purchase_bill_with_accounting_atomic',
  ];

  for (const fn of funcs) {
    const { data, error } = await supabase.rpc('pg_get_functiondef', { func_name: fn });
    if (error) {
      console.error(`Error for ${fn}:`, error.message);
    } else {
      console.log(`\\n--- DEFINITION FOR ${fn} ---`);
      console.log(data);
    }
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
