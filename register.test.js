const request = require("supertest");
const app = require("./app");

it("POST /register", async () => {
  const res = await request(app).post("/register").send({
    firstname: "John",
    email: "john@example.com",
    password: "azerty123",
  });

  expect(res.statusCode).toBe(200);
  expect(res.body.result).toBe(true);
  expect(res.body.token).toBeDefined();
});
