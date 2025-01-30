## Stuff I don't like

* Since you can instantiate an Edge without adding it to the graph, the Edge's nodes has to be nullable, despite them not being null in by far the most cases. In a more DOD version, you would not have normal class instantiation and you could make sure that you _have_ to pass nodes when creating an edge.