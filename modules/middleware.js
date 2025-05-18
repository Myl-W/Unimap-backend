const checkBody = require("./checkBody");

function validateBody(schema) {
  return (req, res, next) => {
    const lang = (req.headers["accept-language"] || "fr")
      .split(",")[0]
      .slice(0, 2); // ex: "fr-FR" → "fr"
    const { isValid, errors } = checkBody(req.body, schema, lang);

    if (!isValid) {
      return res.status(400).json({ result: false, errors });
    }
    next();
  };
}

module.exports = validateBody;
