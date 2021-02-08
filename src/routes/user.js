const express = require('express');
const router = express.Router();

const { User } = require('../models/user');
const auth = require('../middleware/auth');

// requires auth; returns only the user's profile
router.get('/users/me', auth, async (req, res) => {
  // user is added to the request in the auth middleware
  res.status(200).send(req.user);
});

router.get('/users/:id', auth, async (req, res) => {
  // get user by id
  const _id = req.params.id;
  try {
    const user = await User.findById(_id);
    if (!user) {
      res.status(404).send({
        'Not Found': 'No User Exists for that ID',
      });
    }
    res.status(200).send(user);
  } catch (error) {
    if (error) {
      console.error(error);
      res.status(400).send({ error: 'Invalid ID provided' });
    }
  }
});

router.patch('/users/:id', async (req, res) => {
  const providedParams = Object.keys(req.body);
  const updatableParams = ['name', 'email', 'password', 'age'];
  const _id = req.params.id;
  const isValidUpdate = providedParams.every((updateKey) => {
    return updatableParams.includes(updateKey);
  });

  if (!isValidUpdate) {
    return res.status(400).send({ error: 'Invalid update attempted' });
  }

  try {
    const user = await User.findById(_id);

    if (!user) {
      res.status(404).send({ result: `No user for id ${_id}` });
    }

    // update each user parameter with the provided parameter
    providedParams.forEach((updateParameter) => {
      user[updateParameter] = req.body[updateParameter];
    });

    await user.save();

    res.status(200).send(user);
  } catch (error) {
    // check for validation issue(s); inform user
    console.error(error);
    res.status(400).send({ result: error._message });
  }
});

// add a new user
router.post('/users', async (req, res) => {
  const user = new User(req.body);
  try {
    const _user = await user.save();
    // after creation, generate an auth token
    const token = await _user.generateAuthToken();
    res.status(201).send({ user: _user, token });
  } catch (error) {
    console.error(error._message);
    res.status(400).send({ status: error._message });
  }
});

// authenticate a user
router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password,
    );
    const token = await user.generateAuthToken();
    res.status(200).send({
      user,
      token,
    });
  } catch (error) {
    // return an error when login fails
    res.status(400).send({ status: error._message });
  }
});

router.delete('/users/:id', async (req, res) => {
  const _id = req.params.id;
  try {
    const user = await User.findByIdAndDelete(_id);
    // no user to delete
    if (!user) {
      res.status(404).send({ status: 'No user with the provided id' });
    } else {
      res.status(202).send(user);
    }
  } catch (error) {
    console.error(error._message);
    res.status(400).send({ status: error._message });
  }
});

module.exports = router;
