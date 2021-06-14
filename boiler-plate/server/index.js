import express from "express";
const app = express();
const port = 5000;
const mongoose = require("mongoose");
const bodyParser = require("body-parser"); // 데이터를 .body 에 넣어주는 패키지
const cookieParser = require("cookie-parser"); // 쿠키 쉽게 추출해주는 패키지
const config = require("./config/key"); // dev,prod 파일 불러주는거
const { auth } = require("./middleware/auth"); //
const { User } = require("../models/User.js"); // 함수랑 데이터 담아두는곳
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

mongoose
  .connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log("mongoDB Connected..."))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Hello World! 안녕하세요");
}); //req는 요청 오브젝트, res는 응답 오브젝트, next는 다음 미들웨어 호출

app.post("/api/users/register", (req, res) => {
  //회원 가입 할때 필요한 정보들을 client에서 가져오면 그것들을 데이터 베이스에 넣어준다
  const user = new User(req.body);
  user.save((err, user) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).json({
      success: true,
    });
  });
});


app.post("/login", (req, res) => {
  //요청된 이메일을 데이터베이스에 있는지 확인한다.

  // try {
  //   const user = User.findOne({ email: req.body.email });

  //   if (!user) {
  //     return res.json({
  //       loginSuccess: false,
  //       message: "제공된 이메일에 해당하는 유저가 없습니다.",
  //     });
  //   }

  //   const isMatch = user.comparePassword(req.body.password);
  //   console.log(isMatch)
  //   if (!isMatch) {
  //     return res.json({
  //       loginSuccess: false,
  //       message: "비밀번호가 틀렸습니다.",
  //     });
  //   }

  //   const usertoken = user.generateToken();
  //   return res
  //     .cookie("x_auth", user.token)
  //     .status(200)
  //     .json({ loginSuccess: true, userId: usertoken._id });
  // } catch (e) {
  //   return res.status(400).send(e);
  // }

  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) {
      return res.json({
        loginSuccess: false,
        message: "제공된 이메일에 해당하는 유저가 없습니다.",
      });
    }
    //요청된 이메일이 데이터베이스에 있다면 비밀번호가 맞는 비밀번호인지 확인
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch)
        return res.json({
          loginSuccess: false,
          message: "비밀번호가 틀렸습니다.",
        });

      //비밀번호까지 맞다면 토큰생성.
      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);

        //토큰을 저장한다. 어디에? 쿠키,로컬스토리지등등
        res
          .cookie("x_auth", user.token)
          .status(200)
          .json({ loginSuccess: true, userId: user._id });
      });
    });
  });
});

app.get("/api/users/auth", auth, (req, res) => {
  //여기까지 미들웨어를 통과해 왔다는 얘기는 Authentication이 true 라는말.
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image,
  });
});


app.get('/api/users/logout', auth, (req, res) => {
  console.log('req.user',req.user)
  User.findOneAndUpdate({ _id: req.user_id }, { token: "" }, (err, user) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).send({
      success: true,
    })
  })
});



app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
