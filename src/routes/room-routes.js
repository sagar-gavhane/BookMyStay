const express = require('express');

const verifyToken = require('../middlewares/verifyToken');
const room_controller = require('../controllers/room-controller');

const router = express.Router();

router.get('/rooms', verifyToken, room_controller.get_rooms);
router.post('/rooms', verifyToken, room_controller.post_rooms);
router.get('/rooms/:id', verifyToken, room_controller.get_room_by_id);
router.put('/rooms/:id', verifyToken, room_controller.update_room_by_id);

module.exports = router;
