const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bcrypt = require("bcryptjs");

const UserSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    login: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    birthdate: {
      type: String,
    },
    gender: {
      type: String,
    },
    avatarUrl: {
      type: String,
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    enabled: {
      type: Boolean,
      required: true,
      default: true,
    },
    awards: [{ type: Schema.Types.ObjectId, ref: "Award" }],
    followers: [{ type: Schema.Types.ObjectId, ref: "users" }],
    followedBy: [{ type: Schema.Types.ObjectId, ref: "users" }],
    savedPosts: [{ type: Schema.Types.ObjectId, ref: "posts" }],
    weightHistory: [{
      weight: Number,
      date: { type: Date, default: Date.now }
    }],
    targetWeight: {
      type: Number,
      default: null
    },
    workouts: [
      {
        _id: { type: Schema.Types.ObjectId, auto: true },
        exercise: { type: String, required: true },
        sets: { type: Number, default: 0 },
        reps: { type: Number, default: 0 },
        weight: { type: Number, default: 0 },
        notes: { type: String, default: "" },
        date: { type: Date, default: Date.now }
      }
    ],
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { strict: false }
);

UserSchema.methods.comparePassword = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

module.exports = User = mongoose.model("users", UserSchema);
