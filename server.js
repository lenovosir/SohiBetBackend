const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect("mongodb+srv://samar0486:samar0486@allbackends.xm3hwao.mongodb.net/LoginSignUpCheck12", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const UserSchema = new mongoose.Schema({
  money: Number,
  username: String,
  email: String,
  password: String,
});

const User = mongoose.model("User", UserSchema);

app.post("/signup", async (req, res) => {
  const { money, username, email, password } = req.body;
  const existingUser = await User.findOne({ email });

  if (existingUser) return res.status(400).json({ message: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ money, username, email, password: hashedPassword });

  await newUser.save();
  res.status(201).json({ message: "User registered successfully" });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(400).json({ message: "User not found" });

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign({ id: user._id }, "secret", { expiresIn: "1h" });

  res.json({
    message: "Login successful",
    token,
    username: user.username,
    email: user.email,
    money: user.money,
  });
  
});

app.get("/money", async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, "secret");
    const user = await User.findById(decoded.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ money: user.money });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
});

app.put("/update-money", async (req, res) => {
  try {
    const { username, balance } = req.body;
    console.log("backend ",balance)
    if (!username || balance === undefined) {
      return res.status(400).json({ message: "username and balance are required" });
    }

    const user = await User.findOne({ username });
    console.log("backend ")
    if (!user) return res.status(404).json({ message: "User not found" });

    await User.updateOne({ username }, { $set: { money: balance } });

    res.json({ message: "Money updated successfully", balance });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
});


app.listen(5000, () => console.log("Server running on port 5000"));
