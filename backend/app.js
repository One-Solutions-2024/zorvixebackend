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
        // Add your processing logic here
        console.log('Received contact form submission:', { name, email, subject, message });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Your newsletter route
app.post('/submit-newsletter', (req, res) => {
    try {
        const { email } = req.body;
        // Add your processing logic here
        console.log('Received newsletter subscription:', email);
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