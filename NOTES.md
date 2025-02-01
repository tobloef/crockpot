## Stuff I don't like

* Since you can instantiate an Edge without adding it to the graph, the Edge's nodes has to be nullable, despite them not being null in by far the most cases. In a more DOD version, you would not have normal class instantiation and you could make sure that you _have_ to pass nodes when creating an edge.

* In a smarter permutation finding mechanism with graph traversal, you could not only cut down on permutations to check, but you could perhaps also ensure that permutations are only created from the output nodes, so that no output can show up twice. Then you don't have to store and check for duplicate outputs.

* Inferring string reference types is _purely_ for the mad science of it. You could very easily do `query([Person.to("t"), Transform.as("t")])` instead of `query([Person.to(Transform.as("t")), "t"])`. Or even: