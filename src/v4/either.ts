export class Either<Item> {
  #brand = 'Either' as const;

  items: Item[];

  constructor(items: Item[]) {
    this.items = items;
  }
}

export function either<Item>(
  ...items: Item[]
): Either<Item> {
  return new Either(items);
}