const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Middleware
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173', // Vite default port
    credentials: true
}));

// Request Logger
app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.url}`);
    next();
});

// Serve static files from uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Connection
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error('MongoDB Connection Error:', err.message);
        // Do not exit process immediately in dev to allow seeing the error
        // process.exit(1); 
    }
};

// Routes Placeholder
app.get('/', (req, res) => {
    res.send('LMS API is running');
});

const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/gamification', require('./routes/gamificationRoutes'));
app.use('/api/career', require('./routes/careerRoutes'));
app.use('/api/mentors', require('./routes/mentorRoutes'));
app.use('/api/mentor-connections', require('./routes/mentorConnectionRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));


// Start Server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
