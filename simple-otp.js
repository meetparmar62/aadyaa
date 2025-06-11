// Simple OTP System - Alternative to Firebase
// This is for development/testing purposes

class SimpleOTPService {
    constructor() {
        this.otpStore = new Map(); // Store OTPs temporarily
        this.otpTimeout = 300000; // 5 minutes
    }

    // Generate 6-digit OTP
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Send OTP (simulate sending)
    async sendOTP(phoneNumber) {
        return new Promise((resolve, reject) => {
            try {
                // Validate phone number
                if (!/^\+91[0-9]{10}$/.test(phoneNumber)) {
                    reject(new Error('Invalid phone number format'));
                    return;
                }

                // Generate OTP
                const otp = this.generateOTP();
                
                // Store OTP with expiration
                this.otpStore.set(phoneNumber, {
                    code: otp,
                    timestamp: Date.now(),
                    attempts: 0
                });

                // Simulate network delay
                setTimeout(() => {
                    console.log(`OTP for ${phoneNumber}: ${otp}`); // In real app, this would be sent via SMS
                    alert(`Demo Mode: OTP is ${otp}`); // For development only
                    resolve({ success: true, message: 'OTP sent successfully' });
                }, 1000);

                // Auto-cleanup after timeout
                setTimeout(() => {
                    this.otpStore.delete(phoneNumber);
                }, this.otpTimeout);

            } catch (error) {
                reject(error);
            }
        });
    }

    // Verify OTP
    async verifyOTP(phoneNumber, userOTP) {
        return new Promise((resolve, reject) => {
            try {
                const storedData = this.otpStore.get(phoneNumber);

                if (!storedData) {
                    reject(new Error('OTP expired or not found. Please send OTP again.'));
                    return;
                }

                // Check if OTP is expired
                if (Date.now() - storedData.timestamp > this.otpTimeout) {
                    this.otpStore.delete(phoneNumber);
                    reject(new Error('OTP expired. Please send a new one.'));
                    return;
                }

                // Check attempts limit
                if (storedData.attempts >= 3) {
                    this.otpStore.delete(phoneNumber);
                    reject(new Error('Too many attempts. Please send a new OTP.'));
                    return;
                }

                // Verify OTP
                if (storedData.code === userOTP) {
                    this.otpStore.delete(phoneNumber); // Clear OTP after successful verification
                    resolve({ success: true, message: 'Phone number verified successfully!' });
                } else {
                    storedData.attempts++;
                    reject(new Error(`Invalid OTP. ${3 - storedData.attempts} attempts remaining.`));
                }

            } catch (error) {
                reject(error);
            }
        });
    }
}

// Make it available globally
window.SimpleOTPService = SimpleOTPService;
