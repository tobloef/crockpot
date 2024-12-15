FooComponent.on(Any)
// Expectation: All FooComponents
// Cypher: (n:FooComponent)

FooComponent
// Expectation: All FooComponents
// Cypher: (n:FooComponent)

FooComponent.on("ref")
// Expectation: All FooComponents
// Cypher: (ref:FooComponent)

FooRelationship.to(Any)
FooRelationship.on($this).to(Any)
// Expectation: All FooRelationships
// Cypher: ()-[r:FooRelationship]->()

FooRelationship.to(Any), FooComponent
FooRelationship.on($this).to(Any), FooComponent
// Expectation: All FooRelationships from entities that have a FooComponent
// Cypher: (n:FooComponent)-[r:FooRelationship]->()

FooRelationship.to("target")
FooRelationship.on($this).to("target")
// Expectation: All FooRelationships
// Cypher: ()-[r:FooRelationship]->(target)

FooRelationship.to("target"), FooComponent.on("target")
FooRelationship.on($this).to("target"), FooComponent.on("target")
// Expectation: All FooRelationships to entities that have a FooComponent
// Cypher: ()-[r:FooRelationship]->(target:FooComponent)

FooRelationship.on("source").to($this)
// Expectation: All FooRelationships (Since there are no other constraints on the target/source)
// Cypher: (source)-[r:FooRlationship]->()

FooRelationship.on("source").to($this), FooComponent
// Expectation: All FooRelationships to entities that have a FooComponent
// Cypher: (:FooComponent)-[r:FooRelationship]->()

FooRelationship.on("source").to($this), FooComponent.on("source")
// Expectation: All FooRelationships from entities that have a FooComponent
// Cypher: (source:FooComponent)-[r:FooRelationship]->()

FooRelationship.on("source").to("target"), FooComponent.on("source"), FooComponent.on("target")
// Expectation: All FooRelationships from entities that have a FooComponent to entities that have a FooComponent
// Cypher: (source:FooComponent)-[r:FooRelationship]->(target:FooComponent)

Any.on(FooComponent) // All components on FooComponent?
Any.to(FooComponent) // All relationships to FooComponent?
Any.on(FooComponent).to(FooComponent) // All Relationships on FooComponent to FooComponent
Any.on("target") // All components
Any.to("target") // All relationships
Any.on("source").to("target") // All relationships


// Alternatively, use the classes as wildcards
Component.on(FooComponent) // All components on FooComponent?
Relationship.to(FooComponent) // All relationships to FooComponent?
Relationship.on(FooComponent).to(FooComponent) // All Relationships on FooComponent to FooComponent
Component.on("target") // All components
Relationship.to("target") // All relationships
Relationship.on("source").to("target") // All relationships

// Given
ent1.add(FooRelationship.to(ent2).withValues(1))
ent1.add(FooRelationship.to(ent3).withValues(2))
// Should
Entity, FooRelationship.to(Any)
// Cypher: (n)-[r:FooRelationship]->()
// Return
[ent1, 1]
// Or
[ent1, 1]
[ent1, 2]
// Given `FooRelationship.to(Any)`, I think it should be the latter.
// Then how do I just say that I care about the fact that there is _a_ relationship, not all of them?
Entity, FooRelationship.to(First) // Reads wierdly semantically imo
Entity.first, FooRelationship.to(Any) // This sounds like it will only match the first entity
Entity.once, FooRelationship.to(Any) // Better. Slightly funky syntax, but semantically correct at least?
Entity.once(), FooRelationship.to(Any) // Better as function? Consistent at least.
// Then you could also do this I suppose
FooRelationship.to(Any).once()
// To get only get `[1]`, not `[1], [2]`


FooRelationship.to(Any), FooComponent // All FooRelationship, but source must have FooComponent
FooRelationship.to("target"), FooComponent // All FooRelationship, but source must have FooComponent
FooRelationship.to(Any), FooComponent.on(Any) // The .on(Any) is funky. So not allowed?
FooRelationship.to("target"), FooComponent.on("source") // This is funky, since they're not related.
                                                        // Would it just be all pairs?
														// If so, the one above would be too.
FooRelationship.to("ref"), FooComponent.on("ref") // All FooRelationship, but target must have FooComponent
FooRelationship.to(Any), BarRelationship.to(Any) // All pairs as well?


// If reference acts the same as Any, why keep Any at all? To do `Any.on(FooComponent)` I suppose.
// And because Any is more semantic when you're not using the reference for anything.

