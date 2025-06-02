create or replace view sales_by_date as
select
  date_trunc('day', o.created_at) as date,
  oi.model_id,
  oi.product_id,
  sum(oi.total_price) as amount,
  sum(oi.quantity) as quantity
from order_items oi
join orders o on oi.order_id = o.order_id
where o.order_status = 'delivered'
group by date, oi.model_id, oi.product_id; 