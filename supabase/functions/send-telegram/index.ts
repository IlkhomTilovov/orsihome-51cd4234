import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TelegramRequest {
  type: 'test' | 'order' | 'setup_webapp';
  webapp_url?: string;
  webapp_button_text?: string;
  order_data?: {
    order_number: string;
    customer_name: string;
    customer_phone: string;
    customer_message?: string;
    total_price: number;
    items: Array<{
      product_name: string;
      quantity: number;
      price: number;
      selected_options?: {
        size?: string;
        color?: string;
      };
    }>;
  };
}

async function tgApi(botToken: string, method: string, payload: any) {
  const res = await fetch(`https://api.telegram.org/bot${botToken}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.description || `Telegram ${method} xatoligi`);
  return data;
}


async function getTelegramSettings(supabase: any) {
  const { data, error } = await supabase
    .from('settings')
    .select('key, value')
    .in('key', ['telegram_bot_token', 'telegram_chat_id', 'telegram_enabled']);

  if (error) {
    console.error('Error fetching telegram settings:', error);
    throw new Error('Telegram sozlamalarini yuklashda xatolik');
  }

  const settings: Record<string, string> = {};
  data?.forEach((item: any) => {
    settings[item.key] = item.value || '';
  });

  return {
    bot_token: settings['telegram_bot_token'] || '',
    chat_id: settings['telegram_chat_id'] || '',
    enabled: settings['telegram_enabled'] === 'true',
  };
}



function formatOrderMessage(orderData: TelegramRequest['order_data']) {
  if (!orderData) return '';

  const itemsList = orderData.items.map(item => {
    let line = `• ${item.product_name} x${item.quantity}`;
    if (item.selected_options?.size || item.selected_options?.color) {
      const options = [];
      if (item.selected_options.size) options.push(`O'lcham: ${item.selected_options.size}`);
      if (item.selected_options.color) options.push(`Rang: ${item.selected_options.color}`);
      line += ` (${options.join(', ')})`;
    }
    line += ` - ${new Intl.NumberFormat('uz-UZ').format(item.price * item.quantity)} so'm`;
    return line;
  }).join('\n');

  const message = `
🛒 *Yangi buyurtma!*

📋 *Buyurtma:* ${orderData.order_number}
👤 *Mijoz:* ${orderData.customer_name}
📞 *Telefon:* ${orderData.customer_phone}

*Mahsulotlar:*
${itemsList}

💰 *Jami:* ${new Intl.NumberFormat('uz-UZ').format(orderData.total_price)} so'm
${orderData.customer_message ? `\n💬 *Xabar:* ${orderData.customer_message}` : ''}
  `.trim();

  return message;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: TelegramRequest = await req.json();
    console.log('Telegram request type:', body.type);

    // Get Telegram settings from database
    const settings = await getTelegramSettings(supabase);
    console.log('Telegram enabled:', settings.enabled);

    // Validate settings
    if (!settings.bot_token) {
      return new Response(
        JSON.stringify({ success: false, error: 'Bot token sozlanmagan' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate bot token format (basic check)
    if (!/^\d+:[A-Za-z0-9_-]+$/.test(settings.bot_token)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Bot token formati noto\'g\'ri' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle Web App setup separately (no chat_id needed)
    if (body.type === 'setup_webapp') {

      const url = body.webapp_url?.trim();
      if (!url || !/^https:\/\//.test(url)) {
        return new Response(
          JSON.stringify({ success: false, error: 'Web App URL HTTPS bilan boshlanishi kerak' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const buttonText = body.webapp_button_text?.trim() || 'Do\'konni ochish';

      // Set the bot's default chat menu button to open the Web App
      await tgApi(settings.bot_token, 'setChatMenuButton', {
        menu_button: {
          type: 'web_app',
          text: buttonText,
          web_app: { url },
        },
      });

      // Set basic commands
      await tgApi(settings.bot_token, 'setMyCommands', {
        commands: [
          { command: 'start', description: 'Do\'konni ochish' },
          { command: 'help', description: 'Yordam' },
        ],
      });

      const me = await tgApi(settings.bot_token, 'getMe', {});

      return new Response(
        JSON.stringify({ success: true, bot: me.result, webapp_url: url }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!settings.chat_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'Chat ID sozlanmagan' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let message: string;


    if (body.type === 'test') {
      // Check if enabled for test messages too
      if (!settings.enabled) {
        return new Response(
          JSON.stringify({ success: false, error: 'Telegram xabarlari yoqilmagan. Avval "Telegram xabarlarini yoqish" tugmasini yoqing.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      message = '✅ *Test xabar*\n\nMebel do\'koni admin paneli bilan aloqa muvaffaqiyatli o\'rnatildi!\n\nBuyurtmalar haqida xabarlar shu chatga keladi.';
    } else if (body.type === 'order') {
      if (!body.order_data) {
        return new Response(
          JSON.stringify({ success: false, error: 'Buyurtma ma\'lumotlari yo\'q' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      message = formatOrderMessage(body.order_data);
    } else {
      return new Response(
        JSON.stringify({ success: false, error: 'Noto\'g\'ri so\'rov turi' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send the message
    await tgApi(settings.bot_token, 'sendMessage', {
      chat_id: settings.chat_id,
      text: message,
      parse_mode: 'Markdown',
    });
    console.log('Telegram message sent successfully');



    return new Response(
      JSON.stringify({ success: true, message: 'Xabar yuborildi' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Telegram error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Xatolik yuz berdi' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
