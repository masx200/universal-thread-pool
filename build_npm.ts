import { build, emptyDir } from "https://deno.land/x/dnt@0.23.0/mod.ts";
import { assert } from "https://deno.land/std@0.135.0/testing/asserts.ts";
const packagejson = JSON.parse(await Deno.readTextFile("./package.json"));
assert(typeof packagejson === "object" && packagejson !== null);

// console.log(packagejson);
await emptyDir("./npm");

await build({
    typeCheck: false,
    test: false,
    packageManager: "yarn",
    mappings: {
        // "https://cdn.skypack.dev/comlink@4.3.1?dts": {
        //     name: "comlink",
        //     version: "4.3.1",
        // },
        "https://esm.sh/@vue/reactivity@3.2.33/dist/reactivity.esm-bundler.js":
            {
                name: "@vue/reactivity",
                version: "3.2.33",
            },
    },
    entryPoints: ["./mod.ts"],
    outDir: "./npm",
    shims: {
        // see JS docs for overview and more options
        // deno: true,
    },
    package: {
        // package.json properties
        name: "your-package",
        version: "Deno.args[0]",
        description: "Your package.",
        license: "MIT",
        repository: {
            type: "git",
            url: "git+https://github.com/username/repo.git",
        },
        bugs: {
            url: "https://github.com/username/repo/issues",
        },
        ...packagejson,
    },
});

// post build steps
Deno.copyFileSync("LICENSE", "npm/LICENSE");
Deno.copyFileSync("README.md", "npm/README.md");
