const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.send("yoo this is pog");
    console.log("yeet")
})

module.exports = router;