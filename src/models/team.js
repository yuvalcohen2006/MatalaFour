const mongoose = require("mongoose");

const Team = mongoose.model("Team", {
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
});

module.exports = Team;
