import request from "supertest";
import app from "../../src/app";
import { projectStatus } from "../../src/common/projectStatus.enum";
import { taskStatus } from "../../src/common/taskStatus.enum";

jest.mock('ioredis');
jest.mock('bullmq');

let adminToken: string;
let projectId: number;
let taskId: number;

describe("Task API", () => {
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
        name: "TaskProject",
        description: "With tasks",
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000).toISOString(),
        status: projectStatus.PENDING,
      });
    projectId = projectRes.body.data.project.id;

    const taskRes = await request(app)
        .post(`/tasks/projects/${projectId}/tasks`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
            name: "Sample Task",
            description: "Do something",
        });
    taskId = taskRes.body.data.task.id;
  });

  it("should create a task under a project", async () => {
    const res = await request(app)
      .post(`/tasks/projects/${projectId}/tasks`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Another Task",
        description: "Do something else",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.task.name).toBe("Another Task");
  });
  
  it("should fail to create a task for a non-existent project", async () => {
    const res = await request(app)
        .post(`/tasks/projects/9999/tasks`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
            name: "Orphan Task",
            description: "This should fail",
        });
    expect(res.statusCode).toBe(404);
  });

  it("should get tasks for a specific project", async () => {
    const res = await request(app)
      .get(`/tasks/projects/${projectId}/tasks`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data.tasks)).toBe(true);
    expect(res.body.data.tasks).toHaveLength(1);
    expect(res.body.data.tasks[0].id).toBe(taskId);
  });

  it("should update task status", async () => {
    const res = await request(app)
      .patch(`/tasks/${taskId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: taskStatus.COMPLETED });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.task.status).toBe(taskStatus.COMPLETED);
  });

  it("should delete a task", async () => {
    const res = await request(app)
      .delete(`/tasks/${taskId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Task deleted");

    const getRes = await request(app)
        .get(`/tasks/projects/${projectId}/tasks`)
        .set("Authorization", `Bearer ${adminToken}`);
    expect(getRes.body.data.tasks).toHaveLength(0);
  });
});