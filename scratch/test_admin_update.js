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
  const testEmail = "teste_auth_update_" + Date.now() + "@gmail.com";
  console.log(`Criando usuario com invite: ${testEmail}`);
  
  // Cria usuario via invite (email_confirmed: false)
  const { data: invited, error } = await adminClient.auth.admin.inviteUserByEmail(testEmail);
  const userId = invited.user.id;
  
  console.log("Usuario convidado com sucesso:", userId);
  
  // Agora tenta atualizar ele com updateUserById passando email_confirm: true
  const { data: updated, error: updateErr } = await adminClient.auth.admin.updateUserById(userId, {
    password: "newpassword123",
    email_confirm: true
  });
  
  if (updateErr) console.error("Erro update:", updateErr);
  
  // Buscar o usuario recem criado para ver o confirmed_at
  const { data: fetchUser } = await adminClient.auth.admin.getUserById(userId);
  
  console.log("Status de confirmação apos UPDATE:");
  console.log("email_confirmed_at:", fetchUser.user.email_confirmed_at);
  console.log("last_sign_in_at:", fetchUser.user.last_sign_in_at);
  
  // Apagar usuario
  await adminClient.auth.admin.deleteUser(userId);
}

main().catch(console.error);
