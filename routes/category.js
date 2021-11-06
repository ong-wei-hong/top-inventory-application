var express = require('express');
var router = express.Router();

var category_controller = require('../controllers/categoryController');

router.get('/', category_controller.index);
router.get('/new', category_controller.new);
router.post('/create', category_controller.create);
router.get('/:id', category_controller.show);
router.get('/:id/delete', category_controller.delete_get);
router.post('/:id/delete', category_controller.delete_post);
router.get('/:id/edit', category_controller.edit);
router.post('/:id/update', category_controller.update);

module.exports = router;
