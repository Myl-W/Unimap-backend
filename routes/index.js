var express = require("express");
var router = express.Router();
const authenticateToken = require("../modules/auth");

//  ------ Exemple route sécuriser  ----------------
router.get("/profile", authenticateToken, (req, res) => {
  const user = req.user;
  res.json({
    result: true,
    message: "Bienvenue " + user.firstname,
    user,
    userId: user.id,
    firstname: user.firstname,
    lastname: user.lastname,
    birthdate: user.birthdate,
    email: user.email,
  });
});

module.exports = router;
