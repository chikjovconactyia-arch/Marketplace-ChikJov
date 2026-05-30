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
  const testEmail = "teste_auth_" + Date.now() + "@gmail.com";
  console.log(`Criando usuario: ${testEmail}`);
  
  const { data, error } = await adminClient.auth.admin.createUser({
    email: testEmail,
    password: "password123",
    email_confirm: true,
    phone_confirm: true
  });
  
  if (error) {
    console.error("Erro no createUser:", error);
    return;
  }
  
  console.log("Usuario criado com sucesso:", data.user.id);
  
  // Buscar o usuario recem criado para ver o confirmed_at
  const { data: fetchUser, error: fetchErr } = await adminClient.auth.admin.getUserById(data.user.id);
  
  console.log("Status de confirmação:");
  console.log("email_confirmed_at:", fetchUser.user.email_confirmed_at);
  console.log("email_confirm (via object)?", fetchUser.user.email_confirm);
  
  // Apagar usuario
  await adminClient.auth.admin.deleteUser(data.user.id);
}

main().catch(console.error);
