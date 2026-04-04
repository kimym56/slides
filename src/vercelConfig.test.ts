import { readFileSync } from "node:fs";
import path from "node:path";

it("defines a Vercel SPA rewrite so /kr resolves to the app shell", () => {
  const vercelConfigPath = path.resolve(__dirname, "../vercel.json");
  const vercelConfig = JSON.parse(readFileSync(vercelConfigPath, "utf8")) as {
    rewrites?: Array<{ destination?: string; source?: string }>;
  };

  expect(vercelConfig.rewrites).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        destination: "/",
        source: "/(.*)",
      }),
    ]),
  );
});
