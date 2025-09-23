const {
  register,
  getAll,
  getOne,
  updateUser,
  deleteUser,
  verifyEmail,
  login,
  tokenTest,
  forgetPassword,
  changePassword,
} = require("../controller/userController");
const upload = require("../middleware/multer");

const router = require("express").Router();

router.post("/register", upload.single("profilePicture"), register);
router.get("/users", getAll);
router.get("/user/:id", getOne);
router.put("/user/:id", upload.single("profilePicture"), updateUser);
router.delete("/user/:id", deleteUser);
router.get("/user/:id/verify", verifyEmail);
router.post("/login", upload.single("profilePicture"), login);
router.get("/", tokenTest);
router.post("/password", forgetPassword);
router.get("/reset/:id", changePassword);

module.exports = router;
