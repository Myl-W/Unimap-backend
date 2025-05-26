const request = require("supertest");
const app = require("./app");
const mongoose = require("mongoose");

describe("GET /places", () => {
  // Connexion à la base de données avant tous les tests
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.CONNECTION_STRING, {
        useNewUrlParser: true, // idem
        useUnifiedTopology: true, //lignes de configuration pour éviter les avertissements de dépréciation
      });
    }
  });

  // Déconnexion de la base de données après tous les tests
  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("doit retourner la liste des lieux avec un token valide", async () => {
    const userDatas = await request(app).post("/login").send({
      email: "mttpiselli@gmail.com",
      password: "password",
    });
    const token = userDatas.body.token;
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
