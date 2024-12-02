type Class<T> = new (...args: any[]) => T;
type Instance<T extends Class<any>> = T extends new (...args: any[]) => infer R ? R : any;

type Schemaless = undefined;
type ComponentSchema = { [Key: string]: Class<any> };

type Values<Schema extends ComponentSchema | Schemaless> = (
  Schema extends ComponentSchema
    ? { [Key in keyof Schema]: Instance<Schema[Key]> }
    : never
  );

type ComponentValuesPair<
  Comp extends Component<Schema>,
  Schema extends ComponentSchema | Schemaless
> = [
  component: Comp,
  values: Values<Schema>,
]

type ComponentsValues<Components extends any[]> = (
  Components extends [infer First, ...infer Rest]
    ? First extends Component<infer Schema>
      ? [Values<Schema> | undefined, ...ComponentsValues<Rest>]
      : never
    : []
);

type Tag = Component<Schemaless>;
type ComponentWithValue = Component<ComponentSchema>;
type AddableComponent = ComponentValuesPair<any, any> | Tag;

type OnDestroy = () => void;

/////////////////////////////////////////////////////////////////////////////////////

class Entity {
  #componentsToValues = new Map<Component<any>, unknown | undefined>;
  #componentToRemoveOnDestroyCallbacks = new Map<Component, OnDestroy>;
  #onDestroyCallbacks: OnDestroy[] = [];

  add<Components extends AddableComponent[]>(...components: Components): this {
    for (const component of components) {
      this.#addComponent(component);
    }

    return this;
  }

  remove<Comp extends Component<any>>(component: Comp): this {
    this.#componentsToValues.delete(component);

    this.#removeDestroyCallback(component);

    return this;
  }

  get<Components extends ComponentWithValue[]>(...components: Components): ComponentsValues<Components> {
    const values = components.map((component) => this.#componentsToValues.get(component));

    return values as ComponentsValues<Components>;
  }

  as(name: string): EntityQuery<typeof this> {
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

  #addComponent<Comp extends AddableComponent>(componentValuesPairOrTag: Comp) {
    let component: Component;
    let values = undefined;

    if (Array.isArray(componentValuesPairOrTag)) {
      [component, values] = componentValuesPairOrTag;
    } else {
      component = componentValuesPairOrTag;
    }

    this.#componentsToValues.set(component, values);

    this.#setupDestroyCallback(component);
  }

  #setupDestroyCallback(component: Component) {
    if (this.#componentToRemoveOnDestroyCallbacks.has(component)) {
      return;
    }

    const handleDestroy = () => {
      this.#componentsToValues.delete(component);
      const removeOnDestroyCallback = this.#componentToRemoveOnDestroyCallbacks.get(component);
      if (removeOnDestroyCallback !== undefined) {
        removeOnDestroyCallback();
        this.#componentToRemoveOnDestroyCallbacks.delete(component);
      }
    };

    const removeOnDestroy = component.onDestroy(handleDestroy);

    this.#componentToRemoveOnDestroyCallbacks.set(component, removeOnDestroy);
  }

  #removeDestroyCallback(component: Component) {
    const removeOnDestroyCallback = this.#componentToRemoveOnDestroyCallbacks.get(component);
    if (removeOnDestroyCallback !== undefined) {
      removeOnDestroyCallback();
      this.#componentToRemoveOnDestroyCallbacks.delete(component);
    }
  }
}

type SchemaIfNotSchemaless<Schema extends ComponentSchema | Schemaless> = (
  Schema extends ComponentSchema
    ? [Schema]
    : []
);

class Component<Schema extends ComponentSchema | Schemaless = Schemaless> extends Entity {
  schema?: Schema;

  constructor(...args: SchemaIfNotSchemaless<Schema>) {
    super();
    this.schema = args[0] as Schema;
  }

  on(source: string | Entity): ComponentQuery<typeof this> {
    return new ComponentQuery(this).on(source);
  }

  as(name: string): ComponentQuery<typeof this> {
    return new ComponentQuery(this).as(name);
  }

  with(values: Values<Schema>): ComponentValuesPair<typeof this, Schema> {
    return [this, values];
  }
}

const relationshipComponents = new Map<[Relationship<any>, Entity], Component<any>>();

class Relationship<Schema extends ComponentSchema | Schemaless = Schemaless> extends Component<Schema> {
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

  as(name: string): RelationshipQuery<typeof this> {
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
    super.on(source);
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

  create(...components: AddableComponent[]): Entity {
    const entity = new Entity().add(...components);
    this.insert(entity);
    return entity;
  }

  insert(entity: Entity): void {
    this.entities.push(entity);
  }

  remove(entity: Entity): void {
    this.entities.filter((e) => e !== entity);
    entity.destroy();
  }
}

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

const john = new Entity().add(Name.with({value: "John Dogowner"}));
world.insert(john);

john.add(Human);
john.add(Likes.with({reason: "test"})); // Wrong, but still somewhat valid usage

// @ts-expect-error
john.add(Name);

const snoopy = world.create(Dog);
snoopy.add(Name.with({value: "Snoopy"}));

john.add(Likes.to(snoopy).with({reason: "Good boy"}));
john.add(Loves.to(Dog));

// @ts-expect-error
john.add(Likes.to(snoopy));

// @ts-expect-error
john.add(Likes.to("liked"));

// @ts-expect-error
const TestComponent = new Component<{ value: typeof String }>();


/////////////////////////////////////////////////////////////////////////////////////

const Any = new Component();
const All = new Component();

/////////////////////////////////////////////////////////////////////////////////////

type Or<QueryParts extends NonBooleanQueryPart[]> = {
  __or: QueryParts;
};

export function or<QueryParts extends NonBooleanQueryPart[]>(
  ...types: QueryParts
): Or<QueryParts> {
  return { __or: types };
}

type Not<QueryPart extends NonBooleanQueryPart> = {
  __not: QueryPart;
};

export function not<QueryPart extends NonBooleanQueryPart>(
  type: QueryPart
): Not<QueryPart> {
  return { __not: type };
}

type Optional<QueryPart extends NonBooleanQueryPart> = {
  __optional: QueryPart;
};

export function optional<QueryPart extends NonBooleanQueryPart>(
  type: QueryPart
): Optional<QueryPart> {
  return { __optional: type };
}

/////////////////////////////////////////////////////////////////////////////////////

type QueryPart = (
  | Component<any>
  | Relationship<any>
  | EntityQuery<any>
  | ComponentQuery<any>
  | RelationshipQuery<any>
  | Not<any>
  | Or<any>
  | Optional<any>
);

type NonBooleanQueryPart = Exclude<QueryPart, Or<any> | Not<any>>;

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

type ParseOrTypes<Parts extends any[]> = (
  Parts extends [infer First, ...infer Rest]
    ? First extends QueryPart
      ? ParseQueryPart<First> extends never
        ? (undefined | ParseOrTypes<Rest>)
        : (ParseQueryPart<First> | ParseOrTypes<Rest>)
      : never
    : never
);

type ParseQueryPart<Part extends QueryPart> = (
  Part extends Optional<infer Type>
    ? (ParseQueryPart<Type> | undefined)
    : Part extends Not<any>
      ? never
      : Part extends Or<infer Types>
        ? ParseOrTypes<Types> extends undefined
          ? never
          : ParseOrTypes<Types>
      : Part extends EntityQuery<infer Type>
        ? Type extends Component<infer Schema>
          ? Values<Schema>
          : Type
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
  FooTagComponent.as("fooTagComp"),
  FooComponent.as("fooComp"),
  FooTagRelationship.as("fooTagRel"),
  FooRelationship.as("fooRel"),
  // Must be related to the type (c) of the thing (a) that another thing (b) is related to
  // This snippet relies on IsA being assigned automatically internally when a component is instantiated
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
  FooTagComponent.as(""),
  FooComponent.as(""),
  FooTagRelationship.as(""),
  FooRelationship.as(""),
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

const item6 = query(Likes.to(Any))[0];

const item7 = query(Likes.to(All))[0];

const item8 = query(
  FooComponent,
  not(FooTagComponent),
  or(FooRelationship, FooComponent),
  or(FooRelationship, FooTagRelationship),
  or(FooTagComponent, FooTagRelationship),
  optional(FooRelationship),
)[0];

/////////////////////////////////////////////////////////////////////////////////////

type Test = ParseQueryPart<[typeof FooComponent, typeof FooTagComponent][number]>;
