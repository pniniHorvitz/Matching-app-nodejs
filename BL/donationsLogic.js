const donationsDAL = require('../DAL/crud/donationsCRUD');

module.exports = {
   
    getDonations: async () => {
        return await donationsDAL.getAll();
    },

    create: async (data) => {
        if (!data.amount || data.amount <= 0) throw { status: 400, message: "סכום לא תקין" };
        
        console.log(`[DONATION LOG] ${new Date().toLocaleString()}: ${data.donorName} תרם ${data.amount}₪`);
        
        return await donationsDAL.add(data);
    }
};