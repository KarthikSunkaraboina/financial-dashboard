const express = require("express");
const multer = require("multer");

const authMiddleware = require("../middleware/authMiddleware");
const { applyLoan } = require("../controllers/loanController");

const router = express.Router();

const upload = multer({
  dest: "uploads/",
});

router.post(
  "/apply-loan",
  authMiddleware,
  upload.fields([
    {
      name: "panFile",
      maxCount: 1,
    },
    {
      name: "bankStatement",
      maxCount: 1,
    },
  ]),
  applyLoan
);

module.exports = router;