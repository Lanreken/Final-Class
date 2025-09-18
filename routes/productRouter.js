
const router = require("express").Router()
const { products, updateProduct, deleteProduct, getAllProducts } = require("../controller/productController")
const upload = require("../middleware/multer")

router.post("/register", upload.array("productImages", 5), products)
router.put("/update/:id", upload.array("productImages", 5), updateProduct)
router.delete("/delete/:id", deleteProduct)
router.get("/all", getAllProducts)


module.exports = router