-- AmoCRM leads created from orders currently only carry the order number and price —
-- the manager can't see which furniture was ordered without opening the order in the site.
-- Add the item list (name, qty, selected size/color) straight into the Lead name so it's
-- visible immediately on the amoCRM kanban card, no extra API round trip needed.

create or replace function public.notify_amocrm_new_order()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_domain text;
  v_token text;
  v_enabled text;
  v_order_id uuid;
  v_order_number text;
  v_customer_name text;
  v_customer_phone text;
  v_total_price numeric;
  v_items_text text;
  v_lead_name text;
  v_payload jsonb;
begin
  begin
    select value into v_enabled from public.settings where key = 'amocrm_enabled';
    if v_enabled is distinct from 'true' then
      return null;
    end if;

    select value into v_domain from public.settings where key = 'amocrm_domain';
    select value into v_token from public.settings where key = 'amocrm_access_token';

    if v_domain is null or v_domain = '' or v_token is null or v_token = '' then
      return null;
    end if;

    select order_id into v_order_id from new_table limit 1;
    if v_order_id is null then
      return null;
    end if;

    select order_number, customer_name, customer_phone, total_price
      into v_order_number, v_customer_name, v_customer_phone, v_total_price
      from public.orders
      where id = v_order_id;

    if v_order_number is null then
      return null;
    end if;

    select string_agg(
      oi.product_name_snapshot || ' x' || oi.quantity ||
      case
        when coalesce(oi.selected_options->>'size', '') <> '' or coalesce(oi.selected_options->>'color', '') <> ''
        then ' (' || array_to_string(
          array_remove(
            array[
              nullif(oi.selected_options->>'size', ''),
              nullif(oi.selected_options->>'color', '')
            ],
            null
          ),
          ', '
        ) || ')'
        else ''
      end,
      ', '
      order by oi.created_at
    )
      into v_items_text
      from public.order_items oi
      where oi.order_id = v_order_id;

    v_lead_name := 'Buyurtma ' || v_order_number || case when v_items_text is not null then ': ' || v_items_text else '' end;
    v_lead_name := left(v_lead_name, 250);

    v_payload := jsonb_build_array(
      jsonb_build_object(
        'name', v_lead_name,
        'price', round(coalesce(v_total_price, 0)),
        '_embedded', jsonb_build_object(
          'contacts', jsonb_build_array(
            jsonb_build_object(
              'name', v_customer_name,
              'custom_fields_values', jsonb_build_array(
                jsonb_build_object(
                  'field_code', 'PHONE',
                  'values', jsonb_build_array(jsonb_build_object('value', v_customer_phone))
                )
              )
            )
          )
        )
      )
    );

    perform net.http_post(
      url := 'https://' || v_domain || '/api/v4/leads/complex',
      body := v_payload,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || v_token
      )
    );

  exception when others then
    raise warning 'notify_amocrm_new_order failed: %', sqlerrm;
  end;

  return null;
end;
$$;
