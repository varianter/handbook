import type { Loader, LoaderContext } from "astro/loaders";
import { glob } from "astro/loaders";
import { augmentWithGitMeta } from "./git-meta.js";

interface GitGlobOptions {
  pattern: string | Array<string>;
  base: string;
}

/**
 * Wraps Astro's `glob()` loader. For each parsed entry that maps to a local
 * file, the entry's data is augmented with a `lastCommit` object (commitSha,
 * date, relPath, repoSlug, pathHash) resolved from git before the collection
 * schema is applied. Non-existent
 * or untracked files leave `lastCommit` `null`.
 *
 * The augmentation logic itself lives in `git-meta.ts` and is unit-tested
 * there; this wrapper only wires it into Astro's loader pipeline.
 */
export function gitGlobLoader(options: GitGlobOptions): Loader {
  const inner = glob(options);

  return {
    name: "git-glob",
    load: async (context: LoaderContext) => {
      const wrappedContext: LoaderContext = {
        ...context,
        parseData: async (props) => {
          const augmentedData = augmentWithGitMeta(props.filePath, props.data);
          return context.parseData({ ...props, data: augmentedData });
        },
      };
      await inner.load(wrappedContext);
    },
  };
}
