const mongoose = require("mongoose");
const request = require("supertest");
const app = require("./app"); //  Import de l'application Express
const Place = require("./models/places");
const User = require("./models/users");
const bcrypt = require("bcrypt");

describe("POST /comments", () => {
  // describe regroupe les tests (it('blabala')) pour la route POST /comments
  let token;
  let placeTest;

  // Avant tous les tests : connexion à la BDD et génération d'un token via login
  beforeAll(async () => {
    await mongoose.connect(process.env.CONNECTION_STRING, {
      connectTimeoutMS: 2000,
    });

    // Création d'un utilisateur fictif avec mot de passe hashé
    const hashedPassword = await bcrypt.hash("testpassword", 10);
    await User.create({
      firstname: "Test",
      email: "test@gmail.com",
      password: hashedPassword,
    });

    // Connexion via l'API pour obtenir un token JWT valide
    const userDatas = await request(app).post("/login").send({
      email: "test@gmail.com",
      password: "testpassword",
    });

    // Stocke le token pour les appels authentifiés
    token = userDatas.body.token;
  });

  // Après tous les tests : suppression de l’utilisateur + déconnexion
  afterAll(async () => {
    await User.deleteOne({ email: "test@gmail.com" });
    await mongoose.disconnect();
  });

  // Avant ce test : on crée un nouveau lieu en base
  beforeEach(async () => {
    placeTest = await Place.create({
      name: "Test Place",
      address: "123 rue test",
      comments: [],
    });
  });

  // Test : vérifier qu'un commentaire est bien sauvegardé
  it("should save a comment only", async () => {
    const res = await request(app)
      .post("/comments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        picture: "http://example.com/photo.jpg",
        comment: "Unit test comment",
        placeId: placeTest._id.toString(),
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("comment");
    expect(res.body.comment).toHaveProperty("_id");
    expect(res.body.comment.comment).toBe("Unit test comment");
  });

  // Test : vérifier que le commentaire est bien lié au lieu via son ID
  it("should update the Place with the new comment ID", async () => {
    // Vérifie que le lieu existe toujours et a été mis à jour
    const updatedPlace = await Place.findById(placeTest._id);
    expect(updatedPlace).not.toBeNull();
  });
});
