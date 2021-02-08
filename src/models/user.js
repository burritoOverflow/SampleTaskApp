'use strict';

const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { error } = require('winston');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minLength: 3,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Email is invalid');
      }
    },
  },
  password: {
    type: String,
    required: true,
    trim: true,
    validate(value) {
      if (
        !validator.isStrongPassword(value, {
          minLength: 8,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
          returnScore: false,
        })
      ) {
        throw new Error('Weak password');
      }
    },
  },
  age: {
    type: Number,
    min: 18,
  },
});

// add an additional static method for finding a user by creds
UserSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  const genericErrorStr = 'Unable to login';

  // no user with that email
  if (!user) {
    throw new Error(genericErrorStr);
  }

  // determine if password is a match
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error(genericErrorStr);
  }

  return user;
};

// prior to saving, hash the provided password
UserSchema.pre('save', async function (next) {
  // the user about to be saved
  const user = this;
  // only hash the password if modified by the user
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 10);
  }

  next();
});
const User = mongoose.model('user', UserSchema);

module.exports = {
  User,
};
