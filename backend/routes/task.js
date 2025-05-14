const router = require('express').Router()
const tasksController = require('../controllers/task')
const requireRoles = require('../middleware/requireRoles')
const ROLES_LIST = require('../config/rolesList')

router.route('/').get(requireRoles([...Object.values(ROLES_LIST)]), tasksController.getAll)

// Allow all authenticated users to create tasks
router.route('/').post(requireRoles([...Object.values(ROLES_LIST)]), tasksController.create)

// Routes that require admin privileges
router.use('/inspect', requireRoles([ROLES_LIST.Root, ROLES_LIST.Admin]))
router.route('/inspect').post(tasksController.inspect)

router.use('/assign', requireRoles([ROLES_LIST.Root, ROLES_LIST.Admin]))
router.route('/assign').post(tasksController.assignUser)

router.route('/notassign/:id').get(requireRoles([ROLES_LIST.Root, ROLES_LIST.Admin]), tasksController.getNotAssignUser)

router.route('/assign/:id')
.get(requireRoles([...Object.values(ROLES_LIST)]), tasksController.getAssignUser)
.delete(requireRoles([ROLES_LIST.Root, ROLES_LIST.Admin]), tasksController.deleteAssign)

router.route('/:id')
.get(requireRoles([...Object.values(ROLES_LIST)]), tasksController.getById)
.patch(requireRoles([...Object.values(ROLES_LIST)]), tasksController.update)
.delete(requireRoles([ROLES_LIST.Root, ROLES_LIST.Admin]), tasksController.delete)

module.exports = router