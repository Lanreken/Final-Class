require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const PORT = process.env.PORT || 4040;
const userRouter = require("./routes/userRouter");
const cors = require("cors");
const productRouter = require("./routes/productRouter");
const userModel = require("./models/userModel");
const jwt = require("jsonwebtoken");

const app = express();

app.use(express.json());
app.use("/api/v1/user", userRouter);
app.use("/api/v1/product", productRouter);
app.use(cors());

app.get("/", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header missing" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, "secretKey", (error) => {
    if (error) {
      return res.status(400).json({
        message: error.message,
      });
    }
    // Token is valid, respond accordingly
    return res.status(200).json({ message: "Token is valid" });
  });
  // Do not log tokens in production
  console.log("Received token:", token);
});

app.use((error, req, res, next) => {
  if (error) {
    return res.status(500).json({
      statusCode: false,
      statusText: `Internal Server Error`,
      message: error.message,
    });
  }
  next();
});

mongoose
  .connect(process.env.DB_URL)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
    console.log(`Database is Connected Successfully`);
  })
  .catch((error) => {
    console.log(`Database Connection Failed: ${error.message}`);
  });
