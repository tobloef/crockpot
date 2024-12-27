import type { QueryPart } from "../part.ts";

export type Not<Part extends QueryPart> = {
  __not: Part;
};

const notFunction = <Part extends QueryPart>(
  queryPart: Part,
): Not<Part> => {
  return not(queryPart);
};

/** @alias not */
export const noneOf = notFunction;

/** @alias noneOf */
export const not = notFunction;
