import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf-8');
const env = Object.fromEntries(envFile.split('\n').filter(line => line.includes('=')).map(line => {
  const [key, ...val] = line.split('=');
  return [key.trim(), val.join('=').trim().replace(/(^"|"$)/g, '')];
}));

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.from('file_attachments').select('*').limit(5).order('created_at', { ascending: false });
  console.log("Attachments:", JSON.stringify(data, null, 2));
}
run();
