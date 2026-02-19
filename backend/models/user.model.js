const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    // Identity
    username: { type: String, trim: true },
    email: {
        type: String,
        unique: true,
        sparse: true, // Allows null (for wallet-only users initially)
        lowercase: true,
        trim: true
    },
    password: { type: String, select: false }, // Hashed password, excluded by default
    walletAddress: {
        type: String,
        unique: true,
        sparse: true, // Allows null (for email-only users initially)
        lowercase: true,
        trim: true
    },

    // Account Type & Profile
    accountType: {
        type: String,
        enum: ['individual', 'freelancer', 'company'],
        default: 'individual'
    },
    profileImage: { type: String },
    coverImage: { type: String },
    bio: { type: String },

    // Commercial / Business Profile
    companyName: { type: String, trim: true },
    taxId: { type: String, trim: true }, // VAT/RFC/CIF
    industry: {
        type: String,
        enum: ['Logistics', 'Retail', 'Real Estate', 'Finance', 'Technology', 'Healthcare', 'Manufacturing', 'Other'],
    },
    companySize: {
        type: String,
        enum: ['1-10', '11-50', '51-200', '200+']
    },
    website: { type: String, trim: true },
    primaryContactRole: { type: String, trim: true }, // CEO, CTO, Manager, etc.
    expectedVolume: {
        type: String,
        enum: ['<10k', '10k-50k', '50k+']
    },
    interestedServices: [{
        type: String,
        enum: ['Payments', 'RWA Tokenization', 'Logistics', 'DeFi/Yield']
    }],

    // Contact Info
    phone: { type: String, trim: true },
    address: {
        street: String,
        city: String,
        state: String,
        zip: String,
        country: String
    },

    // System & Verification
    roles: {
        type: [String],
        default: ['USER'],
        enum: ['USER', 'ADMIN', 'DEVELOPER', 'VERIFIED_BUSINESS']
    },
    isEmailVerified: { type: Boolean, default: false },
    isWalletVerified: { type: Boolean, default: false },

    // External Auth Providers
    googleId: { type: String, unique: true, sparse: true },
    facebookId: { type: String, unique: true, sparse: true },
    githubId: { type: String, unique: true, sparse: true },
    twitterId: { type: String, unique: true, sparse: true },

    // Affiliate System
    affiliate: {
        referralCode: { type: String, unique: true },
        referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        registeredWithCode: { type: String },
        earnings: { type: Number, default: 0 }
    },

    // Legacy/Compatibility Fields (to match previous mock structure if needed)
    subscription: { type: String, default: 'FREE' },
    vipTier: { type: String, enum: ['bronze', 'silver', 'gold', 'platinum', null], default: null },
    contactSync: {
        hasSynced: { type: Boolean, default: false },
        lastSync: Date
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Index for polite searching
UserSchema.index({ username: 'text', companyName: 'text' });

module.exports = mongoose.model('User', UserSchema);