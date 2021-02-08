const express = require('express');
const router = express.Router();
const { Task } = require('../models/task');

router.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find({});
    res.status(200).send(tasks);
  } catch (error) {
    res.status(500).send();
  }
});

router.get('/tasks/:id', async (req, res) => {
  // get task by id
  const _id = req.params.id;
  try {
    const task = await Task.findById(_id);
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

router.patch('/tasks/:id', async (req, res) => {
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
    const task = await Task.findByIdAndUpdate(_id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!task) {
      res.status(404).send({ result: `No task for id ${_id}` });
    }

    res.status(200).send(task);
  } catch (error) {
    // check for validation issue(s); inform user
    res.status(400).send({ result: error._message });
  }
});

router.post('/tasks', async (req, res) => {
  const task = new Task(req.body);
  try {
    const _task = await task.save();
    res.status(201).send(_task);
  } catch (error) {
    console.error(error._message);
    res.status(400).send({ status: error._message });
  }
});

router.delete('/tasks/:id', async (req, res) => {
  const _id = req.params.id;
  try {
    const task = await Task.findByIdAndDelete(_id);
    // no user to delete
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
