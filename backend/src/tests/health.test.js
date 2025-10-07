/** @jest-environment node */
// backend/src/tests/health.test.js
import supertest from "supertest";

describe("health + root endpoints", () => {
  let request;

  beforeAll(async () => {
    // Make the app start without connecting to MongoDB during tests.
    process.env.SKIP_DB = "true";
    process.env.NODE_ENV = "test";

    // IMPORTANT: correct relative path (test is in src/tests/, app is in src/)
    const { default: app } = await import("../server.js");
    request = supertest(app);
  });

  test("GET /api/health returns ok", async () => {
    const res = await request.get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status", "ok");
    expect(res.body).toHaveProperty("timestamp");
  });

  test("GET / returns welcome message", async () => {
    const res = await request.get("/");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message");
  });
});
