* Open question, what to do about
* Get both component and value in same query?
  * `Relationship.on("comp"), Component.as("comp"), Component.as("comp").values()`?
  * Doesn't work because the pool of components won't include 
* Fix query tests
* Support boolean queries in pools
* Support or and not for RelationshipTarget, RelationshipSource and ComponentSource
  * Give them RelationshipTarget/RelationshipSource/ComponentSource as their generic?

-------------

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
* Events
* Benchmarking
