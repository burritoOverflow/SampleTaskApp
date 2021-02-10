'use strict';

const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectID,
    required: true,
    ref: 'User',
  },
});

const Task = mongoose.model('Task', TaskSchema);

module.exports = {
  Task,
};
