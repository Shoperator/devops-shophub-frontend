# devops-shophub-frontend

Frontend for the ShopHub platform.

## Running locally

```bash
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:3000" > .env.local
npm run dev
```

## Tests

```bash
npm test
```

Jest with Testing Library, driven through the pages the way a user goes through
them. The service layer is stubbed, so a test asserts what the app asks the
backend for, never how it is fetched. Runs on every pull request.

Two things in the test setup are worth knowing about:

- `next/navigation` is replaced by [`src/test-utils/nextNavigation.ts`](src/test-utils/nextNavigation.ts),
  since the real hooks need an App Router context that only exists inside a
  running Next server.
- `next-runtime-env` is replaced by [`src/test-utils/nextRuntimeEnv.tsx`](src/test-utils/nextRuntimeEnv.tsx).
  Its entry point re-exports a server component and pulls a large part of the
  Next server runtime into the test; the stub reproduces what the library
  actually does in a browser, which is one lookup in `window.__ENV`.

## Pages

| Path | Who | What |
| --- | --- | --- |
| `/` | everyone | Landing page |
| `/login`, `/register` | signed out | Sign in and self-registration |
| `/account` | signed in | The profile behind the token |
| `/shops` | signed in | The shops this account owns |
| `/shops/new` | signed in | Create a shop and deploy it |
| `/shops/[id]` | signed in | Reconfigure or delete one shop |

A shop card links to the deployed site in a new tab, since a shop is its own
application. `/shops/[id]` offers the settings a live shop can still be changed
with — availability and wallet address — and shows the rest (name, address,
database) as facts, because they are settled when the shop is created.

ShopHub has a single kind of account, so there is nothing to authorize beyond
being signed in. Every signed-in page is wrapped in `<RequireAuth>`, a UX guard
rather than a security boundary — the backend enforces the same rule on the
token, and the page calls an endpoint that rejects anyone else.

The session — the access token and the user it belongs to — is kept in
`localStorage` and read through `useSyncExternalStore`, so a sign-in in one tab
shows up in the others and a reload keeps the user signed in until the token
expires.

## Configuration

| Variable | Default | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3000` | Base URL of the ShopHub backend |

Set it on the running container, not at build time.

Next.js substitutes `NEXT_PUBLIC_*` variables into the bundle during
`next build`. The image is built once and deployed with whatever backend address
the cluster gives it, so a build-time substitution would freeze the default
above into the JavaScript and the variable set on the container would have no
effect. The value is therefore read per request through
[`next-runtime-env`](https://github.com/expatfile/next-runtime-env):
`<PublicEnvScript />` in the root layout sends the container's variables to the
browser with each response.

Two constraints follow from this:

- Read the address through `getApiBaseUrl()`, not `process.env.NEXT_PUBLIC_*`.
- Call it inside a component or a request handler. Module-level code is
  evaluated during the build, so a top-level `const` freezes the default again:

  ```ts
  const base = getApiBaseUrl();        // evaluated once, at build time
  function useApi() {
    const base = getApiBaseUrl();      // evaluated per request
  }
  ```

All routes are consequently server-rendered on demand — `next build` reports `ƒ`
rather than `○`.
