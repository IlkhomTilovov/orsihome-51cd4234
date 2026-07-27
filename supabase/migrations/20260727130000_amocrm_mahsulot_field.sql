-- Let admins map a category to one of amoCRM's fixed "Mahsulot" select-field options
-- (field_id 624201 on the amoCRM leads pipeline; options are account-specific and fixed,
-- so we can't send arbitrary product names there — only mirror them onto a category).
alter table public.categories
  add column if not exists amocrm_category text;

alter table public.categories
  drop constraint if exists categories_amocrm_category_check;

alter table public.categories
  add constraint categories_amocrm_category_check
  check (amocrm_category is null or amocrm_category in (
    'stul', 'office mebel', 'loft', 'shkaf', 'parta', 'kreslo koja', 'kreslo setka'
  ));

-- Extend the order->amoCRM trigger to also fill the "Mahsulot" custom field when at
-- least one ordered item's category has an amocrm_category mapping set.
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
  v_amocrm_category text;
  v_amocrm_enum_id bigint;
  v_custom_fields jsonb;
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

    -- First ordered item whose category has a "Mahsulot" mapping wins.
    select c.amocrm_category into v_amocrm_category
      from public.order_items oi
      join public.products p on p.id::text = oi.product_id
      join public.categories c on c.id = p.category_id
      where oi.order_id = v_order_id
        and c.amocrm_category is not null
      order by oi.created_at
      limit 1;

    v_amocrm_enum_id := case v_amocrm_category
      when 'stul' then 629141
      when 'office mebel' then 629143
      when 'loft' then 629145
      when 'shkaf' then 629147
      when 'parta' then 629149
      when 'kreslo koja' then 629177
      when 'kreslo setka' then 629179
      else null
    end;

    v_custom_fields := case when v_amocrm_enum_id is not null then
      jsonb_build_array(
        jsonb_build_object(
          'field_id', 624201,
          'values', jsonb_build_array(jsonb_build_object('value', v_amocrm_category, 'enum_id', v_amocrm_enum_id))
        )
      )
      else null
    end;

    v_payload := jsonb_build_array(
      jsonb_build_object(
        'name', v_lead_name,
        'price', round(coalesce(v_total_price, 0)),
        'custom_fields_values', v_custom_fields,
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

    -- Drop the key entirely when there's no mapping, rather than sending null.
    if v_custom_fields is null then
      v_payload := jsonb_build_array(v_payload->0 - 'custom_fields_values');
    end if;

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
