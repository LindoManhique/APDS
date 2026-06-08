import { describe, test, expect, jest } from "@jest/globals";
import { verifyToken } from "../middleware/authMiddleware.js";


describe("authMiddleware direct coverage", () => {
  test("should reject request with no token", () => {
    const req = { headers: {} };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("should reject invalid token", () => {
    const req = {
      headers: { authorization: "Bearer invalidtoken" },
      cookies: {},
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const next = jest.fn();

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
  });
});