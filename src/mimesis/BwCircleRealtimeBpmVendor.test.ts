import { readFileSync } from "node:fs";
import path from "node:path";

it("does not ship a CommonJS require in the browser-facing bpm vendor bridge", () => {
  const vendorPath = path.resolve(
    process.cwd(),
    "../mimesis/src/projects/bw-circle/bwCircleRealtimeBpmVendor.ts",
  );
  const source = readFileSync(vendorPath, "utf8");

  expect(source).not.toContain("require(");
});

it("imports the bw-circle realtime bpm vendor bridge in the browser-facing slides app", async () => {
  const vendor = await import(
    "@mimesis/projects/bw-circle/bwCircleRealtimeBpmVendor"
  );

  expect(typeof vendor.createRealtimeBpmAnalyzer).toBe("function");
  expect(typeof vendor.getBiquadFilter).toBe("function");
});
