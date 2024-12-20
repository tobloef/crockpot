* Replace .type() with relationships
  * Component.as("comp"), IsA.on("comp").to("type"), Entity.as("type")
  * Don't have the IsA built-in, but make sure the above can work
  * If can then probably remove all three type test groups
* Implementation
* Two-way relationships
* Required components and/or bundles
* Observers
* Destruction/Cleanup
  * Think about choice of granularity
* Query
  * Iterator with extra methods for sorting, etc.
  * Caching?
  * Indexing?
  * Sorting?
* State machines?
* Benchmarking
