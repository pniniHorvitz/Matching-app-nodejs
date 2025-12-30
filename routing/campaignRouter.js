const router = require('express').Router();
const bl = require('../BL/campaignLogic'); 
router.get('/', async (req, res, next) => {
    try { 
        res.json(await bl.getCampaign()); 
    } catch(e) { 
        next(e); 
    }
});


router.put('/update', async (req, res, next) => {
    try {
        
        const result = await bl.updateCampaign(req.body, req.body.password);
        res.json(result);
    } catch (err) {
       
        res.status(err.status || 500).json({ message: err.message });
    }
});

module.exports = router;