import type { Class } from "../utils/class.ts";
import type { Entity } from "../entity/index.ts";
import type { Relationship } from "../relationship/index.ts";
import type { Component } from "../component/index.ts";

export type Wildcard = (
  | Class<Entity>
  | Class<Component<any>>
  | Class<Relationship<any>>
  );