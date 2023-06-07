const express = require('express');

const verifyToken = require('../middlewares/verifyToken');
const user_controller = require('../controllers/user-controller');

const router = express.Router();

router.get('/users/:user_id', verifyToken, user_controller.get_user_by_id);

module.exports = router;
