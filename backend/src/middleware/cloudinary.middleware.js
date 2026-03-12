import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/temp");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

export const upload = multer({ storage: storage });

// Strict upload middleware for payment proof uploads only
export const uploadPaymentProof = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMime = new Set([
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ]);
    if (!allowedMime.has(file.mimetype)) {
      const err = new Error("Only jpg, jpeg, png, and webp images are allowed");
      err.code = "INVALID_FILE_TYPE";
      return cb(err, false);
    }
    return cb(null, true);
  },
});