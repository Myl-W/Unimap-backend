const request = require("supertest");
const app = require("./app");
const mongoose = require("mongoose");
const User = require("./models/users");
const bcrypt = require("bcrypt");

// ------------ verification de la connexion d'un utilisateur ------------
describe("POST /login", () => {
  // 'describe' permet de regrouper plusieurs test qui concernent la même fonctionnalité (ici la connexion).
  beforeAll(async () => {
    // 'BeforeAll' --> Avant tous les tests on crée un utilisateur de test
    await mongoose.connect(process.env.CONNECTION_STRING, {
      connectTimeoutMS: 2000,
    });
    console.log("Database connected");

    // Création d'un utilisateur de test avant les tests
    const hashedPassword = await bcrypt.hash("testpassword", 10);
    await User.create({
      firstname: "Test",
      email: "test@gmail.com",
      password: hashedPassword,
    });
  });

  afterAll(async () => { //'afterAll' --> la fonction s'exécute une seule fois après tous les test 
    // suppression de l'utilisateur après le test effectuée 
    await User.deleteOne({ email: "test@gmail.com" });
    // Déconnexion de la base de données après les tests
    await mongoose.disconnect();
    console.log("Database disconnected");
    

  });

  it("doit retourner un token si les identifiants sont valides", async () => {
    const res = await request(app)
      .post("/login")
      .send({ email: "test@gmail.com", password: "testpassword" });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined(); // Vérifie que le token est défini
    expect(res.body.result).toBe(true); // Vérifie que le résultat est vrai
    expect(res.body.firstname).toBe("Test"); // Vérifie que le prénom est correct
    expect(res.body.email).toBe("test@gmail.com"); // Vérifie que l'email est correct
  });

  it("doit retourner une erreur si le mot de passe est incorrect", async () => {
    const res = await request(app)
      .post("/login")
      .send({ email: "test@gmail.com", password: "wrongpassword" });

    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe(false); // Vérifie que le résultat est faux
    expect(res.body.error).toBe("Invalid username or password"); // Vérifie que le message d'erreur est correct
  });

  it("doit retourner une erreur si l'email n'existe pas", async () => {
    const res = await request(app)
      .post("/login")
      .send({ email: "notfound@gmail.com", password: "testpassword" });

    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe(false); // Vérifie que le résultat est faux
    expect(res.body.error).toBe("Invalid username or password"); // Vérifie que le message d'erreur est correct
  });

  it("doit retourner une erreur si les champs sont manquants", async () => {
    const res = await request(app)
      .post("/login")
      .send({ email: "", password: "" });

    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe(false); // Vérifie que le résultat est faux
    expect(res.body.error).toBe("Champs manquants ou vides"); // Vérifie que le message d'erreur est correct
  });
});
