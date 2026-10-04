import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = 'https://ppffvhqzlufuutazvbhx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwZmZ2aHF6bHVmdXV0YXp2Ymh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxODQyNDgsImV4cCI6MjEwMzc2MDI0OH0.F64A3iiDPasvTHHLKyDBQUD4sXborBfgV93Kj4NZCIQ';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
  await supabase.auth.signInWithPassword({
    email: 'qa.inventory.1789372561809@technofire.co.in',
    password: 'Password123!'
  });

  const funcs = [
    'create_vendor_atomic',
    'create_vendor_quotation_atomic',
    'create_purchase_order_atomic',
    'create_purchase_bill_atomic',
    'create_purchase_bill_with_accounting_atomic'
  ];

  for (const fn of funcs) {
    const { data, error } = await supabase.rpc('pg_get_functiondef', { func_name: fn });
    if (error) {
      console.error(`Error for ${fn}:`, error.message);
    } else {
      console.log(`\n--- DEFINITION FOR ${fn} ---`);
      console.log(data);
    }
  }
}
run();
