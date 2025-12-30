const campaignDAL = require('../DAL/crud/campaignCRUD');
const ADMIN_SECRET_CODE = "1234";

module.exports = {
    getCampaign: async () => {
        const c = await campaignDAL.get();
        if (!c) return null; 

        const days = Math.ceil((new Date(c.deadline) - new Date()) / (1000 * 60 * 60 * 24));
        return { ...c, daysLeft: Math.max(0, days) };
    },

   updateCampaign: async (updateData, providedCode) => {
        if (providedCode !== ADMIN_SECRET_CODE) {
            throw { status: 403, message: "קוד מנהל שגוי - הגישה נדחתה" };
        }

        const current = await campaignDAL.get();
        if (!current) throw { status: 404, message: "נתוני קמפיין לא נמצאו" };
        
        const updated = {
            name: updateData.name || current.name,
            target: updateData.target ? Number(updateData.target) : current.target,
            deadline: updateData.deadline || current.deadline
        };

        console.log(`[ADMIN] Campaign updated with code validation.`);
        
        return await campaignDAL.update(updated);
    }
};