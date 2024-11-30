type Class<T> = new (...args: any[]) => T;
type Instance<T extends Class<any>> = T extends new (...args: any[]) => infer R ? R : any;

type ComponentSchema = { [Key: string]: Class<any>};
type Values<Schema extends ComponentSchema | undefined> = (
  Schema extends ComponentSchema
    ? { [Key in keyof Schema]: Instance<Schema[Key]> }
    : never
);

type IsEmpty<T extends object> = keyof T extends never ? true : false;

type ComponentWithValues<
  Comp extends Component<Schema>,
  Schema extends ComponentSchema | undefined
> = [
  component: Comp,
  values: Values<Schema>,
]

type AddedComponents = Array<ComponentWithValues<any, any> | Component>;

type OnDestroy = () => void;

/////////////////////////////////////////////////////////////////////////////////////

class Entity {
  #componentsToValues = new Map<Component, unknown | undefined>;
  #componentToRemoveOnDestroyCallbacks = new Map<Component, OnDestroy>;
  #onDestroyCallbacks: OnDestroy[] = [];

  add<AC extends AddedComponents>(...components: AC): this {
    for (const componentWithValuesOrTag of components) {
      let component: Component;
      let values = undefined;

      if (Array.isArray(componentWithValuesOrTag)) {
        [component, values] = componentWithValuesOrTag;
      } else {
        component = componentWithValuesOrTag;
      }

      const alreadyHasComponent = this.#componentsToValues.has(component);

      this.#componentsToValues.set(component, values);

      if (!alreadyHasComponent) {
        const removeOnDestroy = component.onDestroy(() => {
          this.#componentsToValues.delete(component);
          const removeOnDestroyCallback = this.#componentToRemoveOnDestroyCallbacks.get(component);
          if (removeOnDestroyCallback !== undefined) {
            removeOnDestroyCallback();
            this.#componentToRemoveOnDestroyCallbacks.delete(component);
          }
        });

        this.#componentToRemoveOnDestroyCallbacks.set(component, removeOnDestroy);
      }
    }

    return this;
  }

  remove<Comp extends Component<any>>(component: Comp): this {
    this.#componentsToValues.delete(component);

    const removeOnDestroyCallback = this.#componentToRemoveOnDestroyCallbacks.get(component);
    if (removeOnDestroyCallback !== undefined) {
      removeOnDestroyCallback();
      this.#componentToRemoveOnDestroyCallbacks.delete(component);
    }

    return this;
  }

  _as(name: string): EntityQuery<typeof this> {
    return new EntityQuery(this).as(name);
  }

  destroy() {
    this.#onDestroyCallbacks.forEach((callback) => {
      callback();
    });

    this.#componentsToValues.clear();
    this.#onDestroyCallbacks = [];
  }

  onDestroy(callback: OnDestroy) {
    this.#onDestroyCallbacks.push(callback);
    return () => this.#onDestroyCallbacks.filter((c) => c !== callback);
  }
}

class Component<Schema extends ComponentSchema | undefined = undefined> extends Entity {
  schema?: Schema;

  constructor(...args: Schema extends ComponentSchema ? [Schema] : []) {
    super();
    this.schema = args[0] as Schema;
  }

  on(source: string | Entity): ComponentQuery<typeof this> {
    return new ComponentQuery(this).on(source);
  }

  _as(name: string): ComponentQuery<typeof this> {
    return new ComponentQuery(this).as(name);
  }

  _with(values: Values<Schema>): ComponentWithValues<typeof this, Schema> {
    return [this, values];
  }
}

const relationshipComponents = new Map<[Relationship<any>, Entity], Component<any>>();

class Relationship<Schema extends ComponentSchema | undefined = undefined> extends Component<Schema> {
  to(entity: Entity): Component<Schema>;
  to(reference: string): RelationshipQuery<typeof this>;
  to(entityOrReference: Entity | string): Component<Schema> | RelationshipQuery<typeof this> {
    if (typeof entityOrReference === "string") {
      return this.#toQuery(entityOrReference);
    } else {
      return this.#toComponent(entityOrReference);
    }
  }

  #toComponent(entity: Entity): Component<Schema> {
    const pair: [Relationship<any>, Entity] = [this, entity];

    if (!relationshipComponents.has(pair)) {
      const component = new Component<Schema>(...[this.schema] as any);
      relationshipComponents.set(pair, component)
    }

    const component = relationshipComponents.get(pair);

    if (component === undefined) {
      throw new Error("Couldn't find relationship component, which should be impossible.");
    }

    return component as Component<Schema>;
  }

  #toQuery(reference: string): RelationshipQuery<typeof this> {
    return new RelationshipQuery(this).to(reference);
  }

  on(source: string | Entity): RelationshipQuery<typeof this> {
    return new RelationshipQuery(this).on(source);
  }

  _as(name: string): RelationshipQuery<typeof this> {
    return new RelationshipQuery(this).as(name);
  }
}

/////////////////////////////////////////////////////////////////////////////////////

class EntityQuery<Ent extends Entity> {
  #entity: Ent;
  #name?: string;

  constructor(entity: Ent) {
    this.#entity = entity;
  }

  as(name: string): EntityQuery<Ent> {
    this.#name = name;
    return this;
  }
}

class ComponentQuery<Comp extends Component<any>> extends EntityQuery<Comp> {
  #source?: string | Entity;

  override as(name: string): ComponentQuery<Comp> {
    super.as(name);
    return this;
  }

  on(source: string | Entity): ComponentQuery<Comp> {
    this.#source = source;
    return this;
  }
}

class RelationshipQuery<Rel extends Relationship<any>> extends ComponentQuery<Rel> {
  #target?: string | Entity;

  override as(name: string): RelationshipQuery<Rel> {
    super.as(name);
    return this;
  }

  override on(source: string | Entity): RelationshipQuery<Rel> {
    this.on(source);
    return this;
  }

  to(target: string | Entity): RelationshipQuery<Rel> {
    this.#target = target;
    return this;
  }
}

/////////////////////////////////////////////////////////////////////////////////////

class World {
  entities: Entity[] = [];

  create(...components: AddedComponents): Entity {
    const entity = new Entity().add(...components);
    this.insert(entity);
    return entity;
  }

  insert(entity: Entity): void {
    this.entities.push(entity);
  }

  remove(entity: Entity): void {
    this.entities.filter((e) => e !== entity);
    // TODO: Handle things that depend on this entity
  }
}

/////////////////////////////////////////////////////////////////////////////////////



/////////////////////////////////////////////////////////////////////////////////////

const world = new World();

const Serializable = new Component();

const Name = new Component({
  value: String,
});
Name.add(Serializable);

const Human = new Component();
const Dog = new Component();

const Likes = new Relationship({
  reason: String,
});

const Loves = new Relationship();

const john = new Entity().add(Name._with({ value: "John Dogowner" }));
world.insert(john);

john.add(Human);
john.add(Likes._with({ reason: "test" })); // Wrong, but somewhat usage

// @ts-expect-error
john.add(Name);

const snoopy = world.create(Dog);
snoopy.add(Name._with({ value: "Snoopy" }));

john.add(Likes.to(snoopy)._with({ reason: "Good boy" }));
john.add(Loves.to(Dog));

// @ts-expect-error
john.add(Likes.to(snoopy));

// @ts-expect-error
john.add(Likes.to("liked"));

// @ts-expect-error
const TestComponent = new Component<{ value: typeof String }>();


/////////////////////////////////////////////////////////////////////////////////////

type QueryPart = (
  | Component<any>
  | Relationship<any>
  | EntityQuery<any>
  | ComponentQuery<any>
  | RelationshipQuery<any>
  );

type QueryResults<QueryParts extends QueryPart[] | Record<string, QueryPart>> = Array<{
  entity: Entity,
  components: (
    QueryParts extends QueryPart[]
      ? ParseQueryPartsArray<QueryParts>
      : QueryParts extends Record<string, QueryPart>
        ? ParseQueryPartsObject<QueryParts>
        : never
  ),
}>;

type ParseQueryPartsArray<QueryParts extends any[]> = (
  QueryParts extends [infer First, ...infer Rest]
    ? First extends QueryPart
      ? [ParseQueryPart<First>] extends [never]
        ? ParseQueryPartsArray<Rest>
        : [ParseQueryPart<First>, ...ParseQueryPartsArray<Rest>]
      : never
    : []
  );

type ParseQueryPartsObject<QueryParts extends Record<string, QueryPart>> = {
  [Key in keyof QueryParts]: ParseQueryPart<QueryParts[Key]>
};

type ParseQueryPart<Part extends QueryPart> = ParseQueryPartShort<Part>;

type ParseQueryPartShort<Part extends QueryPart> = (
  Part extends EntityQuery<infer Type>
    ? Type extends Component<infer Schema>
      ? Values<Schema>
      : Type
    : Part extends Component<infer Schema>
      ? Values<Schema>
      : never
  )

type ParseQueryPartFull<Part extends QueryPart> = (
  Part extends RelationshipQuery<infer Type>
    ? Type extends Component<infer Schema>  // Do something relationship specific for remove, since we can just match on EntityQuery
      ? Values<Schema>
      : Type
    : Part extends ComponentQuery<infer Type>
      ? Type extends Component<infer Schema>  // Do something relationship specific for remove, since we can just match on EntityQuery
        ? Values<Schema>
        : Type
      : Part extends EntityQuery<infer Type>
        ? Type extends Component<infer Schema>
          ? Values<Schema>
          : Type
        : Part extends Relationship<infer Schema>
          ? Values<Schema> // Do something relationship specific for remove, since we can just match on Component
          : Part extends Component<infer Schema>
            ? Values<Schema>
            : never
  )

function query<QueryParts extends QueryPart[]>(...queryPars: QueryParts): QueryResults<QueryParts>
function query<QueryParts extends Record<string, QueryPart>>(queryPars: QueryParts): QueryResults<QueryParts>
function query<QueryParts extends QueryPart[] | Record<string, QueryPart>>(
  ...queryPars: (
    QueryParts extends QueryPart[]
      ? QueryParts
      : QueryParts extends Record<string, QueryPart>
        ? [QueryParts]
        : never
  )
): QueryResults<QueryParts> {
  throw null;
}

/////////////////////////////////////////////////////////////////////////////////////

const FooComponent = new Component({
  compValue: String,
});
const FooTagComponent = new Component();
const FooRelationship = new Relationship({
  relValue: Number,
});
const FooTagRelationship = new Relationship();

// Should perhaps be built in
const IsA = new Relationship();

/////////////////////////////////////////////////////////////////////////////////////


const results = query(
  FooComponent,
  FooRelationship,
  FooTagComponent.on("thing"),
  FooTagComponent.on(john),
  FooTagComponent.on(Dog),
  FooTagRelationship.to("thing"),
  FooTagRelationship.to(john),
  FooTagRelationship.to(Dog),
  FooRelationship.on("thing").to("thing"),
  FooRelationship.on("thing").to(john),
  FooRelationship.on("thing").to(Dog),
  FooRelationship.to("thing").on("thing"),
  FooRelationship.to(john).on("thing"),
  FooRelationship.to(Dog).on("thing"),
  FooTagComponent._as("fooTagComp"),
  FooComponent._as("fooComp"),
  FooTagRelationship._as("fooTagRel"),
  FooRelationship._as("fooRel"),
  // Must be related to the type (c) of the thing (a) that another thing (b) is related to
  FooRelationship.on("b").to("a"),
  IsA.on("a").to("c"),
  FooRelationship.to("c"),
);

const item1 = query(
  FooTagComponent,
  FooComponent,
  FooTagRelationship,
  FooRelationship,
)[0];

const [
  a1,
  a2,
] = item1.components;

const item2 = query(
  FooTagComponent._as(""),
  FooComponent._as(""),
  FooTagRelationship._as(""),
  FooRelationship._as(""),
)[0];

const [
  b1,
  b2,
] = item2.components;

const item3 = query(
  FooTagRelationship.to("thing"),
  FooTagRelationship.to(john),
  FooTagRelationship.to(Dog),
  FooRelationship.to("thing"),
  FooRelationship.to(john),
  FooRelationship.to(Dog),
)[0];

const [
  c1,
  c2,
  c3,
] = item3.components;

const item4 = query({
  d1: FooTagComponent,
  d2: FooComponent,
  d3: FooTagRelationship,
  d4: FooRelationship,
})[0];

const {
  d1,
  d2,
  d3,
  d4,
} = item4.components;

const item5 = query({
  e1: FooComponent,
  e2: FooRelationship,
  FooTagComponent,
  FooTagRelationship,
})[0];

const {
  e1,
  e2,
} = item5.components;


/////////////////////////////////////////////////////////////////////////////////////
