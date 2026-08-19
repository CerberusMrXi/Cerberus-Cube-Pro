# Run Cerberus Cube Pro Locally on Windows

This project is now a full-stack application. Its hero, guide, validation, and brand images are served by managed File Storage through `/manus-storage/...` paths. The application therefore needs its full-stack development server, started with `pnpm dev`; do not use a static Vite-only command. The project now bundles a cross-platform environment utility, so this command works directly in **Windows PowerShell** without setting `NODE_ENV` manually.

## Start the app

```powershell
corepack enable
corepack prepare pnpm@10.4.1 --activate
pnpm install
pnpm dev
```

Open the address printed in the terminal, normally `http://localhost:3000`.

If you previously saw `'NODE_ENV' is not recognized`, pull this version, run `pnpm install` once to install the updated dependencies, and then run `pnpm dev` again.

## If an image still does not appear

Confirm that `pnpm dev` has started the full-stack service, then open the storage route shown in the browser console or the project README. Restart the server and refresh with `Ctrl+F5` to remove a stale browser cache. For replacement images, use the project File Storage panel and update the corresponding `/manus-storage/...` reference in the interface.

The browser camera will work on `localhost` on the same computer. For a physical phone, use a published HTTPS link; ordinary `http://192.168.x.x` local-network addresses generally cannot request mobile camera access.
