const messages = require("./langages");

function translate(msgKey, lang = "en", params = {}) {
  let msg = messages[lang]?.[msgKey] || messages["en"][msgKey] || "";
  for (const key in params) {
    msg = msg.replace(`{${key}}`, params[key]);
  }
  return msg;
}

function checkBody(body, schema, lang = "en") {
  const errors = [];

  for (const key in schema) {
    const rules = schema[key];
    const value = body[key];

    // 1. Champ requis
    if (
      rules.required &&
      (value === undefined || value === null || value === "")
    ) {
      errors.push({ field: key, error: translate("required", lang) });
      continue;
    }

    // 2. Type
    if (value !== undefined && typeof value !== rules.type) {
      errors.push({
        field: key,
        error: translate("invalidType", lang, { type: rules.type }),
      });
      continue;
    }

    // 3. Vérification des chaînes
    if (rules.type === "string" && typeof value === "string") {
      const trimmed = value.trim();

      if (rules.minLength && trimmed.length < rules.minLength) {
        errors.push({
          field: key,
          error: translate("minLength", lang, { min: rules.minLength }),
        });
      }

      if (rules.maxLength && trimmed.length > rules.maxLength) {
        errors.push({
          field: key,
          error: translate("maxLength", lang, { max: rules.maxLength }),
        });
      }

      if (rules.format === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmed)) {
          errors.push({ field: key, error: translate("email", lang) });
        }
      }
    }

    // 4. Valeur parmi une liste
    if (rules.enum && !rules.enum.includes(value)) {
      errors.push({
        field: key,
        error: translate("enum", lang, { values: rules.enum.join(", ") }),
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

module.exports = { checkBody };

//Exemple d utilisation de la verification avec le module

//if (!checkBody(req.body, [ "name", "email", "password" ])) {
//    res.json({ result: false, error: 'Missing or empty fields' });
//    return;
//}
