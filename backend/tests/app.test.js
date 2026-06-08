import request from "supertest";
import app from "../server.js";

describe("APDS Backend API Tests", () => {

  test("GET / health check", async () => {
    const res = await request(app).get("/");

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBeDefined();
  });

  test("POST /signup is disabled", async () => {
    const res = await request(app).post("/signup");

    expect(res.statusCode).toBe(403);
  });

  test("GET /dashboard without token should fail", async () => {
    const res = await request(app).get("/dashboard");

    expect([401, 403]).toContain(res.statusCode);
  });

  test("POST /login validation error (empty body)", async () => {
    const res = await request(app).post("/login").send({});

    expect(res.statusCode).toBe(400);
  });

  test("POST /login invalid ID format", async () => {
    const res = await request(app).post("/login").send({
      idNumber: "abc",
      password: "12345678"
    });

    expect(res.statusCode).toBe(400);
  });

  test("GET /me without token should fail", async () => {
    const res = await request(app).get("/me");

    expect([401, 403]).toContain(res.statusCode);
  });

  test("POST /payment should require auth", async () => {
    const res = await request(app).post("/payment").send({});

    expect([401, 403]).toContain(res.statusCode);
  });

  test("GET /transactions should require auth", async () => {
    const res = await request(app).get("/transactions");

    expect([401, 403]).toContain(res.statusCode);
  });

});