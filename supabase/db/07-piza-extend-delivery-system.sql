/* EXTEND DELIVERY SYSTEM */
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
      SET delivery_status = 'delivered'::public.delivery_status, pizza_id = _pizza_id 
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