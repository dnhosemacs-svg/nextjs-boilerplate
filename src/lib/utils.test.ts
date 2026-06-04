import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("combina clases", () => {
    expect(cn("a", "b")).toBe("a b");
  });
});
