# sveltekit-firebase-adapter

This is a fork of [simonnepomuk's adapter](https://github.com/simonnepomuk/monorepo#readme) for my own use, but if it's useful for others, feel free to use it.

## Changelog

- feat: added node 18 & 20 to the `nodeVersion` option.
- feat: added some extra dependencies that seemed to be missing to the generated `package.json`.
- fix: cors being stringified to '{}'.
- fix: install of dependencies in functions directory.
- feat: add `autoInstallDeps` flag in options to be able to toggle off automatic install of dependencies in functions directory.