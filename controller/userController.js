const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");

exports.register = async (req, res) => {
  try {
    const { fullName, age, phoneNumber, email, password } = req.body;
    const existingEmail = await userModel.findOne({ email: email.toLowerCase() });
    const existingPhoneNumber = await userModel.findOne({ phoneNumber: phoneNumber.toLowerCase() });

    if (existingEmail || existingPhoneNumber) {
      return res.status(400).json({
        statusCode: false,
        statusText: `Bad Request`,
        message: `User already exits`,
      });
    }

    const saltRound = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, saltRound);

    const user = new userModel({
      fullName,
      age,
      phoneNumber,
      email,
      password: hashPassword,
    });
    // await user.save();
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
