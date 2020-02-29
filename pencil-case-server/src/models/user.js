const mongoose = require("mongoose");

const User = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    unique: true
  },
  address: {
    type: String,
    unique: true,
    required: true
  },
  privateKey: {
    type: String,
    unique: true,
    require: true
  },
  ethAddress: {
    type: String,
    unique: true,
    required: true
  },
  ethPrivateKey: {
    type: String,
    unique: true,
    required: true
  },
  school: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  organizer: {
    type: Boolean,
    required: true
  },
  date: {
    type: Date,
    default: Date.now()
  }
});

const UserModel = mongoose.model("User", User);
module.exports = UserModel;
