import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import User from '../models/User.js';
import { createToken } from '../utils/token.js';

export async function register(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  if (process.env.ALLOW_REGISTRATION === 'false') {
    return res.status(403).json({ message: 'Registration disabled' });
  }

  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({ message: 'Username or email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      username,
      email,
      password: hashedPassword
    });

    const token = createToken(user._id);

    res.status(201).json({
      token,
      user
    });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ message: 'Failed to register user' });
  }
}

export async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = createToken(user._id);

    res.json({ token, user });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Failed to log in' });
  }
}

export async function getProfile(req, res) {
  res.json({ user: req.user });
}