import request from "supertest";
import app from "../../src/app";
import { userRole } from "../../src/common/userRole.enum";

jest.mock('ioredis');
jest.mock('bullmq');

describe("Auth API", () => {
  
  it("should login seeded admin", async () => {
    const res = await request(app).post("/auth/login").send({
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(process.env.ADMIN_EMAIL);
    expect(res.body.data.user.role).toBe(userRole.ADMIN);
  });

  it("should reject login with invalid password", async () => {
    const res = await request(app).post("/auth/login").send({
      email: process.env.ADMIN_EMAIL,
      password: "wrong-password",
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Invalid password");
  });

  it("should reject login with non-existent user", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "nouser@example.com",
      password: "password",
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("User not found");
  });

  it("should fetch profile for an authenticated user", async () => {
    const loginRes = await request(app).post("/auth/login").send({
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
    });
    const token = loginRes.body.data.token;

    const res = await request(app)
      .get("/auth/profile")
      .set("Authorization", `Bearer ${token}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.data.user.email).toBe(process.env.ADMIN_EMAIL);
    expect(res.body.data.user.password).toBeUndefined();
  });

  it("should fail to fetch profile without a token", async () => {
    const res = await request(app).get("/auth/profile");
    expect(res.statusCode).toBe(401);
  });
});