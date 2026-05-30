const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.substring(1, value.length - 1);
    else if (value.startsWith("'") && value.endsWith("'")) value = value.substring(1, value.length - 1);
    env[key] = value.trim();
  }
});

// Admin Client para gerenciar usuários
const adminClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function main() {
  console.log("Consultando ultimos usuarios criados no Supabase...");
  const { data, error } = await adminClient.auth.admin.listUsers();
  
  if (error) {
    console.error("Erro ao listar:", error);
    return;
  }

  const users = data.users.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const recent = users.slice(0, 3);
  
  recent.forEach(u => {
    console.log(`\nUser: ${u.email}`);
    console.log(`Criado em: ${u.created_at}`);
    console.log(`Email Confirmado: ${u.email_confirmed_at ? "Sim" : "Não"}`);
    console.log(`Metadata:`, u.user_metadata);
  });
}

main().catch(console.error);
