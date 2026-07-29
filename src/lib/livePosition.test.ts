import { describe, expect, it } from "vitest";
import { calculateLivePositionMovement, formatPositionMovement } from "./livePosition";

describe("live position movement", () => {
  it("calculates long and short movement", () => {
    expect(calculateLivePositionMovement("long", 100, 105)).toEqual({ percentage: 5, status: "profit" });
    expect(calculateLivePositionMovement("short", 100, 95)).toEqual({ percentage: 5, status: "profit" });
    expect(calculateLivePositionMovement("short", 100, 105)).toEqual({ percentage: -5, status: "loss" });
  });

  it("handles neutral and invalid prices", () => {
    expect(calculateLivePositionMovement("long", 100, 100)).toEqual({ percentage: 0, status: "neutral" });
    expect(calculateLivePositionMovement("long", 0, 100)).toBeNull();
  });

  it("formats positive movement with a leading plus sign", () => {
    expect(formatPositionMovement(1.234)).toBe("+1.23%");
    expect(formatPositionMovement(-1.234)).toBe("-1.23%");
  });
});
