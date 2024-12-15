import { Relationship } from "../../relationship/index.ts";
import { Entity } from "../../entity/index.ts";
import { Component } from "../../component/index.ts";
import type { Class } from "../../utils/class.ts";

export type EqualityValue = (
  | string
  | Entity
  | Component<any>
  | Relationship<any>
  | Class<Entity>
);

export type Equals = {
  __left: EqualityValue;
  __right: EqualityValue;
};

export function equals(
  left: EqualityValue,
  right: EqualityValue,
): Equals {
  return {
    __left: left,
    __right: right
  };
}
