const { register, getAll } = require("../controller/userController")
const upload = require("../middleware/multer")

const router = require("express").Router()

router.post("/register",upload.single("profilePicture"), register)
router.get("/getAll", getAll)

module.exports = router