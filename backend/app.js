const express = require('express');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let formData = {
    contacts: [],
    newsletters: []
};

// Load existing data
try {
    const data = fs.readFileSync('data.json');
    formData = JSON.parse(data);
} catch (err) {
    console.log('No existing data file, starting fresh');
}

// Your contact form route
app.post('/submit-contact', (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        const newContact = {
            id: Date.now(),
            name,
            email,
            subject,
            message,
            timestamp: new Date().toISOString()
        };
        formData.contacts.push(newContact);
        saveData();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/submit-newsletter', (req, res) => {
    try {
        const { email } = req.body;
        const newSubscription = {
            id: Date.now(),
            email,
            timestamp: new Date().toISOString()
        };
        formData.newsletters.push(newSubscription);
        saveData();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// Data retrieval endpoint
app.get('/get-data', (req, res) => {
    res.json(formData);
});

function saveData() {
    fs.writeFileSync('data.json', JSON.stringify(formData, null, 2));
}

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});