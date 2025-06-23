import { Router } from "express";

const router = Router();

router.post("/register", (req, res) => {
    res.send("User registered succesfully");
});

router.post("/login", (req, res) => {
    res.send("User logged in succesfully");
});

export default router;
