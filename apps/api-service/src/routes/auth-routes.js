const express = require('express');

const auth_controller = require('../controllers/auth-controller');

const router = express.Router();

router.post('/auth/signup', auth_controller.signup);
router.post('/auth/login', auth_controller.login);
router.post('/auth/reset_password', auth_controller.reset_password);

module.exports = router;
