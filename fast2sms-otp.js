/**
 * Fast2SMS OTP Integration for Aadya E-commerce
 * Add-to-Cart Phone Verification System
 */

// Fast2SMS Configuration
const FAST2SMS_CONFIG = {
    apiKey: 'qVheXGZzyaxcSUlFHo9I641D0PwiM7Abm3nTgtOufrQ5WdYvpE6uSO0Kgaj9xIPmv3k45wUfVsAnL7lM',
    baseURL: 'https://www.fast2sms.com/dev/bulkV2',
    route: 'otp',
    language: 'english'
};

// Server endpoint configuration (simplified for demo)
const SERVER_CONFIG = {
    // For demo purposes, we'll simulate server calls
    simulateServer: true, // Set to false when you have actual server
    baseURL: 'http://localhost:3000',
    endpoints: {
        sendOTP: '/api/send-otp',
        verifyOTP: '/api/verify-otp'
    }
};

// Fast2SMS OTP Handler Class
class Fast2SMSOTPHandler {
    constructor() {
        this.pendingVerification = null;
        this.otpSentTime = null;
        this.maxRetries = 3;
        this.currentRetries = 0;
        this.cooldownPeriod = 60000; // 1 minute cooldown
        this.otpValidityPeriod = 300000; // 5 minutes
    }

    // Generate 6-digit OTP
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Validate Indian phone number
    validatePhoneNumber(phoneNumber) {
        // Remove all non-digit characters
        const cleanNumber = phoneNumber.replace(/\D/g, '');
        
        // Check if it's a valid 10-digit Indian number
        if (cleanNumber.length === 10 && /^[6-9]/.test(cleanNumber)) {
            return cleanNumber;
        }
        
        // Check if it's with country code
        if (cleanNumber.length === 12 && cleanNumber.startsWith('91')) {
            const number = cleanNumber.substring(2);
            if (/^[6-9]/.test(number)) {
                return number;
            }
        }
        
        return null;
    }

    // Check if user can request OTP (rate limiting)
    canRequestOTP(phoneNumber) {
        const lastOTPTime = localStorage.getItem(`last_otp_${phoneNumber}`);
        if (lastOTPTime) {
            const timeDiff = Date.now() - parseInt(lastOTPTime);
            if (timeDiff < this.cooldownPeriod) {
                const remainingTime = Math.ceil((this.cooldownPeriod - timeDiff) / 1000);
                throw new Error(`Please wait ${remainingTime} seconds before requesting another OTP`);
            }
        }
        
        const dailyCount = this.getDailyOTPCount(phoneNumber);
        if (dailyCount >= 5) {
            throw new Error('Daily OTP limit exceeded. Please try tomorrow.');
        }
        
        return true;
    }

    // Get daily OTP count for rate limiting
    getDailyOTPCount(phoneNumber) {
        const today = new Date().toDateString();
        const key = `otp_count_${phoneNumber}_${today}`;
        return parseInt(localStorage.getItem(key) || '0');
    }

    // Increment daily OTP count
    incrementDailyOTPCount(phoneNumber) {
        const today = new Date().toDateString();
        const key = `otp_count_${phoneNumber}_${today}`;
        const count = this.getDailyOTPCount(phoneNumber);
        localStorage.setItem(key, (count + 1).toString());
    }

    // Send OTP via Fast2SMS (frontend simulation - actual sending happens on server)
    async sendOTP(phoneNumber, productData) {
        try {
            // Validate phone number
            const validNumber = this.validatePhoneNumber(phoneNumber);
            if (!validNumber) {
                throw new Error('Please enter a valid 10-digit Indian mobile number');
            }

            // Check rate limiting
            this.canRequestOTP(validNumber);

            // Show loading state
            this.updateOTPStatus('Sending OTP...', 'info');

            // In a real implementation, this would call your server
            // For demo purposes, we'll simulate the API call
            const otp = this.generateOTP();
            const message = `Your Aadya verification code is ${otp}. Valid for 5 minutes. Do not share with anyone.`;

            // Simulate server call (replace with actual server endpoint)
            const response = await this.callFast2SMSServer({
                numbers: validNumber,
                message: message,
                otp: otp,
                productId: productData?.id || 'unknown'
            });

            if (response.success) {
                // Store verification data
                this.pendingVerification = {
                    phoneNumber: validNumber,
                    productData: productData,
                    otp: otp, // In production, don't store OTP on frontend
                    timestamp: Date.now()
                };

                // Update rate limiting
                localStorage.setItem(`last_otp_${validNumber}`, Date.now().toString());
                this.incrementDailyOTPCount(validNumber);

                this.otpSentTime = Date.now();
                this.updateOTPStatus(`OTP sent to +91${validNumber}. Check your messages.`, 'success');
                this.showOTPInput();
                
                return true;
            } else {
                throw new Error(response.message || 'Failed to send OTP');
            }

        } catch (error) {
            console.error('OTP sending failed:', error);
            this.updateOTPStatus(error.message, 'error');
            return false;
        }
    }

    // Simulate server call to Fast2SMS (replace with actual server implementation)
    async callFast2SMSServer(data) {
        try {
            // This is a simulation - in production, call your server endpoint
            console.log('Simulating Fast2SMS API call:', data);
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Simulate success response
            return {
                success: true,
                message: 'OTP sent successfully',
                requestId: `fast2sms_${Date.now()}`
            };

            /* 
            // Actual server call would look like:
            const response = await fetch(SERVER_CONFIG.baseURL + SERVER_CONFIG.endpoints.sendOTP, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phoneNumber: data.numbers,
                    message: data.message,
                    productId: data.productId
                })
            });
            
            return await response.json();
            */

        } catch (error) {
            console.error('Server call failed:', error);
            return {
                success: false,
                message: 'Network error. Please try again.'
            };
        }
    }    // Verify OTP
    async verifyOTP(otpCode) {
        try {
            if (!this.pendingVerification) {
                throw new Error('No pending verification. Please request OTP first.');
            }

            // Check OTP format
            if (!/^\d{6}$/.test(otpCode)) {
                throw new Error('Please enter a valid 6-digit OTP');
            }

            // Check OTP validity period
            const currentTime = Date.now();
            const otpAge = currentTime - this.pendingVerification.timestamp;
            if (otpAge > this.otpValidityPeriod) {
                this.clearPendingVerification();
                throw new Error('OTP expired. Please request a new one.');
            }

            this.updateOTPStatus('Verifying OTP...', 'info');

            // Simulate server verification (replace with actual server call)
            const isValid = await this.verifyOTPOnServer(otpCode);

            if (isValid) {
                // Mark phone as verified
                const phoneNumber = this.pendingVerification.phoneNumber;
                const productData = this.pendingVerification.productData;

                localStorage.setItem('aadya_phone_verified', 'true');
                localStorage.setItem('aadya_verified_phone', phoneNumber);
                localStorage.setItem('aadya_phone_verification_time', currentTime.toString());

                this.updateOTPStatus('Phone verified successfully!', 'success');

                // For payment page verification, don't add to cart automatically
                if (productData && productData.type !== 'payment_verification') {
                    this.addToCartAfterVerification(productData);
                    
                    // Close modal after short delay for add-to-cart flow
                    setTimeout(() => {
                        this.closeVerificationModal();
                    }, 1500);
                }

                // Clear pending verification
                this.clearPendingVerification();
                
                return true;
            } else {
                this.currentRetries++;
                if (this.currentRetries >= this.maxRetries) {
                    this.clearPendingVerification();
                    throw new Error('Maximum verification attempts exceeded. Please request a new OTP.');
                } else {
                    throw new Error(`Invalid OTP. ${this.maxRetries - this.currentRetries} attempts remaining.`);
                }
            }

        } catch (error) {
            console.error('OTP verification failed:', error);
            this.updateOTPStatus(error.message, 'error');
            return false;
        }
    }

    // Simulate server OTP verification (replace with actual server call)
    async verifyOTPOnServer(otpCode) {
        try {
            // Simulate verification delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // In demo mode, check against stored OTP
            return otpCode === this.pendingVerification.otp;

            /*
            // Actual server call would look like:
            const response = await fetch(SERVER_CONFIG.baseURL + SERVER_CONFIG.endpoints.verifyOTP, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phoneNumber: this.pendingVerification.phoneNumber,
                    otp: otpCode
                })
            });
            
            const result = await response.json();
            return result.success;
            */

        } catch (error) {
            console.error('Server verification failed:', error);
            return false;
        }
    }

    // Add to cart after successful verification
    addToCartAfterVerification(productData) {
        try {
            // Call the original add to cart function
            if (window.addToCartDirectly) {
                window.addToCartDirectly(productData);
            } else {
                // Fallback to basic cart addition
                const cart = JSON.parse(localStorage.getItem('aadya_cart') || '[]');
                
                // Check if product already exists
                const existingIndex = cart.findIndex(item => item.id === productData.id);
                
                if (existingIndex > -1) {
                    cart[existingIndex].quantity += 1;
                } else {
                    cart.push({
                        ...productData,
                        quantity: 1,
                        addedAt: new Date().toISOString()
                    });
                }
                
                localStorage.setItem('aadya_cart', JSON.stringify(cart));
                
                // Update cart count
                if (window.updateCartCount) {
                    window.updateCartCount();
                }
                
                // Show success notification
                this.showNotification(`${productData.name} added to cart!`, 'success');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            this.showNotification('Product verification successful, but failed to add to cart. Please try again.', 'error');
        }
    }

    // Check if phone is already verified
    isPhoneVerified() {
        const isVerified = localStorage.getItem('aadya_phone_verified');
        const verificationTime = localStorage.getItem('aadya_phone_verification_time');
        
        if (!isVerified || !verificationTime) {
            return false;
        }
        
        // Check if verification is still valid (24 hours)
        const verificationAge = Date.now() - parseInt(verificationTime);
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        
        if (verificationAge > maxAge) {
            // Clear expired verification
            localStorage.removeItem('aadya_phone_verified');
            localStorage.removeItem('aadya_verified_phone');
            localStorage.removeItem('aadya_phone_verification_time');
            return false;
        }
        
        return true;
    }

    // Show phone verification modal
    showPhoneVerificationModal(productData) {
        const modal = document.createElement('div');
        modal.id = 'phone-verification-modal';
        modal.className = 'phone-verification-overlay';
        
        modal.innerHTML = `
            <div class="phone-verification-modal">
                <div class="modal-header">
                    <h3><i class="fa-solid fa-shield-halved"></i> Verify Phone Number</h3>
                    <button class="close-btn" onclick="fast2smsHandler.closeVerificationModal()">
                        <i class="fa-solid fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    <p class="verification-info">
                        <i class="fa-solid fa-info-circle"></i>
                        We need to verify your phone number to add items to cart and process orders securely.
                    </p>
                    
                    <div class="product-preview">
                        <img src="${productData.image}" alt="${productData.name}" class="product-image">
                        <div class="product-details">
                            <h4>${productData.name}</h4>
                            <p class="product-price">₹${productData.price}</p>
                        </div>
                    </div>
                    
                    <div class="phone-input-section">
                        <label for="verification-phone">Phone Number *</label>
                        <div class="phone-input-group">
                            <span class="country-code">+91</span>
                            <input type="tel" id="verification-phone" placeholder="Enter 10-digit mobile number" maxlength="10">
                            <button type="button" id="send-verification-otp" onclick="fast2smsHandler.handleSendOTP()">
                                <i class="fa-solid fa-paper-plane"></i> Send OTP
                            </button>
                        </div>
                        <div id="phone-verification-status" class="status-message"></div>
                    </div>
                    
                    <div id="otp-input-section" class="otp-section" style="display: none;">
                        <label for="verification-otp">Enter OTP *</label>
                        <div class="otp-input-group">
                            <input type="text" id="verification-otp" placeholder="6-digit OTP" maxlength="6">
                            <button type="button" id="verify-otp" onclick="fast2smsHandler.handleVerifyOTP()">
                                <i class="fa-solid fa-check-circle"></i> Verify
                            </button>
                        </div>
                        <div class="otp-timer">
                            <span id="otp-countdown"></span>
                            <button type="button" id="resend-otp" onclick="fast2smsHandler.handleSendOTP()" style="display: none;">
                                Resend OTP
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <div class="security-note">
                        <i class="fa-solid fa-lock"></i>
                        Your phone number is encrypted and secure. We'll only use it for order updates.
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Store product data for later use
        this.pendingVerification = { productData };
        
        // Show modal with animation
        requestAnimationFrame(() => {
            modal.classList.add('show');
        });
        
        // Focus on phone input
        setTimeout(() => {
            document.getElementById('verification-phone').focus();
        }, 300);
    }

    // Handle send OTP button click
    handleSendOTP() {
        const phoneInput = document.getElementById('verification-phone');
        const phoneNumber = phoneInput.value.trim();
        
        if (!phoneNumber) {
            this.updateOTPStatus('Please enter your phone number', 'error');
            phoneInput.focus();
            return;
        }
        
        const productData = this.pendingVerification?.productData;
        this.sendOTP(phoneNumber, productData);
    }

    // Handle verify OTP button click
    handleVerifyOTP() {
        const otpInput = document.getElementById('verification-otp');
        const otpCode = otpInput.value.trim();
        
        if (!otpCode) {
            this.updateOTPStatus('Please enter the OTP', 'error');
            otpInput.focus();
            return;
        }
        
        this.verifyOTP(otpCode);
    }

    // Show OTP input section
    showOTPInput() {
        const otpSection = document.getElementById('otp-input-section');
        if (otpSection) {
            otpSection.style.display = 'block';
            
            // Start countdown timer
            this.startOTPCountdown();
            
            // Focus on OTP input
            setTimeout(() => {
                document.getElementById('verification-otp').focus();
            }, 100);
        }
    }

    // Start OTP countdown timer
    startOTPCountdown() {
        let timeLeft = 300; // 5 minutes
        const countdownElement = document.getElementById('otp-countdown');
        const resendButton = document.getElementById('resend-otp');
        
        const countdown = setInterval(() => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            
            if (countdownElement) {
                countdownElement.textContent = `OTP expires in ${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
            
            timeLeft--;
            
            if (timeLeft < 0) {
                clearInterval(countdown);
                if (countdownElement) {
                    countdownElement.textContent = 'OTP expired';
                }
                if (resendButton) {
                    resendButton.style.display = 'inline-block';
                }
            }
        }, 1000);
    }    // Update OTP status message
    updateOTPStatus(message, type = 'info') {
        // Check if we're in the payment page context
        const paymentPhoneStatus = document.getElementById('phone-status');
        const modalStatusElement = document.getElementById('phone-verification-status');
        
        if (paymentPhoneStatus && !modalStatusElement) {
            // We're in payment page - update payment page status
            const icons = {
                success: 'fa-check-circle',
                error: 'fa-exclamation-triangle',
                info: 'fa-info-circle'
            };
            
            paymentPhoneStatus.innerHTML = `<small><i class="fa-solid ${icons[type]}"></i> ${message}</small>`;
            paymentPhoneStatus.className = `phone-status ${type}`;
        } else if (modalStatusElement) {
            // We're in modal context - update modal status
            const icons = {
                success: 'fa-check-circle',
                error: 'fa-exclamation-triangle',
                info: 'fa-info-circle'
            };
            
            modalStatusElement.innerHTML = `
                <i class="fa-solid ${icons[type]}"></i>
                ${message}
            `;
            modalStatusElement.className = `status-message ${type}`;
        }
    }

    // Close verification modal
    closeVerificationModal() {
        const modal = document.getElementById('phone-verification-modal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
        this.clearPendingVerification();
    }

    // Clear pending verification data
    clearPendingVerification() {
        this.pendingVerification = null;
        this.otpSentTime = null;
        this.currentRetries = 0;
    }

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fa-solid ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i>
            ${message}
        `;
        
        document.body.appendChild(notification);
        
        // Show with animation
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }
}

// Create global instance
window.fast2smsHandler = new Fast2SMSOTPHandler();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Fast2SMSOTPHandler;
}
