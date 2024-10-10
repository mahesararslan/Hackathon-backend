import express from "express";
import cors from "cors";
import userRouter from "./routers/userRouter.js";
import passport from "./auth.js";
import adminRouter from "./routers/adminRouter.js";

const app = express();
const PORT = 3000;

app.use(express.json());

app.use(cors());

app.use("/user", userRouter);

app.use("/admin", adminRouter);

app.get('/auth/google', passport.authenticate('google', {
    session: false,
    scope: ['email', 'profile'], 
}));

app.get('/auth/google/callback', passport.authenticate('google',{
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/signin`,
}), function (req, res) {
    const token = req.user.token; 
    res.redirect(`${process.env.FRONTEND_URL}/?token=${token}`);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
