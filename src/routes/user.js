const express = require('express');
const router = express.Router();
const multer = require('multer');

const { User } = require('../models/user');
const auth = require('../middleware/auth');

// requires auth; returns only the user's profile
router.get('/users/me', auth, async (req, res) => {
  // user is added to the request in the auth middleware
  res.status(200).send(req.user);
});

router.patch('/users/me', auth, async (req, res) => {
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
    // update each user parameter with the provided parameter
    providedParams.forEach((updateParameter) => {
      req.user[updateParameter] = req.body[updateParameter];
    });

    await req.user.save();

    res.status(200).send(req.user);
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

// allow a user to logout of the current session
router.post('/users/logout', auth, async (req, res) => {
  try {
    // w user added to the request, we'll just remove the token
    req.user.tokens = req.user.tokens.filter((token) => {
      // keep tokens that are not the token currently associated with the
      // user in the array
      return token.token !== req.token;
    });

    await req.user.save();
    res.send({
      result: 'logout success',
    });
  } catch (error) {
    res.status(500).send({
      result: 'logout failed',
    });
  }
});

// clear all existing sessions
router.post('/users/logoutall', auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send({
      result: 'logout all success',
    });
  } catch (error) {
    res.status(500).send({
      result: 'logout failed',
    });
  }
});

// allow a user to remove their own profile
router.delete('/users/me', auth, async (req, res) => {
  // user is attached to request object
  try {
    await req.user.remove();
    res.send(req.user);
  } catch (error) {
    console.error(error._message);
    res.status(400).send({ status: error._message });
  }
});

// allow a user to upload an avatar photo; configure multer
const upload = multer({
  limits: {
    // 1MB limit for these photos (1MB == 1,000,000 B)
    fileSize: 1000 ** 2,
  },
  fileFilter(req, file, cb) {
    // called by multer, (req, file, cb)
    const filenameLowercase = file.originalname.toLowerCase();

    // get file extension to determine if appropriate file type (image, here)
    if (
      filenameLowercase.endsWith('.jpeg') ||
      filenameLowercase.endsWith('.png') ||
      filenameLowercase.endsWith('.jpg')
    ) {
      // valid
      cb(undefined, true);
    } else {
      // invalid
      return cb(new Error('Please Upload an Image smaller than 1MB'));
    }
  },
});

// prettier-ignore
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    // get the data (file buffer) from multer
    const fileBuffer = req.file.buffer;

    // store the file buffer with the user
    req.user.avatar = fileBuffer;
    await req.user.save();

    // successful upload
    res.status(201).send({
      status: 'Upload Success',
    });
  },
  (error, req, res, next) => {
    // if error, we'll handle this more appropriately
    res.status(400).send({ error: error.message });
  },
);

// delete the avatar associated with the user initiating the request
router.delete('/users/me/avatar', auth, async (req, res) => {
  // setting a prop as undefined removes it from the db's entry
  req.user.avatar = undefined;
  await req.user.save();
  res.status(200).send({
    status: 'Delete Success',
  });
});

module.exports = router;
