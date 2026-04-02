const express = require('express');
const router = express.Router();
const { getUsers, updateUser, toggleApproval, deleteUser } = require('../controllers/adminController');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

// Protect all admin routes
router.use(auth);
router.use(admin);

router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.patch('/users/:id/approve', toggleApproval);
router.delete('/users/:id', deleteUser);

module.exports = router;
