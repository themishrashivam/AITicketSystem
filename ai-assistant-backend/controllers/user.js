import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { inngest } from "../inngest/client.js";

export const signup = async (req, res) => {
    const { email, password, skills = [] } = req.body;

    try {
        const hashed = await bcrypt.hash(password, 10);

        const user = await User.create({
            email,
            password: hashed,
            skills
        });

        await inngest.send({
            name: "user/signup",
            data: {
                email
            }
        });

        const token = jwt.sign(
            {
                _id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET
        );

        const safeUser = await User.findById(user._id).select("-password");

        return res.status(201).json({
            user: safeUser,
            token
        });

    } catch (err) {
        console.error("❌ Signup error:", err);

        return res.status(500).json({
            error: "Signup failed",
            details: err.message
        });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                error: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                error: "Invalid credentials"
            });
        }

        const token = jwt.sign(
            {
                _id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET
        );

        const safeUser = await User.findById(user._id).select("-password");

        return res.status(200).json({
            user: safeUser,
            token
        });

    } catch (err) {
        console.error("❌ Login error:", err);

        return res.status(500).json({
            error: "Login failed",
            details: err.message
        });
    }
};

export const logout = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                error: "Unauthorized"
            });
        }

        const token = authHeader.split(" ")[1];

        jwt.verify(
            token,
            process.env.JWT_SECRET,
            (err) => {
                if (err) {
                    return res.status(401).json({
                        error: "Unauthorized"
                    });
                }

                return res.json({
                    message: "Logout successfully!"
                });
            }
        );

    } catch (err) {
        return res.status(500).json({
            error: "Logout failed",
            details: err.message
        });
    }
};

export const updateUser = async (req, res) => {
    const { skills = [], role, email } = req.body;

    try {
        if (req.user?.role !== "admin") {
            return res.status(403).json({
                error: "Forbidden"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        await user.updateOne({
            skills: skills.length ? skills : user.skills,
            role
        });

        return res.json({
            message: "User updated successfully."
        });

    } catch (err) {
        console.error("❌ Update error:", err);

        return res.status(500).json({
            error: "Update failed",
            details: err.message
        });
    }
};

export const getUsers = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({
                error: "Forbidden"
            });
        }

        const users = await User.find().select("-password");

        return res.json(users);

    } catch (err) {
        console.error("❌ Get users error:", err);

        return res.status(500).json({
            error: "Access failed",
            details: err.message
        });
    }
};