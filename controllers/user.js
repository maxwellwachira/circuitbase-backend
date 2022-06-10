import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import User from '../models/user.js';

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY;
const EXPIRE_TIME = process.env.EXPIRE_TIME;

export const signin = async (req, res) => {
    const { email, password } = req.body;
    try {
        //check if user already exists otherwise return error message
        const existingUser =  await User.findOne({ email });
        if(!existingUser) return res.status(404).json({message: "user does not exists"});
        //check if the entered password is OK to the save password otherwise return error message
        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordCorrect) return res.status(400).json({message: "Invalid credentials"});
        //return token to user
        const token = jwt.sign({ email: existingUser.email, id:existingUser._id}, SECRET_KEY, { expiresIn: EXPIRE_TIME }); 
        res.status(200).json({ token });

    } catch (error) {
        res.status(500).json({ message: "Something went wrong"});
    }
}

export const signup = async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    try {
        //check if user already exists before signing up
        const existingUser =  await User.findOne({ email });
        if(existingUser) return res.status(400).json({message: "user already exists"});
        // hash password
        const hashedPassword =  await bcrypt.hash(password, 12);
        //Add user to database
        const result = await User.create({ email, password: hashedPassword, firstName, lastName});
        //return token to user
        const token = jwt.sign({ email: result.email, id:result._id}, SECRET_KEY, { expiresIn: EXPIRE_TIME });
        res.status(200).json({ token});

    } catch (error) {
        res.status(500).json({ message: "Something went wrong"});
    }
}
