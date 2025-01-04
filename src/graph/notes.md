How can you create a semantic graph for edges, if you cannot connect a node to an edge?

 * Option A: Edge becomes a subtype of Node
 * Option B: Edges cannot have values
 * Option C: Allow edges to connect to edges as well, without them being nodes.
 * Option D: Only create semantics for nodes

```js

// -------- A --------

class Node {}
class Edge extends Node {}

class Transform extends Node {}
class ChildOf extends Edge {}

const child = new Transform();
const parent = new Transform();
const childOf = new ChildOf({ from: child, to: parent });

new IsA({ from: childOf, to: childOfType }); // From an edge (which is a node) to a node
query(Node); // Will return the edge as well

// -------- B --------

class Node {}

class Transform extends Node {}
class ChildOf extends Node {}

const child = new Transform();
const parent = new Transform();
const childOf = new ChildOf();

const isA = new IsA();
isA.edgeTo(childOfType);
isA.edgeFrom(childOf);

child.edgeTo(childOf);
parent.edgeFrom(childOf);

query(Node); // Will return the edge as well, but it's more expected

// -------- C --------

class Node {}
class Edge {}

class Transform extends Node {}
class ChildOf extends Edge {}

const child = new Transform();
const parent = new Transform();
const childOf = new ChildOf({ from: child, to: parent });

new IsA({ from: childOf, to: childOfType }); // From an edge to a node

query(Node); // Will only return nodes
```

I'm thinking A or C. But which one...?