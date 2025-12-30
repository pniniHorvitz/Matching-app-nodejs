
const Campaign = require('../models/Campaign');

module.exports = {
    get: async () => {
        return await Campaign.findOne().lean();
    },

    
    update: async (newData) => {
        const updatedCampaign = await Campaign.findOneAndUpdate(
            {}, 
            { $set: newData }, 
            { new: true, lean: true }
        );
        return updatedCampaign;
    }
};