const multer = require("multer");
//to work with file and directory paths
const path = require("path");
//to create directory if not exists
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create the uploads directory if it doesn't exist
    fs.mkdirSync("./uploads/", { recursive: true });
    cb(null, "./uploads/");
  },

  filename: function (req, file, cb) {
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e9)}`;
    const ext = file.mimetype.split("/")[1];
    cb(null, `IMG_${uniqueSuffix}.${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(null, false) || cb(new Error("Only image files are allowed!"));
  }
};

const limits = {
  fileSize: 1024 * 1024 * 10,
};

const upload = multer({ storage, fileFilter, limits });

module.exports = upload;
