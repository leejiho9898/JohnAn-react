const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50,
  },
  email: {
    type: String,
    minlength: 5,
  },
  password: {
    type: String,
    minlength: 5,
  },
  lastname: {
    type: String,
    minlength: 5,
  },
  role: {
    type: Number,
    default: 0,
  },
  image: String,
  token: {
    type: String,
  },
  tokenExp: {
    type: Number,
  },
});

userSchema.pre("save", function (next) {
  var user = this;

  if (user.isModified("password")) {
    //비밀번호를 암호화시킨다.
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) return next(err);

      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err);
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

user.methods.comparePassword = function(plainPassword,cd){
    //plainPassworld 1234asd  암호화된 비밀번호 $2b$10$/bSZS9zTi8m8X9n44VDHyudUo6FISk6qGlpHnENd7lYcanVtk/S5q
    bcrypt.compare(plainPassword,this.password,function(err,isMatch){
        if (err) return cd(err),
        cd(null,isMatch)
    })
}
const User = mongoose.model("User", userSchema);

module.exports = { User };
