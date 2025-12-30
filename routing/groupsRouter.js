
const express = require('express');
const router = express.Router();
const bl = require('../BL/groupsDonorsLogic');


router.get('/groups', async (req, res, next) => {
    try { res.json(await bl.getGroups()); } catch(e) { next(e); }
});


router.get('/donors', async (req, res, next) => {
    try { res.json(await bl.getDonors()); } catch(e) { next(e); }
});

router.put('/donors/:id/target', async (req, res) => {
    try {
        const donorId = req.params.id; 
        const { target, secretCode } = req.body; 

     
        const result = await bl.updateDonorTarget(donorId, target, secretCode);
        
        res.json(result);
    } catch (err) {
     
        res.status(err.status || 500).json({ message: err.message });
    }
});

router.post('/add-donor', async (req, res, next) => {
    try {
        const result = await bl.addDonor(req.body, req.body.role);
        res.status(201).json(result);
    } catch(e) {
        res.status(e.status || 500).json({ detail: e.message });
    }
});

module.exports = router;