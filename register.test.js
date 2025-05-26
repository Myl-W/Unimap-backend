// Importe la bibliothèque "supertest" qui permet de tester des API HTTP de manière simple
const request = require("supertest");

// Importe l'application Express depuis le fichier "app.js" (ou "app/index.js" selon ton projet)
const app = require("./app");

// Définition d'un test unitaire avec Jest pour vérifier le comportement de la route POST /register
it("POST /register", async () => {
  // Envoie une requête POST à la route /register avec un corps JSON contenant les données de l'utilisateur
  const res = await request(app).post("/register").send({
    firstname: "John", // Prénom de l'utilisateur à enregistrer
    email: "john@example.com", // Email de l'utilisateur à enregistrer
    password: "azerty123", // Mot de passe de l'utilisateur à enregistrer
  });

  // Vérifie que le code de statut HTTP de la réponse est bien 200 (OK)
  expect(res.statusCode).toBe(200);

  // Vérifie que la propriété "result" dans la réponse est vraie (inscription réussie)
  expect(res.body.result).toBe(true);

  // Vérifie que la réponse contient un "token" (souvent utilisé pour l'authentification)
  expect(res.body.token).toBeDefined();
});
