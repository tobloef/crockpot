import type { QueryInputItem } from "./query.ts";

export class Either<Items extends QueryInputItem[]> {
  #brand = 'Either' as const;

  items: Items;

  constructor(items: Items) {
    this.items = items;
  }
}

export function either<Items extends QueryInputItem[]>(
  ...items: Items
): Either<Items> {
  return new Either(items);
}