import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import app from "../app.js";
import db from "../models";

const { User, sequelize } = db;

describe("User API Tests", () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    await User.destroy({ where: {} });
    await fetch("http://localhost:8025/api/v1/messages", { method: "DELETE" });
  });

  it("should create a new user", async () => {
    const res = await request(app).post("/auth/register").send({
      email: "user@example.com",
      password: "password123",
      firstName: "user",
      lastName: "test",
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("message", "Registration successful!");

    const user = await User.findOne({ where: { email: "user@example.com" } });
    expect(user).not.toBeNull();
  });

  it("should return 422 for duplicate email", async () => {
    const _ = await request(app).post("/auth/register").send({
      email: "sid@example.com",
      password: "password123",
      firstName: "user",
      lastName: "test",
    });

    // Try registering with the same email
    const res = await request(app).post("/auth/register").send({
      email: "sid@example.com",
      password: "password123",
      firstName: "user",
      lastName: "test",
    });

    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty("error", "Duplicate email detected!");
  });

  it("should send a verification email on successful registration", async () => {
    const userData = {
      email: "user@example.com",
      password: "password123",
      firstName: "user",
      lastName: "test",
    };

    const res = await request(app).post("/auth/register").send(userData);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("message", "Registration successful!");

    const user = await User.findOne({ where: { email: "user@example.com" } });
    expect(user).not.toBeNull();

    await new Promise((resolve) => setTimeout(resolve, 300));
    const mailResponse = await fetch(
      "http://localhost:8025/api/v1/message/latest",
    );
    const mailData = await mailResponse.json();
    expect(mailResponse.status, "Expected 200 response from mailpit").toBe(200);
    expect(
      mailData.To[0].Address,
      `"Expected receipient address to be ${userData.email}"`,
    ).toBe(userData.email);
    expect(
      mailData.Subject,
      "Expected email subject to contain 'Verify email'",
    ).toContain("Verify email");
  });

  it("should verify the account when accessing the provided link via GET request", async () => {
    const userData = {
      email: "user@example.com",
      password: "password123",
      firstName: "user",
      lastName: "test",
    };

    const res = await request(app).post("/auth/register").send(userData);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("message", "Registration successful!");

    const user = await User.findOne({ where: { email: userData.email } });
    expect(user).not.toBeNull();
    expect(user.active).toBe(0);

    await new Promise((resolve) => setTimeout(resolve, 300));
    const mailResponse = await fetch(
      "http://localhost:8025/api/v1/message/latest",
    );

    expect(mailResponse.status, "Expected 200 response from mailpit").toBe(200);
    const mailData = await mailResponse.json();
    const textMatch = mailData.Text.match(/\bhttps?:\/\/[^\s)]+/);
    const linkFromText = textMatch ? textMatch[0] : null;
    const url = new URL(linkFromText);
    const pathWithParams = url.pathname + url.search;
    const verify_res = await request(app).get(pathWithParams);
    const active_user = await User.findOne({
      where: { email: userData.email },
    });
    expect(active_user.active).toBe(1);
  });
});
