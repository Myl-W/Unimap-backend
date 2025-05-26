const request = require("supertest");
const app = require("./app");
const mongoose = require("mongoose");
const User = require("./models/users");
const bcrypt = require("bcrypt");

describe("GET /places", () => {
  let token;
  // -------- Connexion à la BDD et création d'un utilisateur avant les tests --------
  beforeAll(async () => {
    await mongoose.connect(process.env.CONNECTION_STRING, {
      connectTimeoutMS: 2000,
    });
    console.log("Database connected");

    // Création d'un utilisateur de test
    await request(app).post("/register").send({
      firstname: "Test",
      lastname: "User",
      email: "test.user@gmail.com",
      password: "password",
    });

    // Connexion pour obtenir le token
    const userDatas = await request(app).post("/login").send({
      email: "test.user@gmail.com",
      password: "password",
    });

    token = userDatas.body.token;
  });

  // Nettoyage après les tests : suppression de l'utilisateur
  afterAll(async () => {
    await User.deleteOne({ email: "test.user@gmail.com" });
    await mongoose.disconnect();
    console.log("Database disconnected");
  });

  it("doit retourner la liste des lieux avec un token valide", async () => {
    const res = await request(app)
      .get("/places")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("result", true);
    expect(Array.isArray(res.body.places)).toBe(true);
  });

  it("doit refuser l'accès sans token", async () => {
    const res = await request(app).get("/places");
    expect(res.statusCode).toBe(401);
  });
});
