import request from "supertest";
import app from "../../src/app";
import { userRole } from "../../src/common/userRole.enum";

jest.mock('ioredis');
jest.mock('bullmq');

let adminToken: string;

describe("User API", () => {
  beforeEach(async () => {
    const res = await request(app).post("/auth/login").send({
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
    });
    adminToken = res.body.data.token;
  });

  describe("POST /users", () => {
    it("should create a new user with 'user' role", async () => {
      const newUser = {
        email: "testuser@example.com",
        password: "Password123!",
        role: userRole.USER,
      };
      const res = await request(app)
        .post("/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(newUser);

      expect(res.statusCode).toBe(201);
      expect(res.body.data.user.email).toBe(newUser.email);
      expect(res.body.data.user.role).toBe(userRole.USER);
      expect(res.body.data.user.password).toBeUndefined();
    });

    it("should fail to create a user with an existing email", async () => {
        const newUser = {
            email: process.env.ADMIN_EMAIL,
            password: "Password123!",
            role: userRole.USER,
        };
        const res = await request(app).post("/users").set("Authorization", `Bearer ${adminToken}`).send(newUser);
        
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("User already exists");
    });
    
    it("should fail to create a user with invalid data (e.g., short password)", async () => {
        const res = await request(app)
            .post("/users")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ email: "bad@example.com", password: "short", role: "user" });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Validation failed");
    });

    it("should fail if a non-admin tries to create a user", async () => {
        const userRes = await request(app).post("/users").set("Authorization", `Bearer ${adminToken}`).send({
            email: "regularuser@example.com",
            password: "Password123!",
            role: userRole.USER,
        });

        const loginRes = await request(app).post("/auth/login").send({
            email: "regularuser@example.com",
            password: "Password123!",
        });
        const userToken = loginRes.body.data.token;

        const res = await request(app).post("/users").set("Authorization", `Bearer ${userToken}`).send({
            email: "anotheruser@example.com",
            password: "Password123!",
            role: userRole.USER,
        });

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toBe("You are not authorized to create users");
    });
  });

  describe("GET /users", () => {
    it("should list all users for an admin", async () => {
      await request(app).post("/users").set("Authorization", `Bearer ${adminToken}`).send({
        email: "testuser@example.com",
        password: "Password123!",
        role: userRole.USER,
      });

      const res = await request(app)
        .get("/users")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.users).toHaveLength(2);
      expect(res.body.data.users[0].password).toBeUndefined();
    });
  });
  
  describe("PUT /users/:id/role", () => {
      it("should allow admin to update a user's role", async () => {
          const userResponse = await request(app).post("/users").set("Authorization", `Bearer ${adminToken}`).send({
              email: "change-my-role@example.com",
              password: "Password123!",
              role: userRole.USER,
          });
          const userId = userResponse.body.data.user.id;

          const res = await request(app)
              .put(`/users/${userId}/role`)
              .set("Authorization", `Bearer ${adminToken}`)
              .send({ role: userRole.ADMIN });
          
          expect(res.statusCode).toBe(200);
          expect(res.body.data.user.role).toBe(userRole.ADMIN);
      });
  });
});