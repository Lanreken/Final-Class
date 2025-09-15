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
    await user.save();
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

exports.getAll = async (req,res) =>{
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
}

exports.getOne = async (req,res) =>{
  try {
    const {id} = req.params;  
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
    console.log(error.message);
    res.status(500).json({
      statusCode: false,
      statusText: `Internal Server Error`,
      message: error.message,
    });
  }
}