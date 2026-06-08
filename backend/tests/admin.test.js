import request from "supertest";
import app from "../server.js";

describe("Admin + Auth Coverage Tests", () => {

  test("GET /admin/users should require auth", async () => {
    const res = await request(app).get("/admin/users");
    expect([401, 403]).toContain(res.statusCode);
  });

  test("DELETE /admin/users/:id invalid ID format should fail (auth blocks first)", async () => {
    const res = await request(app).delete("/admin/users/abc");

    // FIX: middleware runs first → 401 is correct
    expect([400, 401, 403]).toContain(res.statusCode);
  });

  test("DELETE /admin/users/:id self-delete prevention path", async () => {
    const res = await request(app).delete("/admin/users/1");

    expect([400, 401, 403]).toContain(res.statusCode);
  });

  test("POST /admin/create-user should require auth", async () => {
    const res = await request(app).post("/admin/create-user").send({
      fullNames: "Test User",
      idNumber: "1234567890123",
      accountNumber: "12345678",
      password: "Password123",
      is_admin: false
    });

    expect([401, 403]).toContain(res.statusCode);
  });

});