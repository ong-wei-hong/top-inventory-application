var express = require('express');
var router = express.Router();

var item_controller = require('../controllers/itemController');

router.get('/', item_controller.index);
router.get('/new', item_controller.new);
router.post('/create', item_controller.create);
router.get('/:id', item_controller.show);
router.get('/:id/delete', item_controller.delete_get);
router.post('/:id/delete', item_controller.delete_post);
router.get('/:id/edit', item_controller.edit);
router.post('/:id/update', item_controller.update);

module.exports = router;
