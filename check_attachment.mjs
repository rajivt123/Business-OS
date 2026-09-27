import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkAttachment() {
  const { data, error } = await supabase
    .from('file_attachments')
    .select('id, file_name, tenant_company_id, entity_type, entity_id')
    .eq('id', '47c95267-ad0a-45a5-8699-cd3373775874')
    .maybeSingle();

  console.log('Result:', { data, error });
  
  if (data) {
    const { data: edgeData, error: edgeError } = await supabase.functions.invoke('business-file-storage', {
      body: {
        action: 'create-download-url',
        attachment_id: '47c95267-ad0a-45a5-8699-cd3373775874'
      }
    });
    console.log('Edge Result:', { edgeData, edgeError: edgeError?.message || edgeError });
  }
}
checkAttachment();
