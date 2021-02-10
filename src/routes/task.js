const express = require('express');
const router = express.Router();
const { Task } = require('../models/task');
const auth = require('../middleware/auth');

router.get('/tasks', auth, async (req, res) => {
  try {
    // get the user's tasks
    const tasks = await Task.find({ owner: req.user._id });

    // alternatively:
    // await req.user.populate('tasks').execPopulate();
    // res.status(200).send(req.user.tasks);

    res.status(200).send(tasks);
  } catch (error) {
    res.status(500).send();
  }
});

router.get('/tasks/:id', auth, async (req, res) => {
  // get task by id
  const _id = req.params.id;
  try {
    // find a task where the task has the id provided in the route
    // and the owner of the task is the user making the request
    const task = await Task.findOne({ _id, owner: req.user._id });

    // if task doesn't exist, or the user doesn't have
    // ability to access, return 404 regardless
    if (!task) {
      res.status(404).send({
        'Not Found': 'No Task Exists for that ID',
      });
    }
    res.status(200).send(task);
  } catch (error) {
    if (error) {
      console.error(error);
      res.status(400).send({ error: 'Invalid ID provided' });
    }
  }
});

router.patch('/tasks/:id', auth, async (req, res) => {
  const providedParams = Object.keys(req.body);
  let isValidUpdate = false;

  // cannot update the task name; can only change the status
  if (providedParams.includes('task')) {
    isValidUpdate = false;
  }

  const updatableParams = ['completed'];
  // the only allowable update here is the completed status
  isValidUpdate = providedParams.every((updateKey) => {
    return updatableParams.includes(updateKey);
  });

  if (!isValidUpdate) {
    return res.status(400).send({ error: 'Invalid update attempted' });
  }

  const _id = req.params.id;
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!task) {
      res.status(404).send({ result: 'No task for id' });
    }

    providedParams.forEach((param) => {
      task[param] = req.body[param];
    });

    await task.save();

    res.status(200).send(task);
  } catch (error) {
    // check for validation issue(s); inform user
    res.status(400).send({ result: error._message });
  }
});

router.post('/tasks', auth, async (req, res) => {
  // create a task with the appropriate owner
  const task = new Task({
    ...req.body,
    owner: req.user._id,
  });

  try {
    const _task = await task.save();
    res.status(201).send(_task);
  } catch (error) {
    console.error(error._message);
    res.status(400).send({ status: error._message });
  }
});

router.delete('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const task = await Task.findOneAndDelete({
      _id: _id,
      owner: req.user._id,
    });
    // no task to delete (unlikely), or task not accessible to user
    if (!task) {
      res.status(404).send({ status: 'No task with the provided id' });
    } else {
      res.status(202).send(task);
    }
  } catch (error) {
    console.error(error._message);
    res.status(400).send({ status: error._message });
  }
});

module.exports = router;
