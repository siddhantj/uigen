// Fix Node.js 25+ Web Storage SSR compatibility.
//
// Node 25 exposes global localStorage/sessionStorage via the experimental
// Web Storage API (--experimental-webstorage, enabled by default). Without
// --localstorage-file these globals exist but are non-functional, causing
// "localStorage.getItem is not a function" errors during SSR when
// dependencies detect the global and assume a browser environment.
//
// Removing the globals on the server restores pre-25 behaviour where
// typeof localStorage === "undefined" and SSR guard checks work correctly.

if (typeof globalThis !== "undefined" && typeof window === "undefined") {
  delete globalThis.localStorage;
  delete globalThis.sessionStorage;
}

// Windows: the legacy "Application Data" junction under %USERPROFILE% throws
// EPERM on scandir for every process. Build-time globs that walk the user
// home (Next's trace collector, Prisma's engine lookup) crash on it. Patch
// readdirSync to treat EPERM/EACCES on that path as "empty directory".
// Windows: the legacy "Application Data" junction under %USERPROFILE% throws
// EPERM on scandir for every process. Build-time globs that walk the user
// home (Next's trace collector, Prisma's engine lookup) crash on it. Redirect
// HOME/USERPROFILE to the project root so those walkers never reach it.
// We do this here (not in the npm script) so it works regardless of shell.
if (process.platform === "win32") {
  const projectRoot = __dirname;
  process.env.USERPROFILE = projectRoot;
  process.env.HOME = projectRoot;
}
