import { describe, expect, it } from "vitest";
import { splitItemId } from "../src/lib/collections";

describe("splitItemId", () => {
  it("läser produkt och kollektion", () => {
    expect(splitItemId("arssten~skogen")).toEqual({ productId: "arssten", collection: "Skogen" });
    expect(splitItemId("avtryck-hylla~angen")).toEqual({ productId: "avtryck-hylla", collection: "Ängen" });
  });
  it("tar id utan kollektion som det är", () => {
    expect(splitItemId("stenhyllan")).toEqual({ productId: "stenhyllan" });
  });
  it("nekar okända kollektioner och konstiga id:n", () => {
    expect(splitItemId("arssten~havet")).toBeNull();
    expect(splitItemId("arssten~skogen~sjon")).toBeNull();
    expect(splitItemId("~skogen")).toBeNull();
  });
});
