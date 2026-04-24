const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Staff } = require('../models/AllModels');

const JWT_SECRET = process.env.JWT_SECRET || 'ceylonpos-secret-key-2026';
const JWT_EXPIRES = '8h';

// ─── Email + Password Login (Web Dashboard) ───────────────────────────────────
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ message: 'Email and password required' });

        const staff = await Staff.findOne({ email: email.toLowerCase(), status: 'Active' });
        if (!staff)
            return res.status(401).json({ message: 'Invalid credentials' });

        // If no password_hash set yet (legacy staff), allow first-time setup
        if (!staff.password_hash) {
            return res.status(401).json({ message: 'Password not set. Contact admin.' });
        }

        const isMatch = await bcrypt.compare(password, staff.password_hash);
        if (!isMatch)
            return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign(
            { id: staff._id, name: staff.name, role: staff.role, branch_id: staff.branch_id },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES }
        );

        res.json({
            token,
            user: { id: staff._id, name: staff.name, role: staff.role, branch_id: staff.branch_id }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─── PIN Login (Cashier Terminal) ─────────────────────────────────────────────
exports.pinLogin = async (req, res) => {
    try {
        const { pin } = req.body;
        if (!pin || pin.length < 4)
            return res.status(400).json({ message: 'PIN must be at least 4 digits' });

        // Find staff where pin_hash matches
        const allStaff = await Staff.find({ status: 'Active' });
        let matchedStaff = null;
        for (const s of allStaff) {
            if (s.pin_hash && await bcrypt.compare(String(pin), s.pin_hash)) {
                matchedStaff = s;
                break;
            }
        }

        if (!matchedStaff)
            return res.status(401).json({ message: 'Invalid PIN' });

        const token = jwt.sign(
            { id: matchedStaff._id, name: matchedStaff.name, role: matchedStaff.role, branch_id: matchedStaff.branch_id },
            JWT_SECRET,
            { expiresIn: '12h' }
        );

        res.json({
            token,
            user: { id: matchedStaff._id, name: matchedStaff.name, role: matchedStaff.role, branch_id: matchedStaff.branch_id }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─── Register Staff Account (Admin only) ──────────────────────────────────────
exports.register = async (req, res) => {
    try {
        const { name, email, password, pin, role, branch_id, salary, phone, address, nic } = req.body;
        if (!name || !email || !password)
            return res.status(400).json({ message: 'Name, email and password required' });

        const existing = await Staff.findOne({ email: email.toLowerCase() });
        if (existing)
            return res.status(409).json({ message: 'Email already registered' });

        const password_hash = await bcrypt.hash(password, 12);
        const pin_hash = pin ? await bcrypt.hash(String(pin), 10) : undefined;

        const staff = new Staff({
            name,
            email: email.toLowerCase(),
            password_hash,
            pin_hash,
            role: role || 'cashier',
            branch_id: branch_id || 'HQ',
            salary,
            phone,
            address,
            nic
        });

        await staff.save();
        res.status(201).json({ message: 'Staff account created successfully', id: staff._id });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// ─── Get current logged-in user ───────────────────────────────────────────────
exports.me = async (req, res) => {
    try {
        const staff = await Staff.findById(req.user.id).select('-password_hash -pin_hash');
        if (!staff) return res.status(404).json({ message: 'User not found' });
        res.json(staff);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─── Set / Update PIN for a staff member ──────────────────────────────────────
exports.setPin = async (req, res) => {
    try {
        const { pin } = req.body;
        if (!pin || String(pin).length < 4)
            return res.status(400).json({ message: 'PIN must be at least 4 digits' });

        const pin_hash = await bcrypt.hash(String(pin), 10);
        await Staff.findByIdAndUpdate(req.user.id, { pin_hash });
        res.json({ message: 'PIN updated successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
