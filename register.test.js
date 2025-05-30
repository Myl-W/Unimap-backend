const request = require("supertest");
const User = require("./models/users");
const mongoose = require("mongoose");
const app = require("./app");

it("POST /register", async () => {
  const res = await request(app).post("/register").send({
    firstname: "John",
    lastname: "Doe",
    email: "john@example.com",
    password: "azerty123",
  });

  // Vérifie que le code de statut HTTP de la réponse est bien 200 (OK)
  expect(res.statusCode).toBe(200);

  // Vérifie que la propriété "result" dans la réponse est vraie (inscription réussie)
  expect(res.body.result).toBe(true);

  // Vérifie que la réponse contient un "token"
  expect(res.body.token).toBeDefined();
});

// Nettoyage après les tests : suppression de l'utilisateur
afterAll(async () => {
  await User.deleteOne({ email: "john@example.com" });
  await mongoose.disconnect();
  console.log("Database disconnected");
});
