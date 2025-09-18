const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    productImages: [
      {
        imageUrl: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const productModel = mongoose.model("Product", productSchema);

module.exports = productModel;
