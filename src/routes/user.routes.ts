import { Router } from "express";

const router = Router();

router.post("/", (req, res) => {
    res.send("Retrieved user details succesfully");
});

router.post("/", (req, res) => {
    res.send("Created user succesfully");
});

export default router;
