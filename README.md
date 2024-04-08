# Setup

Create new npm project, e.g. `my-game-editor`. I suggest to use vite - `npm create vite`.

Install Toolmate's core:

```sh
npm i @toolmate/core
```

In the main script of your newly created project add:

```ts
import '@toolmate/core/style'
import { render } from '@toolmate/core'

render()
```

Run the project:

```sh
npm run dev # Works if only you used `npm create vite`. Otherwise use your command to run dev server.
```

## More info is coming soon

Toolmate itself is just a framework that provides your project with workspaces, areas and tabs. It's meant to be extended by plugins of yours (or of the community) that add new functionality into your toolmate-based editor.

**More info about it will be added here soon.**

## License

Toolmate is [GNU AGPLv3 Licensed](./LICENSE).
