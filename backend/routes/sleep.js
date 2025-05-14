const router = require('express').Router()
const sleepController = require('../controllers/sleep')
const requireRoles = require('../middleware/requireRoles')
const ROLES_LIST = require('../config/rolesList')

router.use(requireRoles([...Object.values(ROLES_LIST)]))

router.route('/')
    .get(sleepController.getAll)
    .post(sleepController.create)

router.route('/:id')
    .get(sleepController.getById)
    .patch(sleepController.update)
    .delete(sleepController.delete)

router.route('/admin')
    .post(requireRoles([ROLES_LIST.Root, ROLES_LIST.Admin]), sleepController.adminGetAll)

module.exports = router