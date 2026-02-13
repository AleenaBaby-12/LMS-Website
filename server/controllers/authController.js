const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const {
        name, email, password, role,
        // Common profile fields
        phone, bio, country, profilePicture,
        // Instructor-specific fields
        qualifications, professionalTitle, organization, website, linkedIn
    } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user object with all fields
        const userData = {
            name,
            email,
            password,
            role
        };

        // Add common profile fields if provided
        if (phone) userData.phone = phone;
        if (bio) userData.bio = bio;
        if (country) userData.country = country;
        if (profilePicture) userData.profilePicture = profilePicture;

        // Add instructor-specific fields if role is teacher
        if (role === 'teacher') {
            if (qualifications) userData.qualifications = qualifications;
            if (professionalTitle) userData.professionalTitle = professionalTitle;
            if (organization) userData.organization = organization;
            if (website) userData.website = website;
            if (linkedIn) userData.linkedIn = linkedIn;
        }

        const user = await User.create(userData);

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profilePicture: user.profilePicture,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Registration Error:', error); // Log full error object
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            if (user.isBlocked) {
                return res.status(403).json({ message: 'Your account has been blocked. Please contact support.' });
            }
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profilePicture: user.profilePicture,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                bio: user.bio,
                country: user.country,
                profilePicture: user.profilePicture,
                qualifications: user.qualifications,
                professionalTitle: user.professionalTitle,
                organization: user.organization,
                website: user.website,
                linkedIn: user.linkedIn,
                createdAt: user.createdAt
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};


// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.phone = req.body.phone || user.phone;
        user.bio = req.body.bio || user.bio;
        user.country = req.body.country || user.country;
        user.profilePicture = req.body.profilePicture || user.profilePicture;

        // Instructor/Mentor fields
        if (user.role === 'teacher' || req.body.role === 'teacher') {
            user.professionalTitle = req.body.professionalTitle || user.professionalTitle;
            user.organization = req.body.organization || user.organization;
            user.qualifications = req.body.qualifications || user.qualifications;
            user.website = req.body.website || user.website;
            user.linkedIn = req.body.linkedIn || user.linkedIn;
        }

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            phone: updatedUser.phone,
            bio: updatedUser.bio,
            country: updatedUser.country,
            profilePicture: updatedUser.profilePicture,
            createdAt: updatedUser.createdAt,
            token: generateToken(updatedUser._id)
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

module.exports = { registerUser, loginUser, getUserProfile, updateUserProfile };
