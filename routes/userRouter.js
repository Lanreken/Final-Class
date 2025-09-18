const { register, getAll, getOne, updateUser } = require("../controller/userController")
const upload = require("../middleware/multer")

const router = require("express").Router()

router.post("/register",upload.single("profilePicture"), register)
router.get("/users", getAll)
router.get("/user/:id", getOne)
router.put("/user/:id", upload.single("profilePicture"), updateUser)

module.exports = router