const router = require('express').Router();
const bl = require('../BL/donationsLogic');

router.get('/', async (req, res, next) => {
    try { res.json(await bl.getDonations()); } catch(e) { next(e); }
});

router.post('/', async (req, res, next) => {
    try { res.json(await bl.create(req.body)); } catch(e) { next(e); }
});

module.exports = router;