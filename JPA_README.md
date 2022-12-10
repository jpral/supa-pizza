## Javi Prieto's notes on the technical assignment for IOMED's full-stack developer position

On top of my commit messages, I will be adding some notes below that may be useful to understand my process. The structure of this document is generally linear, meaning I mostly add my thoughts as I work through the assignment. The main exception is the "**Possible improvements, added features**" section, in which I include at any time ideas or changes that I'd like to implement if I had time.

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

I added the TS type definitions for the functions from the database to `database.d.ts` file. I used `react-query` for data fetching from supabase's API. I setup a default re-fetching rate of 10 seconds for the non-realtime data points (successful orders, best customer, most popular ingredients). The datagrid with the live stream of orders will connect to socket so ideally I will also integrate it with react-query [as discussed here](https://github.com/TanStack/query/issues/171). 

For the datagrid, I populate the grid with the latest 50 records, if any, and add new ones through the realtime API when their `delivery_status` is updated. Initially I wanted to create a view in Postgres to retrieve all joint details from client, ingredients and dough tables, but that won't work with the realtime API, as I cannot add a VIEW to the `supabase_realtime publication`. Because of time constraints, I've chosen to query only the order data for now, and work on the on demand data fetching for client and pizza details later.

I realised for the first metric we should show good and perfect pizzas, not successful and denied deliveries. Added a flag to the `public.order` that will be updated by `fn_process_order()` depending on how many of the ingredients we've used on each pizza. Modified the `fn_get_ratio_success_deliveries()` function to retrieve the stats based on the new flag, including percentages for **perfect**, **good**, and **failed** pizzas.

I fine-tunned the time series area chart so it can have `xScaleType={ScaleType.Time}`, I was returning the wrong format from the database.

I created two *PopOver* components that fetch the client and pizza data on demand based on the order_id of the current row in which they're opened. I fixed some style issues with the PopOver icons. I am also trying to include `setCellProps` in the dataGrid's `renderCellValue` function to highlight certain rows accordingly, but the docs imply I should call it within a `useEffect` hook, which should not be allowed - hooks can only be called from other hooks or function components, not callbacks.

I designed a basic version of the frontend panels in figma and I created a `useCustomStyle` hook to retrieve my custom styles that are partially based on `useEuiTheme`. I fitted the first (success-rate) panel with the styles and a donut chart. I modified the database function slightly to include the counts as well as the percentages.

I added best customer and popular ingredients panels next, as well as polishing details across the site. The use of a series of color shades for the graphics and consistent typography for common elements give the site a more cohesive vibe.

The last commit includes a new order placing modal, that disables ingredients and dough that are out of stock. I created a function in the database to search for the stock, and another one to place an order including inserts for `order` `order_dough` and `order_ingredient`.

At the same time I improved the way pizza and user data were being shown in the live feed, as the popovers would close when new orders showed, re-rendering the whole table. I ended up using a not-so-elegant way to show them in a popup that lives outside the grid. I also changed the way I was adding new data to the grid after the initial query, as I should not modify the data directly - using `queryClient.setQueryData(['live_orders'], [newRecord].concat(data));` keep the rest of the data grid aware of the changes, updating the number of pages accordingly.

**[UPDATE]**: I added some unit testing with **jest** and **nock** for network mocking (we could use MSW instead). I am launching from the terminal using `yarn test --coverage src`. At least I wanted to illustrate how would I go about testing a custom hook with a network call, and a couple of react components. I slightly refactored the `OrderRatio` component to take out the data fetching to a container and make it more testable. 

In terms of coverage, higher ratios indicate that there's more of our code that is tested to behave as expected. There will be more chances for us to catch a bug when refactors happen, and we also can include the use of thresholds to ensure we keep a minimum ratio of tested code. 

## Possible improvements and extra features
- DB: Orders can only include one pizza, we want to be as profitable and scalable as possible, so we should allow clients to order more than one pizza at the time. The easiest way I could see is add an `order_pizza` pivot table making the relationshp one-to-many (one order can contain many pizzas), and convert `order_dough` and `order_ingredient` into `pizza_dough` and `pizza_ingredient`.
- DB: When we deny an order, we don't keep details about the reasons why we denied it, so in order to improve our supply chain, it would be great to have a history of ingredients and doughs that run out of stock and when, so we can adjust accordingly. It probably can be queried with the current structure but it's not trivial.
- DB: I would add a pre-defined pizza list to the database, to show a few pizza options to the customers, instead of having the choose every single ingredient. From the order's perspective, it would not change anything, as a customer choosing a predefined pizza would only make it quicker to add all the selected ingredients and dough to the order.
- Frontend: The CMS could allow the boss to open and close the restaurant (make it available or unavailable for orders by changing `backoffice.runner.isActive`) accordingly.
- Frontend: The CMS could have configurable and sortable slots for graphics and other info using Elastic UI's [drag and drop](https://elastic.github.io/eui/#/display/drag-and-drop).

## Stuff that I wish I had done (or done better)
- Authentication: I just could not get it done in the local docker environment, could not add the user to the supabase system for some reason, but it seemed straight forward enough after that.
- Better, cleaner component structure. I should have move most queries to hooks, or at least to their own testable components. I struggled a bit with some of the bigger components including charts, a lot of boilerplate necessary and not always the cleaner outcome.
- Testing, I should include one or two tests at least to show my approach, I got a bit short of time and tried to do everything else. I might add a few after this commit, but I've decided to send the project as-is. This is as much as I was able to do in the week-ish that I was given. **[UPDATE]**: I did include some in the end.
- Better docs: I hope I was able to comment on most of what I did in a clear way, but I am sure there are some things I took for granted and I could have explained better. 

## Final remarks
All in all I had good fun, I didn't have previous experience with Supabase or ElasticUI, so it was a good chance for me to learn the basics while running against the clock. I thought the test was very complete: touching DB stuff, APIs, Docker, React, Typescript, Components Libraries, Live data, etc. Well done! And thanks for the opportunity. 