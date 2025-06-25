import request from "supertest";
import app from "../../src/app";
import { projectStatus } from "../../src/common/projectStatus.enum";

jest.mock('ioredis');
jest.mock('bullmq');

let adminToken: string;
let projectId: number;

describe("Project API", () => {
  beforeEach(async () => {
    const res = await request(app).post("/auth/login").send({
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
    });
    adminToken = res.body.data.token;

    const projectRes = await request(app)
      .post("/projects")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Test Project",
        description: "Sample description",
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000).toISOString(),
        status: projectStatus.PENDING,
      });
    projectId = projectRes.body.data.project.id;
  });

  it("should create a new project", async () => {
    const res = await request(app)
      .post("/projects")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Another Project",
        description: "Another description",
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000).toISOString(),
        status: projectStatus.PENDING,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.project.name).toBe("Another Project");
  });

  it("should fetch a specific project by ID", async () => {
    const res = await request(app)
      .get(`/projects/${projectId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.project.id).toBe(projectId);
  });

  it("should return 404 for a non-existent project", async () => {
      const res = await request(app)
          .get('/projects/9999')
          .set("Authorization", `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(404);
  });
  
  it("should update a project", async () => {
    const res = await request(app)
      .patch(`/projects/${projectId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ description: "Updated description" });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.project.description).toBe("Updated description");
  });

  it("should delete a project", async () => {
      const res = await request(app)
          .delete(`/projects/${projectId}`)
          .set("Authorization", `Bearer ${adminToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Project deleted successfully");

      const getRes = await request(app)
          .get(`/projects/${projectId}`)
          .set("Authorization", `Bearer ${adminToken}`);
      expect(getRes.statusCode).toBe(404);
  });
});