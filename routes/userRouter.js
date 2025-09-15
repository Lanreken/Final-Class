const { register } = require("../controller/userController")
const upload = require("../middleware/multer")

const router = require("express").Router()

router.post("/register",upload.single("profilePicture"), register)

module.exports = router