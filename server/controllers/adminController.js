const User = require('../models/User');
const Wine = require('../models/Wine');

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update user (name, email, password, role)
exports.updateUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (password) user.password = password; // Pre-save hook will hash it

    await user.save();
    res.json({ message: 'User updated successfully', user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Toggle user approval
exports.toggleApproval = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isApproved = !user.isApproved;
    await user.save();
    res.json({ message: `User ${user.isApproved ? 'approved' : 'unapproved'} successfully`, isApproved: user.isApproved });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Delete all wines belonging to this user
    await Wine.deleteMany({ userId });

    // Delete the user record
    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User and all their data deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
