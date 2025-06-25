import request from "supertest";
import app from "../src/app";

jest.mock('ioredis');
jest.mock('bullmq');

describe("GET /", () => {
    it('should respond with a 200 status code and "Hello world"', async () => {
        const response = await request(app).get("/");

        expect(response.statusCode).toBe(200);
        expect(response.text).toBe("Hello world");
    });
});