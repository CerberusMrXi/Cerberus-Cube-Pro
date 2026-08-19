import { describe, expect, it } from "vitest";
import { storageGet } from "./storage";

describe("managed File Storage paths", () => {
  it("normalizes a stored asset key into the frontend storage route", async () => {
    await expect(storageGet("/cerberus-assets/hero.jpg")).resolves.toEqual({
      key: "cerberus-assets/hero.jpg",
      url: "/manus-storage/cerberus-assets/hero.jpg",
    });
  });
});
