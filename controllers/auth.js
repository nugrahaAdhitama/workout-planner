import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { createError } from "../utils/error.js";
import JWT from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const username = await User.findOne({ username: req.body.username });
    if (username) {
      throw createError(400, "Username already exists");
    }
    const email = await User.findOne({ email: req.body.email });
    if (email) {
      throw createError(400, "Email already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const newUser = new User({
      ...req.body,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(200).send("User has been registered");
  } catch (error) {
    console.error(error);
  }
};

export const login = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      throw createError(404, "User not found!");
    }

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!validPassword) {
      throw createError(400, "Username or password is incorrect!");
    }

    const accessToken = JWT.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT,
      { expiresIn: "1h" }
    );

    const { password, isAdmin, ...otherDetails } = user._doc;
    res
      .cookie("access_token", accessToken, {
        httpOnly: true,
      })
      .status(200)
      .json({ details: { ...otherDetails }, isAdmin });
  } catch (error) {
    throw createError(500, error.message);
  }
};
