## Stuff to remember

### Package

* From Git tag: `"git+https://git@github.com/tobloef/crockpot.git#v1.0.0"`
* From local: `"file:../dist"`


### Benchmarking

```bash
hyperfine 'node file.js'
# Comparing multiple tests:
hyperfine 'node file1.js' 'node file2.js'
# Use a markdown exporter:
hyperfine --export-markdown results.md 'node file1.js' 'node file2.js'
```

### CPU Profiling

```bash
node --cpu-prof --cpu-prof-name profile.cpuprofile file.js
cpupro profile.cpuprofile
```

Could be aliased like so:

```bash
profile () {
  base_name=$(basename "$1" .ts)
  timestamp=$(date +"%Y-%m-%d_%H-%M-%S")
  profile_filename="${base_name}_${timestamp}.cpuprofile"
  node --cpu-prof --cpu-prof-name "$profile_filename" "$1"
  cpupro "$profile_filename"
}
```

## Stuff I don't like

* Since you can instantiate an Edge without adding it to the graph, the Edge's nodes has to be nullable, despite them not being null in by far the most cases. In a more DOD version, you would not have normal class instantiation and you could make sure that you _have_ to pass nodes when creating an edge.

* In a smarter permutation finding mechanism with graph traversal, you could not only cut down on permutations to check, but you could perhaps also ensure that permutations are only created from the output nodes, so that no output can show up twice. Then you don't have to store and check for duplicate outputs.

* Making it possible to save query input instances, as well as query plans, would be useful for caching and advanced usage. So perhaps the query methods should be able to take in both, and be a bit more like the builder pattern.

* Inferring string reference types is _purely_ for the mad science of it. You could very easily do `query([Person.to("t"), Transform.as("t")])` instead of `query([Person.to(Transform.as("t")), "t"])`.

* For object-inputs when querying, you can apparently not infer the reference name without using `as const`. See this minimal example of the issue:
  * ```ts
    function test<Input extends Record<string, string>>(input: Input): (
      { [K in keyof Input]: Input[K] }
    ) {
      throw new Error();
    }
    const output1 = test({ a: "ref" }); // Expected to be { a: "ref" }, but is { a: string }
    const output2 = test({ a: "ref" } as const); // Is { a: "ref" }, as expected
    ```
  * In the future, perhaps the compiler will be smart enough. 

* Inheritance hierarchy is a bit funky for query items.

* After you have queried, you still need to check for the existence of the edges when working with the fetched node. This is natural in with the class-based approach, as we cannot guarantee that the reference has not been changed after the query was run. But in a data-oriented approach, the returned result would not have references and would just contain the data directly. You might want to make the distinction between `where` and `with` in such a case, to not fetch data you just want to filter on.
  * Keep in mind that this can already be worked around today, by having the query return the items you want to work with (`[Node.to(Node.as("x")), "x"]`).

* Slots could just be small indices instead of random strings. Then, for named slots, you have some kind of mapping in the context.
