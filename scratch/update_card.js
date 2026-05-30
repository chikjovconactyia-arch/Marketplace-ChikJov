const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Faltando NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY no ambiente");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const cardId = "58777afb-192a-44ba-a71b-d212e3901f8b";
  const newCtaLink = "/dashboard/cliente/meus-vouchers";

  console.log(`Atualizando card ${cardId} ('Meus Vouchers') para o link '${newCtaLink}'...`);

  const { data, error } = await supabase
    .from('home_cards')
    .update({ cta_link: newCtaLink })
    .eq('id', cardId)
    .select();

  if (error) {
    console.error("Erro ao atualizar o card:", error);
  } else {
    console.log("Card atualizado com sucesso!");
    console.log(JSON.stringify(data, null, 2));
  }
}

run();
