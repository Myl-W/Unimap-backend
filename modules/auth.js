// Importe la bibliothèque jsonwebtoken pour gérer les tokens JWT.
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY;

// Fonction pour authentifier le token JWT
function authenticateToken(req, res, next) {
  // Vérifie si le token est présent dans les en-têtes de la requête
  const authHeader =
    req.headers["authorization"] || req.headers["Authorization"];
    // Récupère le header Authorization (insensible à la casse) de la requête.
  const token = authHeader?.split(" ")[1];

  // Si le token n'est pas présent, retourne une erreur 401
  if (!token) {
    return res.status(401).json({ result: false, error: "Token manquant" });
  }
  // Vérifie la validité du token
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ result: false, error: "Token invalide" });
    }
    // Si le token est valide, ajoute les informations décodées à la requête
    req.user = decoded;
    next();
  });
}

module.exports = authenticateToken;
