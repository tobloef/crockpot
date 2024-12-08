export type QueryInput<QueryPart> = QueryArrayInput<QueryPart> | QueryObjectInput<QueryPart> | QueryPart;
export type QueryArrayInput<QueryPart> = Array<QueryPart>;
export type QueryObjectInput<QueryPart> = Record<string, QueryPart>

export type SpreadOrObjectQueryInput<Input extends QueryInput<QueryPart>, QueryPart> = (
  Input extends QueryArrayInput<QueryPart>
    ? Input
    : Input extends QueryObjectInput<QueryPart>
      ? [Input]
      : never
  );
