-- AmoCRM integration via a Postgres trigger (no edge function deploy needed).
-- Safe to re-run: uses CREATE OR REPLACE / IF NOT EXISTS everywhere.

create extension if not exists pg_net with schema extensions;

-- Sends one order's items to amoCRM as a Lead + Contact via /api/v4/leads/complex.
-- Never raises: any failure is swallowed so it can never block an order/checkout.
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

    v_payload := jsonb_build_array(
      jsonb_build_object(
        'name', 'Buyurtma ' || v_order_number,
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

drop trigger if exists trg_notify_amocrm_new_order on public.order_items;

create trigger trg_notify_amocrm_new_order
  after insert on public.order_items
  referencing new table as new_table
  for each statement
  execute function public.notify_amocrm_new_order();

-- Callable from the admin panel ("Test lead yuborish") without any edge function.
create or replace function public.amocrm_test_lead()
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_domain text;
  v_token text;
  v_enabled text;
  v_request_id bigint;
begin
  if not public.has_role(auth.uid(), 'admin'::public.app_role) then
    raise exception 'not authorized';
  end if;

  select value into v_enabled from public.settings where key = 'amocrm_enabled';
  select value into v_domain from public.settings where key = 'amocrm_domain';
  select value into v_token from public.settings where key = 'amocrm_access_token';

  if v_enabled is distinct from 'true' or v_domain is null or v_domain = '' or v_token is null or v_token = '' then
    return jsonb_build_object('success', false, 'error', 'AmoCRM ulanmagan');
  end if;

  select net.http_post(
    url := 'https://' || v_domain || '/api/v4/leads/complex',
    body := jsonb_build_array(
      jsonb_build_object(
        'name', 'Test lead — Orsi Home',
        '_embedded', jsonb_build_object(
          'contacts', jsonb_build_array(
            jsonb_build_object(
              'name', 'Test mijoz',
              'custom_fields_values', jsonb_build_array(
                jsonb_build_object(
                  'field_code', 'PHONE',
                  'values', jsonb_build_array(jsonb_build_object('value', '+998901234567'))
                )
              )
            )
          )
        )
      )
    ),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_token
    )
  ) into v_request_id;

  return jsonb_build_object('success', true, 'request_id', v_request_id);
exception when others then
  return jsonb_build_object('success', false, 'error', sqlerrm);
end;
$$;

grant execute on function public.amocrm_test_lead() to authenticated;
