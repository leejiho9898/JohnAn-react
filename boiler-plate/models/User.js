const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");

// const token = jwt.sign({ foo: 'bar' }, 'shhhhh');
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

userSchema.methods.comparePassword = function (plainPassword, cb) {
  //plainPassword 1234asd  암호화된 비밀번호 $2b$10$/bSZS9zTi8m8X9n44VDHyudUo6FISk6qGlpHnENd7lYcanVtk/S5q
  bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
    if (err) {
      return cb(err);
    }
    console.log(isMatch);
    cb(null, isMatch);
  });
};

userSchema.methods.generateToken = function (cb) {
  let user = this;
  let token = jwt.sign(user._id.toHexString(), "secretToken");
  user.token = token;
  user.save(function (err, user) {
    if (err) return cb(err);
    cb(null, user);
  });
};

userSchema.statics.findByToken = function(token,cb){
  var user = this;
  // user._id + '' = token
  //token 을 decode 한다.
  jwt.verify(token,'secretToken', function(err,decoded){
    //유저 아이디를 이용해서 유저를 찾은다음에
    //클라이언트에서 가져온 token 과 DB에 보관된 토큰이 일치하는지 확인
    user.findOne({"_id": decoded, "token":token}, function(err, user){
      if(err) return cb(err);
      cb(null,user)
    })

  })
}
const User = mongoose.model("User", userSchema);

module.exports = { User };
