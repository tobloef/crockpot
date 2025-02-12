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

* Inferring string reference types is _purely_ for the mad science of it. You could very easily do `query([Person.to("t"), Transform.as("t")])` instead of `query([Person.to(Transform.as("t")), "t"])`. Or even:

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