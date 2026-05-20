require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    trialStartedAt: { type: Date, default: Date.now },
    role: { type: String, default: 'user' },
    savedMealPlan: { type: String, default: null },
    savedGroceryList: { type: String, default: null },
    savedWorkout: { type: String, default: null }
});

const User = mongoose.model('User', userSchema);

app.get('/api/admin/users', async (req, res) => {
    try {
        const users = await User.find({}, '-password');
        res.json(users);
    } catch (error) {
        console.error('Fetch users error:', error);
        res.status(500).json({ error: 'Failed to fetch users.' });
    }
});

app.delete('/api/admin/users/:email', async (req, res) => {
    try {
        const deletedUser = await User.findOneAndDelete({ email: req.params.email });
        if (!deletedUser) return res.status(404).json({ error: 'User not found.' });
        res.json({ message: `${req.params.email} has been deleted.` });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user.' });
    }
});

app.put('/api/admin/users/reset-password', async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        const updatedUser = await User.findOneAndUpdate(
            { email },
            { password: hashedPassword },
            { returnDocument: 'after' }
        );
        if (!updatedUser) return res.status(404).json({ error: 'User not found.' });
        res.json({ message: `Password for ${email} has been reset.` });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Failed to reset password.' });
    }
});

app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) return res.status(400).json({ error: 'Username or email already exists.' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'Registration successful!', username: newUser.username, email: newUser.email, user: newUser });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Server error during registration.' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'Invalid email or password.' });

        if (user.email === 'PUT-YOUR-EMAIL-HERE@gmail.com' && user.role !== 'admin') {
            user.role = 'admin';
            await user.save();
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid email or password.' });

        res.json({ message: 'Login successful!', username: user.username, email: user.email, user });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login.' });
    }
});

app.put('/api/save-plans', async (req, res) => {
    try {
        const { email, mealPlan, groceryList, workout } = req.body;
        const updatedUser = await User.findOneAndUpdate(
            { email },
            { savedMealPlan: mealPlan, savedGroceryList: groceryList, savedWorkout: workout },
            { returnDocument: 'after' }
        );
        if (!updatedUser) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ message: 'Plans saved.', user: updatedUser });
    } catch (error) {
        console.error('Save plans error:', error);
        res.status(500).json({ message: 'Server error saving plans' });
    }
});

app.post('/api/create-checkout-session', async (req, res) => {
    try {
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        const { email } = req.body;

        const session = await stripe.checkout.sessions.create({
            ui_mode: 'embedded',
            payment_method_types: ['card'],
            customer_email: email,
            line_items: [
                {
                    price_data: {
                        currency: 'gbp',
                        product_data: {
                            name: 'MealMatch AI Premium (Lifetime Access)',
                            description: 'One-time payment for unlimited meal plans, grocery lists, and workouts.',
                        },
                        unit_amount: 3000,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            return_url: 'https://meal-match.app/?session_id={CHECKOUT_SESSION_ID}',
        });

        res.json({ clientSecret: session.client_secret });
    } catch (error) {
        console.error('Stripe session error:', error);
        res.status(500).json({ error: 'Failed to connect to Stripe.' });
    }
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/generate', async (req, res) => {
    try {
        const { email, prompt, systemInstruction } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'User not found. Please log in.' });

        const trialDuration = 3 * 24 * 60 * 60 * 1000;
        const timePassed = new Date() - user.trialStartedAt;

        if (timePassed > trialDuration) {
            return res.status(403).json({
                error: 'TRIAL_EXPIRED',
                message: 'Your 3-day trial has expired. Please upgrade to Premium to continue.'
            });
        }

        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction,
            generationConfig: { responseMimeType: 'application/json' }
        });

        const result = await model.generateContent(prompt);
        res.json(JSON.parse(result.response.text()));
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate plan.' });
    }
});

app.post('/api/recipe', async (req, res) => {
    try {
        const { prompt, systemInstruction } = req.body;
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', systemInstruction });
        const result = await model.generateContent(prompt);
        res.json({ text: result.response.text() });
    } catch (error) {
        res.status(500).json({ error: 'Recipe failed.' });
    }
});

app.post('/api/workout', async (req, res) => {
    try {
        const { prompt, systemInstruction } = req.body;
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', systemInstruction });
        const result = await model.generateContent(prompt);
        res.json({ text: result.response.text() });
    } catch (error) {
        res.status(500).json({ error: 'Workout failed.' });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
