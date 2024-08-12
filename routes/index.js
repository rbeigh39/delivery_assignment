const express = require("express");

const auth_router = require("./auth_router");

const router = express.Router();

router.route("/health", (req, res) => {
  res.stats(200).json({
    status: "success",
  });
});

router.use("/auth", auth_router);

module.exports = router;
