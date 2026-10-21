const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const {
  validateCreateTask,
  validateUpdateTask,
  validateStatusUpdate,
  validateSubtasksUpdate
} = require('../middleware/validator');

router.get('/', taskController.getAllTasks);
router.get('/:id', taskController.getTaskById);
router.post('/', validateCreateTask, taskController.createTask);
router.put('/:id', validateUpdateTask, taskController.updateTask);
router.patch('/:id/status', validateStatusUpdate, taskController.updateTaskStatus);
router.patch('/:id/subtasks', validateSubtasksUpdate, taskController.updateTaskSubtasks);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
