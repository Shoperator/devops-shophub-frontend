/**
 * Stand-in for `next/navigation`. The real hooks need an App Router context
 * that only exists inside a running Next server, so every test file gets this
 * one instead (wired up in `jest.setup.ts`).
 */
export const routerMock = {
  push: jest.fn(),
  replace: jest.fn(),
  refresh: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  prefetch: jest.fn(),
};

/**
 * What a dynamic segment resolves to. `useParams` reads this object rather than
 * a fresh one, so a test can point the page at an id before rendering it.
 */
export const routeParamsMock: Record<string, string> = {};

export function setRouteParams(params: Record<string, string>): void {
  for (const key of Object.keys(routeParamsMock)) {
    delete routeParamsMock[key];
  }
  Object.assign(routeParamsMock, params);
}

export const useRouter = () => routerMock;
export const usePathname = () => "/";
export const useSearchParams = () => new URLSearchParams();
export const useParams = () => routeParamsMock;
