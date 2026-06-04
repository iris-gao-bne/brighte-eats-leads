import { describe, it, expect } from "vitest";
import { RegisterInputSchema } from "../validation.js";

const validInput = {
  name: "Alice",
  email: "alice@example.com",
  mobile: "0412345678",
  postcode: "2000",
  services: ["delivery"],
};

describe("RegisterInputSchema", () => {
  it("accepts valid input", () => {
    expect(RegisterInputSchema.safeParse(validInput).success).toBe(true);
  });

  // Assessment: "a required field becoming optional"
  it("rejects missing email", () => {
    const { email: _, ...rest } = validInput;
    expect(RegisterInputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing mobile", () => {
    const { mobile: _, ...rest } = validInput;
    expect(RegisterInputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty name", () => {
    expect(
      RegisterInputSchema.safeParse({ ...validInput, name: "" }).success
    ).toBe(false);
  });

  it("rejects invalid email format", () => {
    expect(
      RegisterInputSchema.safeParse({ ...validInput, email: "not-an-email" }).success
    ).toBe(false);
  });

  it("rejects non-AU mobile format", () => {
    expect(
      RegisterInputSchema.safeParse({ ...validInput, mobile: "1234567890" }).success
    ).toBe(false);
  });

  it("rejects postcode shorter than 4 digits", () => {
    expect(
      RegisterInputSchema.safeParse({ ...validInput, postcode: "200" }).success
    ).toBe(false);
  });

  it("rejects postcode longer than 4 digits", () => {
    expect(
      RegisterInputSchema.safeParse({ ...validInput, postcode: "20001" }).success
    ).toBe(false);
  });

  it("rejects empty services array", () => {
    expect(
      RegisterInputSchema.safeParse({ ...validInput, services: [] }).success
    ).toBe(false);
  });
});
