export type EqualityValue = (
  | string
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
    __right: right,
  };
}
