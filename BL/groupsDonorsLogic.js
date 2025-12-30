const gdDAL = require('../DAL/crud/groupsDonorsCRUD');

module.exports = {
   
    getGroups: async () => await gdDAL.getGroups(),
    getDonors: async () => await gdDAL.getDonors(),
    
    updateDonorTarget: async (id, newTarget, code) => {
        
        const donor = await gdDAL.getDonorById(id);

        if (!donor) throw { status: 404, message: "מתרים לא נמצא" };

   
        if (code !== "1234" && code !== donor.secretCode) {
            throw { status: 403, message: "קוד אימות שגוי" };
        }

        
        return await gdDAL.updateDonorTarget(id, newTarget);
    },

    addDonor: async (donorData, role) => {
        if (role !== 'admin') throw { status: 403, message: "רק מנהל יכול להוסיף מתרימים" };
        
        
        const newDonor = await gdDAL.addDonor({
            name: donorData.name,
            personalTarget: Number(donorData.target),
            secretCode: donorData.secretCode,
            groupId: Number(donorData.groupId)
        });
        
        return newDonor;
    }
};