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

const adminClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function main() {
  const testEmail = "teste_duplicate_" + Date.now() + "@gmail.com";
  console.log(`[Passo 1] Convidando usuario (simulando subscription.created)`);
  const { data: invited } = await adminClient.auth.admin.inviteUserByEmail(testEmail);
  const userId = invited.user.id;
  
  console.log(`[Passo 2] Chamando createUser com senha (simulando checkout.completed)`);
  const { data, error } = await adminClient.auth.admin.createUser({
    email: testEmail,
    password: "password123"
  });
  
  if (error) {
    console.error("ERRO DO CREATE USER:");
    console.error(error.message);
    console.error(JSON.stringify(error, null, 2));
  } else {
    console.log("CRIADO (o que nao deveria acontecer)?!");
  }
  
  // Limpar
  await adminClient.auth.admin.deleteUser(userId);
}

main().catch(console.error);
