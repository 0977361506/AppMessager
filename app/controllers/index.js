const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const userModel = mongoose.model("User");

module.exports.controller = function(app) {
  //router for home.
  router.get("/index", function(req, res) {
    res.render("indexChat",{
      title: "Chat Home",
      user: req.session.user,
      chat: req.session.chat
    });
  });

  app.use(router);
}; 