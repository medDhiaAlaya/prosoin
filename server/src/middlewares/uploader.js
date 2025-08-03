import multer from "multer";
import path from "path";

const genericStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    const uniquePrefix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extention = path.extname(file.originalname);
    cb(null, uniquePrefix + extention);
  },
});


export const genericUploader = multer({
  storage: genericStorage,
});



