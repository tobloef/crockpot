const world: World = new World();

const FooComponent: ComponentType = world.defineComponent("FooComponent", { value: "number" });
const BarComponent: ComponentType = world.defineComponent("FooTag");
const FooRelation: RelationType = world.defineRelation("FooRelation", { value: "string" });
const BarRelation: RelationType = world.defineRelation("BarRelation");

const values: Values<FooComponent> = { value: 1 };

const entity1: Entity = world.createEntity(FooComponent(values), BarComponent);
const entity2: Entity = world.createEntity(BarRelation(entity1));
entity2.add(FooComponent({ value: 2 }), BarComponent);
entity1.add(FooRelation(entity2, { value: "foo" }));

