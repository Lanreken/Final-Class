const { register, getAll, getOne, updateUser, deleteUser, verifyEmail } = require("../controller/userController")
const upload = require("../middleware/multer")

const router = require("express").Router()

router.post("/register",upload.single("profilePicture"), register)
router.get("/users", getAll)
router.get("/user/:id", getOne)
router.put("/user/:id", upload.single("profilePicture"), updateUser)
router.delete("/user/:id", deleteUser)
router.get("/user/:id/verify", verifyEmail)

module.exports = router