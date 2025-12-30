const mongoose = require('mongoose');


const uri = "mongodb+srv://admin:3306@cluster0.w5kzneo.mongodb.net/?appName=Cluster0";

mongoose.connect(uri)
    .then(() => console.log('✅ מחובר בהצלחה ל-MongoDB Atlas'))
    .catch(err => console.error('❌ שגיאת חיבור לענן:', err));
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('public'));

app.use('/api/campaign', require('./routing/campaignRouter'));
app.use('/api/donations', require('./routing/donationsRouter'));
app.use('/api/groups', require('./routing/groupsRouter'));


app.use((err, req, res, next) => {
    console.error("System Error:", err.message);
    res.status(err.status || 500).json({
        status: 'error',
        message: "אופס! חלה שגיאה בשרת המאצ'ינג",
        detail: err.message
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 השרת רץ בפורט ${PORT}`);
});