## Javi Prieto's notes on the technical assignment for IOMED's full-stack developer position

On top of my commit messages, I will be adding some notes below that may be useful to understand my process.

## System setup

I changed `dockerfile` on the frontend folder to `Dockerfile`, as my version of docker will not accept it without capitalisation.

I tried running supabase on my home server but some of the Supabase containers kept restarting ([may be related to this?](https://github.com/supabase/cli/issues/33)). It works just fine on a MacBook Air M1.

I used `yarn` as a package manager on the frontend as opposed to `npm`.

## Pizza delivery system

I created the `fn_process_order()` function to fulfill or deny each order as it arrives. The `tr_on_new_order` constraint trigger on the `public.order` table fires that function every time an order is added by `place_order()`.

Since we use `COMMIT` on the `place_order_runner()` procedure, the actual `place_order()` function is transactional and we can defer the execution of the `fn_process_order()` until the order, dough and ingredients are all inserted.

**Note**: `CREATE OR REPLACE CONSTRAINT TRIGGER` doesn't seem to be supported, so for now I've just used `CREATE CONSTRAINT TRIGGER` instead.

`fn_process_order()` can be improved, but this version works. In summary:
- We check for missing dough and ingredients
- If we we don't have dough or are missing more than two ingredients, we deny the order
- Otherwise, we create a pizza, mark ingredients and dough as used, and deliver the order.

## Frontend
I used the Supabase CLI to generate TypeScript types from the database, [like so](https://supabase.com/docs/reference/javascript/typescript-support). I created type definitions for `process.env` too.

The way I approached the frontend task was to learn the basics of **Elastic UI**, the **Supabase DB API** and **Supabase Realtime**. Once I had a basic understanding I designed a scaffold with a series of `EuiPanel` components to hold our graphics, KPIs, trends, etc, and our *near-real-time* list of orders. More information on these components later.

Next, I created the following functions in the db:
- `fn_get_ratio_success_deliveries`: returns the percentage of successful and failed orders in the last n-seconds
- `fn_get_best_customer`: returns the details of the customer that has eaten the most ingredients in the last n-seconds, and the number of ingredients included in their order
- `fn_get_most_popular_ingredient`: returns a list of most popular ingredients in the last n-seconds
- `fn_get_timed_deliveries`: returns the total number of deliveries recorded grouped by n-seconds intervals so we can see the evolution of our business over time.

I added the TS type definitions for the functions from the database to `database.d.ts` file. I used `react-query` for data fetching from supabase's API. I setup a default re-fetching rate of 10 seconds for the non-realtime data points (successful orders, best customer, most popular ingredients). The datagrid with the live stream of orders will connect to socket so ideally I will also integrate it with react-query [as explained here](https://tkdodo.eu/blog/using-web-sockets-with-react-query). 

## Possible improvements, added features
- DB: Orders can only include one pizza, we want to be as profitable and scalable as possible, so we should allow clients to order more than one pizza at the time
- DB: When we deny an order, we don't keep details about the reasons why we denied it, so in order to improve our supply chain, it would be great to have a history of ingredients and doughs that run out of stock and when, so we can adjust accordingly
- Frontend: The CMS should allow the boss to open and close the restaurant (make it available or unavailable for orders by changing `backoffice.runner.isActive`) accordingly
- Frontend: The CMS could have configurable and sortable slots for graphics and other info using Elastic UI's [drag and drop](https://elastic.github.io/eui/#/display/drag-and-drop).