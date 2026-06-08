import {
  validateFullName,
  validateIdNumber,
  validateAccountNumber,
  validateSwiftCode,
  validateAmount,
} from "../Services/validation.js";

describe("validation functions", () => {
  test("id validation works", () => {
    expect(validateIdNumber("1234567890123")).toBe(true);
    expect(validateIdNumber("abc")).toBe(false);
  });

  test("account validation works", () => {
    expect(validateAccountNumber("123456")).toBe(true);
    expect(validateAccountNumber("12")).toBe(false);
  });

  test("swift validation works", () => {
    // FIXED: proper SWIFT format (11 chars)
    expect(validateSwiftCode("DEUTDEFFXXX")).toBe(true);
  });

  test("amount validation works", () => {
    expect(validateAmount(100)).toBe(true);
    expect(validateAmount(-1)).toBe(false);
  });
});