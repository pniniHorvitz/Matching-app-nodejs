
const Donation = require('../models/Donation');

module.exports = {
    
    getAll: async () => {
        
        return await Donation.find().sort({ date: -1 }).lean();
    },

    
    add: async (donation) => {
        
        const newDonationData = { 
            id: Date.now(), 
            ...donation, 
            date: new Date()
        };

        const createdDonation = await Donation.create(newDonationData);
        
       
        return createdDonation.toObject();
    }
};