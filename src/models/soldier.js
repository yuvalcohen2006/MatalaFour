const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const soldierSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  age: {
    type: Number,
    required: true,
    trim: true,
  },
  team: {
    type: String,
    required: true,
    trim: true,
  },
  pazamInMonths: {
    type: Number,
    required: true,
  },
  isLeader: {
    type: Boolean,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) throw new Error("Invalid Email");
    },
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  tokens: [
    {
      token: { type: String, required: true },
    },
  ],
});

soldierSchema.methods.toJson = async function () {
  const soldierObj = this.toObject();

  delete soldierObj.password;
  delete soldierObj.tokens;

  return soldierObj;
};

soldierSchema.methods.generateAuthToken = async function () {
  const soldier = this;
  const token = jwt.sign({ _id: soldier._id.toString() }, "supersecret");

  soldier.tokens = soldier.tokens.concat({ token });
  await soldier.save();

  return token;
};

soldierSchema.statics.findByCredentials = async (email, password) => {
  const soldier = await Soldier.findOne({ email });

  if (!soldier)
    throw new Error("No user found with this Email on our platform.");

  const isMatch = bcrypt.compare(password, soldier.password);
  if (isMatch) return soldier;
  throw new Error("Wrong Password.");
};

soldierSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 8);
  }
});

const Soldier = mongoose.model("Soldier", soldierSchema);

module.exports = Soldier;
