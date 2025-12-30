
const Donor = require('../models/Donor');
const Group = require('../models/Group');

module.exports = {
   
    getGroups: async () => {
        return await Group.find().lean();
    },

 
    getDonors: async () => {
        return await Donor.find().lean();
    },


    getDonorById: async (id) => {
        return await Donor.findOne({ id: Number(id) }).lean();
    },

   
    updateDonorTarget: async (id, target) => {
        const updatedDonor = await Donor.findOneAndUpdate(
            { id: Number(id) }, 
            { $set: { personalTarget: Number(target) } },
            { new: true, lean: true }
        );
        return updatedDonor;
    },

    addDonor: async (donorData) => {
        const newDonor = new Donor({
            ...donorData,
            id: Date.now(),
            amountRaised: 0 
        });
        const savedDonor = await newDonor.save();
        return savedDonor.toObject();
    }
};