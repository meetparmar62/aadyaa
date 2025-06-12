/**
 * Razorpay Configuration for Aadya E-commerce
 * Secure payment processing with best practices
 */

// Razorpay configuration
const RAZORPAY_CONFIG = {
    key_id: 'rzp_test_wprLXkrhIRnVmn', // Your test key
    currency: 'INR',
    theme: {
        color: '#FF7F50' // Aadya's coral color
    },
    modal: {
        ondismiss: function() {
            console.log('Payment modal closed');
            showPaymentMessage('Payment cancelled by user', 'info');
        }
    }
};

// Payment handler class for better organization
class AadyaPaymentHandler {
    constructor() {
        this.isProcessing = false;
        this.currentOrderData = null;
    }

    // Create order on server (simulated for demo)
    async createOrder(orderData) {
        try {
            // In production, this would be an API call to your backend
            const orderAmount = this.calculateOrderAmount(orderData);
            
            // Simulate server order creation
            const serverOrder = {
                id: `order_${Date.now()}${Math.random().toString(36).substring(7)}`,
                amount: orderAmount * 100, // Convert to paise
                currency: 'INR',
                receipt: `receipt_${Date.now()}`,
                created_at: Date.now()
            };

            // Store order data for verification
            this.currentOrderData = {
                ...orderData,
                razorpay_order_id: serverOrder.id,
                amount: orderAmount
            };

            return serverOrder;
        } catch (error) {
            console.error('Order creation failed:', error);
            throw new Error('Failed to create order. Please try again.');
        }
    }

    // Calculate total order amount
    calculateOrderAmount(orderData) {
        const cart = JSON.parse(localStorage.getItem('aadya_cart') || '[]');
        let subtotal = 0;
        
        cart.forEach(item => {
            subtotal += parseFloat(item.price) * item.quantity;
        });

        const shipping = subtotal >= 999 ? 0 : 99;
        let total = subtotal + shipping;

        // Apply coupon discount if any
        const appliedCoupon = JSON.parse(localStorage.getItem('aadya_applied_coupon'));
        if (appliedCoupon) {
            let discountAmount = 0;
            if (appliedCoupon.type === 'percentage') {
                discountAmount = (subtotal * appliedCoupon.discount) / 100;
            } else {
                discountAmount = appliedCoupon.discount;
            }
            total = Math.max(0, total - discountAmount);
        }

        return Math.round(total * 100) / 100; // Round to 2 decimal places
    }

    // Initialize Razorpay payment
    async initiatePayment(orderData) {
        if (this.isProcessing) {
            showPaymentMessage('Payment already in progress...', 'warning');
            return;
        }

        try {
            this.isProcessing = true;
            showPaymentMessage('Creating your order...', 'info');

            // Create order
            const serverOrder = await this.createOrder(orderData);

            // Configure Razorpay options
            const options = {
                ...RAZORPAY_CONFIG,
                amount: serverOrder.amount,
                order_id: serverOrder.id,
                name: 'Aadya Fashions',
                description: 'Your Fashion, Our Passion',
                image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNGRjdGNTAiLz4KPHRleHQgeD0iMjAiIHk9IjI1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmb250LXdlaWdodD0iYm9sZCI+QTwvdGV4dD4KPC9zdmc+',
                prefill: {
                    name: `${orderData.customerInfo.firstName} ${orderData.customerInfo.lastName}`,
                    email: orderData.customerInfo.email,
                    contact: orderData.customerInfo.phone
                },
                notes: {
                    address: orderData.shippingAddress.address,
                    city: orderData.shippingAddress.city,
                    state: orderData.shippingAddress.state
                },
                handler: (response) => this.handlePaymentSuccess(response),
                modal: {
                    ondismiss: () => {
                        this.isProcessing = false;
                        showPaymentMessage('Payment cancelled', 'warning');
                        this.resetPaymentButton();
                    }
                }
            };

            // Initialize Razorpay
            const rzp = new Razorpay(options);

            // Handle payment failure
            rzp.on('payment.failed', (response) => {
                this.handlePaymentFailure(response);
            });

            // Open payment modal
            rzp.open();

        } catch (error) {
            console.error('Payment initiation failed:', error);
            this.isProcessing = false;
            showPaymentMessage(error.message || 'Payment initialization failed', 'error');
            this.resetPaymentButton();
        }
    }

    // Handle successful payment
    async handlePaymentSuccess(response) {
        try {
            showPaymentMessage('Payment successful! Verifying...', 'success');

            // Verify payment (in production, this should be done on server)
            const isValid = await this.verifyPayment(response);

            if (isValid) {
                // Complete the order
                const orderId = this.completeOrder(response);
                
                showPaymentMessage('Order placed successfully!', 'success');
                
                // Clear cart and redirect
                setTimeout(() => {
                    localStorage.removeItem('aadya_cart');
                    localStorage.removeItem('aadya_applied_coupon');
                    window.location.href = `order-confirmation.html?orderId=${orderId}`;
                }, 2000);
            } else {
                throw new Error('Payment verification failed');
            }

        } catch (error) {
            console.error('Payment verification failed:', error);
            showPaymentMessage('Payment verification failed. Please contact support.', 'error');
        } finally {
            this.isProcessing = false;
        }
    }

    // Handle payment failure
    handlePaymentFailure(response) {
        console.error('Payment failed:', response.error);
        this.isProcessing = false;
        
        const errorMessage = this.getErrorMessage(response.error.code);
        showPaymentMessage(errorMessage, 'error');
        this.resetPaymentButton();
    }

    // Verify payment (server-side verification simulation)
    async verifyPayment(response) {
        try {
            // In production, send these details to your server for verification
            const paymentData = {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
            };

            // For demo purposes, we'll simulate verification
            // In production, verify the signature on your server using crypto
            console.log('Payment verification data:', paymentData);
            
            // Simulate server verification delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            return true; // In production, return actual verification result
        } catch (error) {
            console.error('Payment verification error:', error);
            return false;
        }
    }

    // Complete order after successful payment
    completeOrder(paymentResponse) {
        const orderId = `AADYA-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        
        const orderData = {
            orderId: orderId,
            customerInfo: this.currentOrderData.customerInfo,
            shippingAddress: this.currentOrderData.shippingAddress,
            paymentMethod: 'razorpay',
            paymentStatus: 'completed',
            paymentId: paymentResponse.razorpay_payment_id,
            razorpayOrderId: paymentResponse.razorpay_order_id,
            items: JSON.parse(localStorage.getItem('aadya_cart') || '[]'),
            total: `₹${this.currentOrderData.amount.toFixed(2)}`,
            orderDate: new Date().toISOString(),
            instructions: this.currentOrderData.instructions || '',
            discountApplied: localStorage.getItem('aadya_applied_coupon') ? JSON.parse(localStorage.getItem('aadya_applied_coupon')).code : null
        };

        // Store order
        const orders = JSON.parse(localStorage.getItem('aadya_orders') || '[]');
        orders.push(orderData);
        localStorage.setItem('aadya_orders', JSON.stringify(orders));

        return orderId;
    }

    // Get user-friendly error messages
    getErrorMessage(errorCode) {
        const errorMessages = {
            'BAD_REQUEST_ERROR': 'Invalid payment request. Please try again.',
            'GATEWAY_ERROR': 'Payment gateway error. Please try again.',
            'NETWORK_ERROR': 'Network error. Please check your connection.',
            'SERVER_ERROR': 'Server error. Please try again later.',
            'VALIDATION_ERROR': 'Invalid payment details. Please check and try again.',
            'INSUFFICIENT_BALANCE': 'Insufficient balance in your account.',
            'INVALID_CARD_DETAILS': 'Invalid card details. Please check and try again.',
            'CARD_DECLINED': 'Your card was declined. Please try another payment method.',
            'EXPIRED_CARD': 'Your card has expired. Please use another card.',
            'BLOCKED_CARD': 'Your card is blocked. Please contact your bank.',
        };

        return errorMessages[errorCode] || 'Payment failed. Please try again.';
    }

    // Reset payment button state
    resetPaymentButton() {
        const placeOrderBtn = document.getElementById('place-order-btn');
        if (placeOrderBtn) {
            placeOrderBtn.classList.remove('btn-loading');
            placeOrderBtn.disabled = false;
            placeOrderBtn.innerHTML = '<i class="fa-solid fa-lock" style="margin-right: 8px;"></i>Place Order Securely';
        }
    }
}

// Utility function to show payment messages
function showPaymentMessage(message, type = 'info') {
    // Remove existing payment messages
    const existingMessages = document.querySelectorAll('.payment-message');
    existingMessages.forEach(msg => msg.remove());

    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `payment-message alert ${type === 'success' ? 'success' : type === 'error' ? 'error' : 'info'}`;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        min-width: 300px;
        padding: 15px 20px;
        border-radius: 8px;
        font-weight: 500;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;

    // Set message content and style based on type
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-triangle',
        warning: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    };

    const colors = {
        success: { bg: '#d4edda', border: '#c3e6cb', text: '#155724' },
        error: { bg: '#f8d7da', border: '#f5c6cb', text: '#721c24' },
        warning: { bg: '#fff3cd', border: '#ffeaa7', text: '#856404' },
        info: { bg: '#d1ecf1', border: '#b8daff', text: '#0c5460' }
    };

    const style = colors[type] || colors.info;
    messageDiv.style.backgroundColor = style.bg;
    messageDiv.style.border = `1px solid ${style.border}`;
    messageDiv.style.color = style.text;

    messageDiv.innerHTML = `
        <i class="fa-solid ${icons[type] || icons.info}" style="margin-right: 10px;"></i>
        ${message}
    `;

    document.body.appendChild(messageDiv);

    // Animate in
    requestAnimationFrame(() => {
        messageDiv.style.transform = 'translateX(0)';
    });

    // Auto remove after 5 seconds
    setTimeout(() => {
        messageDiv.style.transform = 'translateX(100%)';
        setTimeout(() => messageDiv.remove(), 300);
    }, 5000);
}

// Create global payment handler instance
window.aadyaPaymentHandler = new AadyaPaymentHandler();
