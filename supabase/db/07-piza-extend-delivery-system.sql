/* EXTEND DELIVERY SYSTEM */

/* Add a flag that will be updated by fn_process_order depending on ingredient availability */
ALTER TABLE "public"."order" ADD COLUMN "perfect_pizza" BOOLEAN;

CREATE OR REPLACE FUNCTION public.fn_process_order()
  RETURNS trigger
  LANGUAGE plpgsql
AS $function$

  DECLARE
    _pizza_id INT;
    _missing_dough INT; 
    _missing_ingredients INT;
  
  BEGIN
    -- Check if we have dough
    SELECT count(*) INTO _missing_dough FROM order_dough
    WHERE order_dough.order_id = NEW.id
    AND NOT EXISTS (
      SELECT id FROM stock_dough
      WHERE stock_dough.dough_id = order_dough.dough_id
      AND stock_dough.pizza_id IS NULL);

    -- Check for missing ingredients
    SELECT count(*) INTO _missing_ingredients FROM order_ingredient
    WHERE order_ingredient.order_id = NEW.id
    AND NOT EXISTS (
      SELECT id FROM stock_ingredient 
      WHERE stock_ingredient.ingredient_id = order_ingredient.ingredient_id
      AND stock_ingredient.pizza_id IS NULL);

    -- If missing dough or more than two ingredients, deny the order
    IF (_missing_ingredients > 2 OR _missing_dough = 1) THEN
      UPDATE public.order SET delivery_status = 'not delivered'::public.delivery_status WHERE id = NEW.id;

      RAISE NOTICE 'The order with id % has been denied :(', NEW.id;
      RETURN NULL;
    ELSE
      -- Otherwise, create the pizza 
      INSERT INTO pizza DEFAULT VALUES RETURNING pizza.id INTO _pizza_id;
        
      -- Mark dough as used
      UPDATE stock_dough SET pizza_id = _pizza_id WHERE id IN(  
        SELECT DISTINCT ON (sd.dough_id) sd.id 
        FROM order_dough od 
        LEFT JOIN stock_dough sd USING (dough_id) 
        WHERE od.order_id = NEW.id AND sd.pizza_id IS NULL);

        -- Mark ingredients as used
      UPDATE stock_ingredient SET pizza_id = _pizza_id WHERE id IN(  
        SELECT DISTINCT ON (si.ingredient_id) si.id 
        FROM order_ingredient oi 
        LEFT JOIN stock_ingredient si USING (ingredient_id) 
        WHERE oi.order_id = NEW.id AND si.pizza_id IS NULL);

      -- Deliver pizza
      UPDATE public.order 
      SET delivery_status = 'delivered'::public.delivery_status,
        pizza_id = _pizza_id,
        perfect_pizza = 
          CASE WHEN(_missing_ingredients = 0) THEN TRUE
            ELSE NULL
          END
      WHERE id = NEW.id;
      
      RAISE NOTICE 'The order with id % has been fulfilled', NEW.id;
      RETURN NULL;
    END IF;
  END;
$function$;

COMMENT ON FUNCTION public.fn_process_order IS 'Attempts to cook and deliver a pizza as soon as an order is received';

-- We can't use CREATE OR REPLACE with CONSTRAIN TRIGGERS for some reason, so instead we can drop it before creating it.
DROP TRIGGER IF EXISTS tr_on_new_order ON public.order;

-- We use a constraint trigger so we can wait for the order, the dough, and the ingredients to be inserted.
CREATE CONSTRAINT TRIGGER tr_on_new_order AFTER INSERT ON 
  public.order DEFERRABLE INITIALLY DEFERRED FOR EACH ROW 
  EXECUTE FUNCTION public.fn_process_order();

COMMENT ON TRIGGER tr_on_new_order ON public.order IS 'Used for attempting to fulfill a new order as it is added to public.order';

-- Enable realtime for public.order table.
ALTER PUBLICATION supabase_realtime ADD TABLE public.order;

/* FUNCTIONS to feed the frontend components. */

CREATE OR REPLACE FUNCTION public.fn_get_ratio_success_deliveries(seconds INT)
  RETURNS TABLE(label TEXT, delivery_status public.delivery_status, percent DECIMAL, ctorder BIGINT)
  LANGUAGE plpgsql
AS $function$
  BEGIN
  RETURN QUERY
    SELECT
      CASE WHEN(o.delivery_status = 'not delivered'::public.delivery_status) THEN 'fail'
        WHEN(o.delivery_status = 'delivered'::public.delivery_status) AND (perfect_pizza = TRUE) THEN 'perfect' 
        WHEN(o.delivery_status = 'delivered'::public.delivery_status) AND (perfect_pizza IS NULL) THEN 'good'
    	  ELSE NULL
    	END AS label, 
      o.delivery_status, round(count(created_at) * 100 / sum(count(*)) OVER (), 2) AS percent, count(created_at) AS ctorder
    FROM public.order o
    WHERE created_at > CURRENT_TIMESTAMP - CONCAT(seconds, ' seconds')::INTERVAL AND o.delivery_status IS NOT NULL
    GROUP BY o.delivery_status, o.perfect_pizza;
  END
$function$;

COMMENT ON FUNCTION public.fn_get_ratio_success_deliveries IS 'Retrieves the percentage of perfect, good and failed deliveries in the last n-seconds';

CREATE OR REPLACE FUNCTION public.fn_get_best_customer(seconds INT)
  RETURNS TABLE(name TEXT, surname TEXT, email TEXT, avatar_url TEXT, client_id INT, count BIGINT)
  LANGUAGE plpgsql
AS $function$
  BEGIN
  RETURN QUERY
    SELECT DISTINCT c.name, c.surname, c.email, c.avatar_url, o.client_id, count(o.client_id) OVER (PARTITION BY o.client_id)
    FROM public.order o 
    LEFT JOIN order_ingredient oi ON o.id = oi.order_id
    LEFT JOIN client c ON c.id = o.client_id 
    WHERE delivery_status = 'delivered'::public.delivery_status
      AND created_at > CURRENT_TIMESTAMP - CONCAT(seconds, ' seconds')::INTERVAL AND delivery_status IS NOT NULL
    ORDER BY count DESC;
  END
$function$;

COMMENT ON FUNCTION public.fn_get_best_customer IS 'Retrieves the customer with most ingredients ordered in the last n-seconds, and the number of ingredients';

CREATE OR REPLACE FUNCTION public.fn_get_most_popular_ingredient(seconds INT)
  RETURNS TABLE(name TEXT, ingredient_id INT, count BIGINT)
  LANGUAGE plpgsql
AS $function$
  BEGIN
  RETURN QUERY
    SELECT DISTINCT i.name, oi.ingredient_id, count(oi.ingredient_id) OVER(PARTITION BY oi.ingredient_id)
    FROM public.order o
    LEFT JOIN order_ingredient oi ON o.id = oi.order_id
    LEFT JOIN ingredient i ON i.id = oi.ingredient_id
    WHERE oi.ingredient_id IS NOT NULL
      AND created_at > CURRENT_TIMESTAMP - CONCAT(seconds, ' seconds')::INTERVAL AND delivery_status IS NOT NULL
    ORDER BY count DESC;
  END
$function$;

COMMENT ON FUNCTION public.fn_get_best_customer IS 'Retrieves the most popular ingredient in the last n-seconds, and the number of ingredients';

CREATE OR REPLACE FUNCTION public.fn_get_timed_deliveries(seconds INT)
  RETURNS TABLE(count BIGINT, interval_alias NUMERIC)
  LANGUAGE plpgsql
AS $function$
  BEGIN
  RETURN QUERY
    SELECT COUNT(*) count, 
      extract('epoch' from to_timestamp(floor((extract('epoch' from created_at) / seconds )) * seconds) 
      AT TIME ZONE 'UTC') as interval_alias
    FROM public.order GROUP BY interval_alias
    ORDER BY interval_alias ASC;
  END
$function$;

COMMENT ON FUNCTION public.fn_get_timed_deliveries IS 'Retrieves the total number of deliveries recorded grouped by n-seconds intervals';

CREATE OR REPLACE FUNCTION public.fn_get_stock_items()
  RETURNS TABLE(id INT, name TEXT, cnt BIGINT, ingredient BOOLEAN)
  LANGUAGE plpgsql
AS $function$
  BEGIN
  RETURN QUERY
    SELECT i.id, i.name, count(s.ingredient_id) AS cnt, TRUE AS ingredient
    FROM ingredient i
    LEFT JOIN stock_ingredient s ON s.ingredient_id = i.id AND pizza_id IS NULL
    GROUP BY i.id, s.ingredient_id
    UNION
    SELECT d.id, d.name, count(s.dough_id) AS cnt, FALSE AS ingredient
    FROM dough d LEFT JOIN stock_dough s ON d.id = s.dough_id AND pizza_id IS NULL
    GROUP BY d.id, s.dough_id
    ORDER BY ingredient, id;
  END
$function$;

COMMENT ON FUNCTION public.fn_get_stock_items IS 'Returns list of dough and ingredient types with their stocks';

CREATE OR REPLACE FUNCTION public.fn_create_single_order(client_id INT, dough_id INT, ingredient_ids INT[])
  RETURNS INT
  LANGUAGE plpgsql
AS $function$
  DECLARE
    _order_id INT;
  BEGIN
    -- Create the order
    INSERT INTO public.order (client_id) 
    VALUES (client_id)
    RETURNING id INTO _order_id;
  
    -- Insert the ordered dough
    INSERT INTO public.order_dough (order_id, dough_id) 
    VALUES (_order_id, dough_id);
  
    -- Insert the ordered ingredients
    INSERT INTO public.order_ingredient (order_id, ingredient_id) 
    SELECT _order_id order_id, UNNEST(ingredient_ids) ingredient_id;

    RAISE NOTICE 'The boss just ordered a pizza! (Dough: %; Ingredients: %)', dough_id, ARRAY_TO_STRING(ingredient_ids, ',');
	RETURN _order_id;
  END
$function$;

COMMENT ON FUNCTION public.fn_create_single_order IS 'Orders a pizza for a client_id, with dough_id and ingredient_ids';

