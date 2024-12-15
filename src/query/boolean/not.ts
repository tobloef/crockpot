import type { QueryPart } from "../part.ts";

export type Not<Part extends QueryPart> = {
  __not: Part;
};

export function not<Part extends QueryPart>(
  queryPart: Part,
): Not<Part> {
  return { __not: queryPart };
}
