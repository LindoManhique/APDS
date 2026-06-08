import { hashPassword, verifyPassword } from "../Services/authServices.js";

describe("auth services", () => {
  test("hashPassword returns string", async () => {
    const hash = await hashPassword("Password123");
    expect(typeof hash).toBe("string");
  });

  test("verifyPassword works", async () => {
    const hash = await hashPassword("Password123");
    const result = await verifyPassword("Password123", hash);
    expect(result).toBe(true);
  });
});