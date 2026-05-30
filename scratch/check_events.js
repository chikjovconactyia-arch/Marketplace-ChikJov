const Stripe = require('stripe');
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

const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

async function checkWebhooks() {
  console.log("Checando ultimos eventos de Checkout Session no Stripe...");
  
  // Buscar as últimas 3 sessões de checkout completadas
  const events = await stripe.events.list({
    type: 'checkout.session.completed',
    limit: 3
  });

  if (events.data.length === 0) {
    console.log("Nenhum evento de checkout recente.");
    return;
  }

  for (const event of events.data) {
    const session = event.data.object;
    console.log(`\n--- Evento ID: ${event.id} | Criado em: ${new Date(event.created * 1000).toLocaleString()}`);
    console.log(`Customer: ${session.customer_details?.email}`);
    console.log(`Custom Fields:`, JSON.stringify(session.custom_fields, null, 2));
  }

  // Verificar se teve falha de webhook delivery
  console.log("\nChecando os logs de entrega dos Webhooks (Webhook Endpoints)...");
  // A API de events do Stripe só diz que ocorreu. Para saber se falhou na entrega local, não temos acesso fácil via API pública do Stripe sem um endpoint id.
  // Vamos ler os logs de erro do Supabase das ultimas 1 hora para ver se estourou erro de trigger ou banco.
}

checkWebhooks().catch(console.error);
