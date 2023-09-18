const Task = require('../models/taskModel')
const mongoose = require('mongoose')

// get a single task
const getTask = async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such task' })
  }

  const task = await Task.findById(id)

  if (!task) {
    return res.status(404).json({ error: 'No such task' })
  }

  res.status(200).json(task)
}

// get all tasks
const getTasks = async (req, res) => {
  const userId = req.user._id

  const tasks = await Task.find({ userId }).sort({ createdAt: -1 })
  res.status(200).json(tasks)
}

// create new task
const createTask = async (req, res) => {
  const { title } = req.body
  let emptyFields = []

  if (!title?.length) emptyFields.push('title')
  if (emptyFields.length)
    return res
      .status(400)
      .json({ error: 'Please fill in all the fields', emptyFields })

  try {
    const task = await Task.create({ title, userId: req.user._id })
    res.status(200).json(task)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// delete task
const deleteTask = async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such task' })
  }

  const task = await Task.findOneAndDelete({ _id: id })

  if (!task) {
    return res.status(404).json({ error: 'No such task' })
  }

  res.status(200).json(task)
}

// update task
const updateTask = async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such task' })
  }

  const task = await Task.findOneAndUpdate({ _id: id }, { ...req.body })

  if (!task) return res.status(404).json({ error: 'No such task' })

  res.status(200).json(task)
}

module.exports = {
  createTask,
  getTasks,
  getTask,
  deleteTask,
  updateTask
}
