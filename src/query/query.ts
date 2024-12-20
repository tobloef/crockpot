import { Entity } from "../entity/index.ts";
import type { QueryArrayInput, QueryInput, QueryObjectInput, } from "./input.ts";
import type { QueryPart } from "./part.ts";
import type { QueryOutput } from "./output.ts";
import { Component, ComponentInstanceQuery } from "../component/index.ts";

export function query<Input extends QueryArrayInput<QueryPart>>(
  entities: Entity[],
  input: [...Input]
): QueryOutput<Input>;

export function query<Input extends QueryObjectInput<QueryPart>>(
  entities: Entity[],
  input: Input
): QueryOutput<Input>;

export function query<Input extends QueryInput>(
  entities: Entity[],
  input: Input,
): QueryOutput<Input> {
  if (entities.length === 0) {
    return [];
  }

  if (Object.keys(input).length === 0) {
    return [];
  }

  let results = [];

  entityLoop:
  for (const entity of entities) {
    if (Array.isArray(input)) {
      let item: any[] = [];

      for (const part of input) {
        if (part instanceof Component) {
          if (entity.has(part)) {
            item.push(entity.get(part));
          } else {
            continue entityLoop;
          }
        } else if (part instanceof ComponentInstanceQuery) {
          if (part.source !== undefined) {
            if (part.source instanceof Entity) {
              if (part.source.has(part.component)) {
                item.push(part.source.get(part.component));
              } else {
                continue entityLoop;
              }
            }
          } else {
            if (entity.has(part.component)) {
              item.push(entity.get(part.component));
            } else {
              continue entityLoop;
            }
          }
        }
      }

      results.push(item);
    } else {
      let item: Record<string, any> = {};

      for (const key in input) {
        const part = input[key];

        if (part instanceof Component) {
          if (entity.has(part)) {
            item[key] = entity.get(part);
          } else {
            continue entityLoop;
          }
        } else if (part instanceof ComponentInstanceQuery) {
          if (part.source !== undefined) {
            if (part.source instanceof Entity) {
              if (part.source.has(part.component)) {
                item[key] = part.source.get(part.component);
              } else {
                continue entityLoop;
              }
            }
          } else {
            if (entity.has(part.component)) {
              item[key] = entity.get(part.component);
            } else {
              continue entityLoop;
            }
          }
        }
      }

      results.push(item);
    }
  }

  return results as any;
}
