import { describe, it, expect } from "vitest";
import { getResultBand, DEFAULT_RESULT_BANDS } from "./result-bands";

describe("Deterministic Result Bands", () => {
  it("resolves exact boundary score 0 to Emerging", () => {
    const band = getResultBand(0);
    expect(band.id).toBe("emerging");
    expect(band.label).toBe("Khởi đầu");
  });

  it("resolves exact boundary score 39 to Emerging", () => {
    const band = getResultBand(39);
    expect(band.id).toBe("emerging");
  });

  it("resolves exact boundary score 40 to Developing", () => {
    const band = getResultBand(40);
    expect(band.id).toBe("developing");
    expect(band.label).toBe("Đang phát triển");
  });

  it("resolves exact boundary score 59 to Developing", () => {
    const band = getResultBand(59);
    expect(band.id).toBe("developing");
  });

  it("resolves exact boundary score 60 to Strong", () => {
    const band = getResultBand(60);
    expect(band.id).toBe("strong");
    expect(band.label).toBe("Vững vàng");
  });

  it("resolves exact boundary score 79 to Strong", () => {
    const band = getResultBand(79);
    expect(band.id).toBe("strong");
  });

  it("resolves exact boundary score 80 to Standout", () => {
    const band = getResultBand(80);
    expect(band.id).toBe("standout");
    expect(band.label).toBe("Xuất sắc");
  });

  it("resolves exact boundary score 100 to Standout", () => {
    const band = getResultBand(100);
    expect(band.id).toBe("standout");
  });

  it("clamps out-of-range negative values to lowest band", () => {
    const band = getResultBand(-10);
    expect(band.id).toBe("emerging");
  });

  it("clamps out-of-range values above 100 to highest band", () => {
    const band = getResultBand(110);
    expect(band.id).toBe("standout");
  });
});
