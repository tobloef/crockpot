import { Entities } from "./entities.js";
import { Components } from "./components.js";
import { Relations } from "./relations.js";

export class World {
  #entities = new Entities();
  #components = new Components();
  #relations = new Relations();

  get entities() {
    return this.#entities;
  }

  get components() {
    return this.#components;
  }

  get relations() {
    return this.#relations;
  }
}