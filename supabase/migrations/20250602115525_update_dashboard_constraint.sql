DROP VIEW IF EXISTS inventory_dashboard;
create or replace view inventory_dashboard as
select distinct
  sr.model_id,
  sr.stock_quantity,
  sr.last_updated,
  pm.model_name,
  p.product_id,
  p.product_name,
  s.supplier_id,
  s.supplier_name,

  -- Total sales in the past 30 days
  coalesce(sum(
    case
      when o.created_at >= now() - interval '30 day'
      then oi.quantity
      else 0
    end
  ), 0) as sales_30d,

  -- Check if there are any pending purchase orders for this model
  exists (
    select 1 
    from purchase_items pi2
    join purchase_batches pb2 on pi2.batch_id = pb2.batch_id
    where pi2.model_id = sr.model_id
    and pb2.status = 'pending'
  ) as has_active_purchase

from stock_records sr
left join product_models pm on sr.model_id = pm.model_id
left join products p on pm.product_id = p.product_id
left join order_items oi on oi.model_id = pm.model_id
left join orders o on oi.order_id = o.order_id
left join purchase_items pi on pi.model_id = pm.model_id
left join purchase_batches pb on pi.batch_id = pb.batch_id
left join suppliers s on pb.supplier_id = s.supplier_id

group by sr.model_id, sr.stock_quantity, sr.last_updated,
         pm.model_name, p.product_id, p.product_name, s.supplier_id, s.supplier_name;