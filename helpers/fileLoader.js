/**
 * @file fileLoader.js
 * @description Configuration de Multer pour l'upload d'images.
 *
 * Les fichiers uploadés sont sauvegardés dans le dossier `public/images/`.
 * Ils sont ensuite accessibles via l'URL `/images/<nom-du-fichier>`.
 *
 * Utilisation dans une route :
 * ```js
 * const upload = require('../helpers/fileLoader');
 * router.post('/add', upload.single('photo'), controller.add);
 * ```
 */

const multer = require("multer");
const path = require("path");

/**
 * Stratégie de stockage Multer sur disque.
 * - Destination : ./public/images
 * - Nom du fichier : `<fieldname>-<nom-original-sans-espaces>-<timestamp>.<extension>`
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/\s+/g, "-");
    cb(null, `${file.fieldname}-${name}-${Date.now()}${ext}`);
  },
});

/**
 * Filtre pour n'accepter que les images (jpeg, jpg, png, gif).
 *
 * @param {import('express').Request} req
 * @param {Express.Multer.File} file
 * @param {Function} cb - Callback(error, accepter)
 */
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Type de fichier non autorisé. Utilisez jpeg, jpg, png ou gif."), false);
  }
};

/**
 * Instance Multer configurée et prête à l'emploi.
 * Taille maximale : 10 Mo.
 *
 * @type {import('multer').Multer}
 */
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 Mo
});

module.exports = upload;
