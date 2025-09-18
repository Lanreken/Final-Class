const productModel = require("../models/productModel");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

exports.products = async (req, res) => {
  try {
    const { productName } = req.body;
    const files = req.files;
    let response;
    let list = [];
    let babyList = {};

    const existingProduct = await productModel.findOne({ productName: productName.toLowerCase() });
    if (existingProduct) {
      return res.status(400).json({
        statusCode: false,
        statusText: "Bad Request",
        message: "Product already exists",
      });
    }

    if (files && files.length > 0) {
      for (const file of files) {
        response = await cloudinary.uploader.upload(file.path);
        babyList = {
          publicId: response.public_id,
          imageUrl: response.secure_url,
        };
        list.push(babyList);
        fs.unlinkSync(file.path);
      }
    }

    if (!productName) {
      return res.status(400).json({
        statusCode: false,
        statusText: "Bad Request",
        message: "Product Name is required",
      });
    }

    const products = new productModel({
      productName,
      productImages: list,
    });
    await products.save();
    res.status(201).json({
      statusCode: true,
      statusText: `Created`,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      statusCode: false,
      statusText: "Internal Server Error",
      message: error.message,
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { productName, productImages } = req.body;
    
    const product = await productModel.findById(id);
    if (!product) {
      fs.unlinkSync(file.path);
      return res.status(404).json({
        statusCode: false,
        statusText: "Not Found",
        message: "Product not found",
      });
    }
    const files = req.files;
     let response;
     let list = [];
     let babyList = {};
     if(files && files.length > 0){
       for (const image of product.productImages) {
        await cloudinary.uploader.destroy(image.publicId);
       }
       for (const file of files) {
         response = await cloudinary.uploader.upload(file.path);
         babyList = {
           publicId: response.public_id,
           imageUrl: response.secure_url,
         };
         list.push(babyList);
         fs.unlinkSync(file.path);
       }
     }

     const data = {
       productName: productName ?? product.productName,
       productImages: list
     }


    const updatedProduct = await productModel.findByIdAndUpdate(product._id, data, { new: true });
    res.status(200).json({
      statusCode: true,
      statusText: "Updated",
      data: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      statusCode: false,
      statusText: "Internal Server Error",
      message: error.message,
    });
  }
};


exports.getAllProducts = async (req, res) => {
  try {
    const products = await productModel.find();
    res.status(200).json({
      statusCode: true,
      statusText: "OK",
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      statusCode: false,
      statusText: "Internal Server Error",
      message: error.message,
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productModel.findById(id);
    if (!product) {
      fs.unlinkSync(file.path);
      return res.status(404).json({
        statusCode: false,
        statusText: "Not Found",
        message: "Product not found",
      });
    }

    for (const image of product.productImages) {
      await cloudinary.uploader.destroy(image.publicId);
    }

    await productModel.findByIdAndDelete(id);
    res.status(200).json({
      statusCode: true,
      statusText: "Deleted",
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: false,
      statusText: "Internal Server Error",
      message: error.message,
    });
  }
};

