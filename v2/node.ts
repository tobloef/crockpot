export class GraphNode {
  #brand = "GraphNode" as const;

  nodeMethod(): string {
    return "This is a method from GraphNode";
  }
}
