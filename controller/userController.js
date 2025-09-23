const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");
const { sentMail } = require("../middleware/nodemailer");
const { html } = require("../Email_Template/signUpTemplate");
const { verificationPage } = require("../Email_Template/emailVerifyTemplate");
const jwt = require("jsonwebtoken");
const { resetPasswordTemplate } = require("../Email_Template/resetPasswordTemplate");

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
      // text: `Hello ${user.fullName}, please verify your email.`,
      // html: `

      // <h1>Hello ${user.fullName}</h1>
      // <p>Thank you for registering. Please verify your email.</p><br />
      // <a href="${request.protocol}://${request.get("host")}api/v1/user/${user._id}/verify">Verify Email</a>`,
    });

    // const subject = "Verification Mail";
    // const text = `Hello ${user.fullName}, please verify your email.`;
    // const link = `${req.protocol}://${req.get("host")}/api/v1/user/${user._id}/verify`;
    // const html = `
    // <h1><em>Hello 👋 </em><br/> ${user.fullName}</h1>
    // <p>Thank you for registering. Please verify your email by clicking the link below:</p><br />
    // <a href="${link}">Verify Email</a>
    // `;

    // sendMail({
    //   email: user.email,
    //   subject,
    //   text,
    //   html: html,
    //   link,
    // })
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

    // const updateUserData = {
    //   fullName: fullName ?? user.fullName,
    //   age: age ?? user.age,
    //   profilePicture: {
    //     imageUrl: updateImage?.secure_url,
    //     publicId: updateImage?.public_id,
    //   },
    // };

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
      return res.status(404).json({
        statusCode: false,
        statusText: "Not Found",
        message: "User not found",
      });
    }

    if (checkUser.isVerified) {
      return res.status(400).json({
        statusCode: false,
        statusText: "Bad Request",
        message: "Email is already verified",
      });
    }
    await userModel.findByIdAndUpdate(req.user._id, { isVerified: true }, { new: true });

    // res.redirect("https://www.google.com");
    res.status(200).json({
      statusCode: true,
      statusText: "OK",
      message: "Email verified successfully",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: false,
      statusText: "Internal Server Error",
      message: error.message,
    });
  }
};

// exports.verifyEmail = async (req, res) => {
//   try {
//     const checkUser = await userModel.findById(req.params.id);

//     if (!checkUser) {
//       return res.send(verificationPage("User Not Found ❌", "The user does not exist in our records."));
//     }
//     if (checkUser.isVerified) {
//       return res.send(verificationPage("Email Already Verified ⚠️", "Your email has already been verified."));
//     }
//     await userModel.findByIdAndUpdate(checkUser._id, { isVerified: true }, { new: true });
//     return res.send(verificationPage("Email Verification ✅", `Hello <b>${checkUser.fullName}</b>, your email has been verified successfully.`));
//   } catch (error) {
//     return res.send(verificationPage("Internal Server Error ⚠️", error.message));
//   }
// };

exports.login = async (req, res) => {
  try {
    // Get email and password from request body
    const { email, password } = req.body;
    // Find user in database by email (converted to lowercase and trimmed)
    const checkUser = await userModel.findOne({ email: email.toLowerCase().trim() });
    // Compare provided password with hashed password in database
    const checkPassword = await bcrypt.compare(password, checkUser.password);

    // Return error if user not found or password doesn't match
    if (!checkUser || !checkPassword) {
      return res.status(400).json({
        statusCode: false,
        statusText: "Bad Request", 
        message: `Invalid Credential`,
      });
    }
    // Generate JWT token with user ID that expires in 2 minutes
    const token = await jwt.sign({ id: checkUser._id }, "secretKey", { expiresIn: "2m" });
    // Return success response with user data and token
    res.status(200).json({
      statusCode: true,
      statusText: "Ok",
      message: "Login Successfully",
      data: checkUser,
      token: token,
    });
  // Catch and handle any errors during login process
  } catch (error) {
    res.status(500).json({
      statusCode: false,
      statusText: "Internal Server Error",
      message: error.message,
    });
  }
};

exports.tokenTest = async (req, res) => {
  try {
    // Get token from request authorization header
    const checkToken = req.headers.authorization;
    // Return error if no token provided
    if (!checkToken) {
      return res.status(401).json({ message: "Login required" });
    }
    // Split token to remove 'Bearer' prefix
    const token = checkToken.split(" ")[1];
    // Verify the JWT token
    jwt.verify(token, "secretKey", (error, result) => {
      if (error) {
        // Return error if token verification fails
        res.status(400).json({
          statusCode: false,
          statusText: "Bad Request",
          message: error.message,
        });
      } else {
        // Find user by ID from token payload
        const checkUser = userModel.findById(result.id);
        // Return error if user not found
        if (!checkUser) {
          return res.status(404).json({
            statusCode: false,
            statusText: "Not Found",
            message: "User not found",
          });
        }
        // Return success response with user data
        return res.status(200).json({
          statusCode: true,
          statusText: "Ok",
          message: `Welcome ${checkUser.fullName}, welcome back!`,
          data: checkUser,
        });
      }
    });
  // Catch and handle any errors during token verification
  } catch (error) {
    return res.status(500).json({
      statusCode: false,
      statusText: "Internal Server Error",
      message: error.message,
    });
  }
};

exports.forgetPassword = async () => {
  try {
    // Get email from request body
    const { email } = req.body;

    // Find user by email in database
    const checkEmail = await userModel.findOne({ email: email.toLowerCase().trim() });

    // Return error if email not found
    if (!checkEmail) {
      return res.status(400).json("email does not exist");
    }

    // Set up email parameters
    const subject = "password reset verification";
    // Generate reset token that expires in 2 minutes
    const token = jwt.sign({ id: checkEmail._id }, "secrectKey", { expiresIn: "2m" });
    // Create reset password link
    const link = ` ${req.protocol}://${req.get("host")}/api/v1/reset/${checkEmail._id}`;

    // Send password reset email
    await sentMail({
      to: email,
      subject,
      html: resetPasswordTemplate(link, checkEmail.fullName),
    })
      .then(() => {
        console.log("mail sent");
      })
      .catch((e) => {
        console.log(e);
      });
    // Return success message
    res.status(200).json("check your email for further instructions");
  // Catch and handle any errors during password reset process
  } catch (error) {
    res.status(500).json({
      statusCode: false,
      statusText: "Internal Server Error",
      message: error.message,
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    // Get new password and confirmation from request body
    const { newPassword, confirmPassword } = req.body;
    // Check if passwords match
    if (newPassword !== confirmPassword) {
      res.status(400).json({
        statusCode: false,
        statusText: "Bad Request",
        message: "Password do not match",
      });
    }
    // Generate salt and hash new password
    const salt = await bcrypt.genSalt(10);
    const hash = bcrypt.hash(confirmPassword, salt);

    // Find user by ID from request parameters
    const user = await userModel.findById(req.params.id);
    console.log(user);
    // Verify reset token
    jwt.verify(user.token, "secrectKey", async (error, result) => {
      if (error) {
        // Return error if token expired
        res.status(400).json({
          statusCode: false,
          statusText: "Bad Request",
          message: "Email Expired",
        });
      } else {
        // Update user password and clear reset token
        await userModel.findByIdAndUpdate(result.id, { password: hash, token: null }, { new: true });
        // Return success message
        res.status(200).json({
          statusCode: true,
          statusText: "Ok",
          message: "Password Successfully Changed",
        });
      }
    });
  // Catch and handle any errors during password change process
  } catch (error) {
    res.status(500).json({
      statusCode: false,
      statusText: "Internal Server Error",
      message: error.message,
    });
  }
}
