export class GraphEdge {
  #brand = "GraphEdge" as const;

  edgeMethod(): string {
    return "This is a method from GraphEdge";
  }
}
