## Javi Prieto's notes on the technical assignment for IOMED's full-stack developer position

On top of my commit messages, I will be adding some notes below that may be useful to understand my process.

## System setup

I changed `dockerfile` on the frontend folder to `Dockerfile`, as my version of docker will not accept it without capitalisation.

I tried running supabase on my home server but some of the Supabase containers kept restarting ([may be related to this?](https://github.com/supabase/cli/issues/33)). It works just fine on a MacBook Air M1.

I used `yarn` to build the frontend.

## Pizza delivery system

I created the `fn_process_order()` function to fulfill or deny each order as it arrives. The `tr_on_new_order` constraint trigger on the `public.order` table fires that function every time an order is added by `place_order()`.

Since we use `COMMIT` on the `place_order_runner()` procedure, the actual `place_order()` function is transactional and we can defer the execution of the `fn_process_order()` until the order, dough and ingredients are all inserted.

**Note**: `CREATE OR REPLACE CONSTRAINT TRIGGER` doesn't seem to be supported, so for now I've just used `CREATE CONSTRAINT TRIGGER` instead.

`fn_process_order()` can be improved, but this version works. In summary:
- We check for missing dough and ingredients
- If we we don't have dough or are missing more than two ingredients, we deny the order.
- Otherwise, we create a pizza, mark ingredients and dough as used, and deliver the order.

## Possible improvements, added features
- Orders can only include one pizza, we want to make as much money as possible, so we should allow clients to order more than one pizza at the time
- CMS should allow the boss to open and close the restaurant (make it available for orders or not)
- CMS could have configurable and sortable slots for graphics and other info.
- When we deny an order, we don't keep details about the reasons why we denied it, so in order to improve our supply chain, it would be great to have a history of ingredients and doughs that run out of stock and when, so we can adjust accordingly.