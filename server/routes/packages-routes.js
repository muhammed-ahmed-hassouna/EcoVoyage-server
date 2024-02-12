const { Router } = require('express');
const packagesController = require('../controllers/packages-controller');
const router = Router();

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const verifyJWT = require('../Middleware/VerifyJWT');

router.get('/getPackages', packagesController.getPackages);

router.get('/getBookPackages', packagesController.getBookPackages);

router.get('/getPackagesPaginated', packagesController.getPackagesPaginated);

router.post('/addPackages', upload.array('image', 4), verifyJWT.authorize([2]), packagesController.addPackages);

router.put(`/updatePackages/:id`, upload.array('image', 6), verifyJWT.authorize([2]), packagesController.updatePackages);

router.put('/markPackagesAsDeleted/:id', verifyJWT.authorize([2]), packagesController.markPackagesAsDeleted);

router.get('/getPackagesById/:id', packagesController.getPackagesById);

router.post('/addCommentPac/:id', verifyJWT.authorize([1, 2]), packagesController.addCommentPac);

router.get('/getPackagesWithComments/:id', packagesController.getPackagesWithComments);

router.post('/BookPackage/:id', verifyJWT.authorize([1, 2]), packagesController.BookPackage);

router.get('/getBookPackages/:id', packagesController.getBookPackages);

module.exports = router;
