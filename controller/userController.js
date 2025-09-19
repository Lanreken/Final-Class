const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");
const { sentMail } = require("../middleware/nodemailer");
const { html } = require("../Email_Template/signUpTemplate");
const { verificationPage } = require("../Email_Template/emailVerifyTemplate");

exports.register = async (req, res) => {
  try {
    const { fullName, age, phoneNumber, email, password, profilePicture } = req.body;

    const file = req.file;
    let imageUploader;

    if (!fullName || !age || !phoneNumber || !email || !password) {
      fs.unlinkSync(file.path);
      return res.status(400).json({
        statusCode: false,
        statusText: `Bad Request`,
        message: `${!fullName ? "Full Name" : !age ? "Age" : !phoneNumber ? "Phone Number" : !email ? "Email" : "Password"} is required`,
      });
    }

    const existingEmail = await userModel.findOne({ email: email.toLowerCase() });
    const existingPhoneNumber = await userModel.findOne({ phoneNumber: phoneNumber });

    if (existingEmail || existingPhoneNumber) {
      fs.unlinkSync(file.path);
      return res.status(400).json({
        statusCode: false,
        statusText: `Bad Request`,
        message: `User already exits`,
      });
    }

    if (file && file.path) {
      imageUploader = await cloudinary.uploader.upload(file.path);
      fs.unlinkSync(file.path);
    }

    const saltRound = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, saltRound);

    const user = new userModel({
      fullName,
      age,
      phoneNumber,
      email,
      password: hashPassword,
      profilePicture: {
        imageUrl: imageUploader.secure_url,
        publicId: imageUploader.public_id,
      },
    });
    await user.save();

    await sentMail({
      email: user.email,
      subject: "Verification Mail",
      link: `${req.protocol}://${req.get("host")}/api/v1/user/user/${user._id}/verify`,
      html: html(`${req.protocol}://${req.get("host")}/api/v1/user/user/${user._id}/verify`, user.fullName.split(" ")[0]),
    });
    res.status(201).json({
      statusCode: true,
      statusText: `Created`,
      message: `User created successfully`,
      data: user,
    });
  } catch (error) {
    console.log(error.message);

    res.status(500).json({
      statusCode: false,
      statusText: `Internal Server Error`,
      message: error.message,
    });
  }
};

exports.getAll = async (req, res) => {
  try {
    const users = await userModel.find();
    res.status(200).json({
      statusCode: true,
      statusText: `OK`,
      message: `Users retrieved successfully`,
      data: users,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      statusCode: false,
      statusText: `Internal Server Error`,
      message: error.message,
    });
  }
};

exports.getOne = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({
        statusCode: false,
        statusText: `Not Found`,
        message: `User not found`,
      });
    }
    res.status(200).json({
      statusCode: true,
      statusText: `OK`,
      message: `User retrieved successfully`,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      statusCode: false,
      statusText: `Internal Server Error`,
      message: error.message,
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { fullName, age } = req.body;
    const { id } = req.params;
    const file = req.file;
    let updateImage;
    const user = await userModel.findById(id);
    if (!user) {
      fs.unlinkSync(file.path);
      return res.status(404).json({
        statusCode: false,
        statusText: "Not Found",
        message: "User not found",
      });
    }
    if (file && file.path) {
      await cloudinary.uploader.destroy(user.profilePicture.publicId);
      updateImage = await cloudinary.uploader.upload(file.path);
      fs.unlinkSync(file.path);
    }


    const updateUserData = {
      fullName: fullName ?? user.fullName,
      age: age ?? user.age,
    };

    if (updateImage) {
      updateUserData.profilePicture = {
        imageUrl: updateImage.secure_url,
        publicId: updateImage.public_id,
      };
    }

    const newData = Object.assign(user, updateUserData);

    const updatedUser = await userModel.findByIdAndUpdate(user._id, newData, { new: true });

    res.status(200).json({
      statusCode: true,
      statusText: "OK",
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      statusCode: false,
      statusText: "Internal Server Error",
      message: error.message,
      error: error,
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({
        statusCode: false,
        statusText: "Not Found",
        message: "User not found",
      });
    }
    await cloudinary.uploader.destroy(user.profilePicture.publicId);
    await userModel.findByIdAndDelete(id);
    res.status(200).json({
      statusCode: true,
      statusText: "OK",
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: false,
      statusText: "Internal Server Error",
      message: error.message,
    });
  }
};



exports.verifyEmail = async (req, res) => {
  try {
    const checkUser = await userModel.findById(req.params.id);

    if (!checkUser) {
      return res.send(verificationPage("User Not Found ❌", "The user does not exist in our records."));
    }

    if (checkUser.isVerified) {
      return res.send(verificationPage("Email Already Verified ⚠️", "Your email has already been verified."));
    }

    await userModel.findByIdAndUpdate(checkUser._id, { isVerified: true }, { new: true });

    return res.send(verificationPage("Email Verification ✅", `Hello <b>${checkUser.fullName}</b>, your email has been verified successfully.`));
  } catch (error) {
    return res.send(verificationPage("Internal Server Error ⚠️", error.message));
  }
};
