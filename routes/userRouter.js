const { register, getAll, getOne } = require("../controller/userController")
const upload = require("../middleware/multer")

const router = require("express").Router()

router.post("/register",upload.single("profilePicture"), register)
router.get("/users", getAll)
router.get("/users/:id", getOne)

module.exports = router