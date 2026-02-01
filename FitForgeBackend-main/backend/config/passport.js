const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const mongoose = require("mongoose");
const User = mongoose.model("users");
const keys = require("./keys.js");

module.exports = (passport) => {
  const opts = {};
  // Конфиг JWT без зависимостей от БД, чтобы стратегия всегда регистрировалась
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  opts.secretOrKey = keys.secretOrKey || "dev_secret_change_me";

  passport.use(
    "jwt",
    new JwtStrategy(opts, (jwt_payload, done) => {
      User.findById(jwt_payload.id)
        .select("-password")
        .populate("awards") // Додаємо populate для нагород
        .then((user) => {
          if (user) {
            return done(null, user);
          }
          return done(null, false);
        })
        .catch((err) => console.log(err));
    }),
  );

  passport.use(
    "jwt-admin",
    new JwtStrategy(opts, (jwt_payload, done) => {
      User.findById(jwt_payload.id)
        .select("-password")
        .populate("awards") // Додаємо populate для нагород
        .then((user) => {
          if (user && user.isAdmin) {
            return done(null, user);
          }
          return done(null, false, {
            message: "You do not have enough permissions for this operation",
          });
        })
        .catch((err) => console.log(err));
    }),
  );
};
