const messages = {
  en: {
    required: "This field is required.",
    invalidType: "Expected type {type}.",
    minLength: "Minimum length is {min}.",
    maxLength: "Maximum length is {max}.",
    email: "Invalid email format.",
    enum: "Value must be one of: {values}.",
  },
  fr: {
    required: "Ce champ est requis.",
    invalidType: "Le type attendu est {type}.",
    minLength: "La longueur minimale est de {min} caractères.",
    maxLength: "La longueur maximale est de {max} caractères.",
    email: "Format d’email invalide.",
    enum: "La valeur doit être une de celles-ci : {values}.",
  },
  es: {
    required: "Este campo es obligatorio.",
    invalidType: "Se esperaba un tipo {type}.",
    minLength: "La longitud mínima es {min} caracteres.",
    maxLength: "La longitud máxima es {max} caracteres.",
    email: "Formato de correo electrónico inválido.",
    enum: "El valor debe ser uno de: {values}.",
  },
  it: {
    required: "Questo campo è obbligatorio.",
    invalidType: "Tipo previsto: {type}.",
    minLength: "La lunghezza minima è {min} caratteri.",
    maxLength: "La lunghezza massima è {max} caratteri.",
    email: "Formato email non valido.",
    enum: "Il valore deve essere uno di: {values}.",
  },
  de: {
    required: "Dieses Feld ist erforderlich.",
    invalidType: "Erwarteter Typ: {type}.",
    minLength: "Minimale Länge ist {min} Zeichen.",
    maxLength: "Maximale Länge ist {max} Zeichen.",
    email: "Ungültiges E-Mail-Format.",
    enum: "Der Wert muss einer der folgenden sein: {values}.",
  },
  zh: {
    required: "此字段为必填项。",
    invalidType: "应为类型 {type}。",
    minLength: "最小长度为 {min} 个字符。",
    maxLength: "最大长度为 {max} 个字符。",
    email: "无效的电子邮件格式。",
    enum: "值必须是以下之一：{values}。",
  },
};

module.exports = messages;
