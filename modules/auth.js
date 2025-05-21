const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY;

function authenticateToken(req, res, next) {
  const authHeader =
    req.headers["authorization"] || req.headers["Authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ result: false, error: "Token manquant" });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ result: false, error: "Token invalide" });
    }

    req.user = decoded;
    next();
  });
}

module.exports = authenticateToken;
