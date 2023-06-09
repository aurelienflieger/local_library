const express = require("express");
const router = express.Router();

router.get("/", function redirect(req, res) {
  res.redirect("/catalog");
});

module.exports = router;
