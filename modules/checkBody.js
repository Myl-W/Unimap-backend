// Fonction qui vérifie que les propriétés d'un objet "body" ne sont pas vides
function checkBody(body, keys) {
  let isValid = true;

  // Boucle sur chaque clé demandée dans le tableau "keys"
  for (const field of keys) {
    // Si la propriété n'existe pas dans "body" ou si sa valeur est une chaîne vide
    if (!body[field] || body[field] === "") {
      isValid = false;
    }
  }

  // Retourne true si toutes les clés sont présentes et non vides, sinon false
  return isValid;
}

module.exports = { checkBody };
