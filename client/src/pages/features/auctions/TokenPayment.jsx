import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  IoCardOutline as CreditCard,
  IoPhonePortraitOutline as Smartphone,
  IoBusinessOutline as Building2,
  IoWalletOutline as Wallet,
  IoShieldOutline as Shield,
  IoCheckmarkCircleOutline as CheckCircle,
  IoInformationCircleOutline as Info,
  IoArrowForward as ArrowRight,
  IoRefreshOutline as RefreshCw,
  IoLockClosedOutline as Lock,
  IoCopyOutline as Copy,
  IoTimeOutline as Clock,
  IoAlertCircleOutline as AlertTriangle
} from 'react-icons/io5';

// ==================== CUSTOM COMPONENTS ====================

// Button Component
const Button = ({ children, variant = 'default', size = 'default', className = '', ...props }) => {
  const baseClasses = "inline-flex items-center justify-center font-medium transition-all duration-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    default: "bg-gradient-to-r from-[#FFA602] to-amber-500 text-white hover:from-amber-500 hover:to-[#FFA602] focus:ring-[#FFA602] shadow-lg shadow-[#FFA602]/30",
    outline: "border-2 border-slate-300 text-slate-700 hover:bg-slate-100 focus:ring-slate-500",
    ghost: "text-slate-700 hover:bg-slate-100 focus:ring-slate-500",
    white: "bg-white text-[#FFA602] hover:bg-white/90 focus:ring-white shadow-lg",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-600",
  };

  const sizes = {
    default: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
    sm: "px-3 py-1.5 text-xs",
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Input Component
const Input = ({ className = '', ...props }) => {
  return (
    <input
      className={`w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFA602] focus:border-transparent transition-all ${className}`}
      {...props}
    />
  );
};

// Label Component
const Label = ({ children, className = '', htmlFor, ...props }) => {
  return (
    <label htmlFor={htmlFor} className={`text-sm font-medium text-slate-700 ${className}`} {...props}>
      {children}
    </label>
  );
};

// RadioGroup Components
const RadioGroup = ({ value, onValueChange, children }) => {
  return (
    <div className="space-y-3">
      {React.Children.map(children, child => 
        React.cloneElement(child, { selectedValue: value, onValueChange })
      )}
    </div>
  );
};

const RadioGroupItem = ({ value, id, className = '', selectedValue, onValueChange }) => {
  return (
    <input
      type="radio"
      id={id}
      value={value}
      checked={selectedValue === value}
      onChange={(e) => onValueChange(e.target.value)}
      className={`w-4 h-4 text-[#FFA602] border-slate-300 focus:ring-[#FFA602] ${className}`}
    />
  );
};

// Alert Components
const Alert = ({ children, className = '', variant = 'default' }) => {
  const variants = {
    default: 'bg-slate-50 border-slate-300',
    warning: 'bg-amber-50 border-amber-200',
    error: 'bg-red-50 border-red-300',
    success: 'bg-emerald-50 border-emerald-200',
  };

  return (
    <div className={`rounded-xl border p-4 flex items-start gap-3 ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};

const AlertDescription = ({ children, className = '' }) => {
  return (
    <div className={`text-sm flex-1 ${className}`}>
      {children}
    </div>
  );
};

// ==================== MAIN COMPONENT ====================

export default function TokenPayment() {
  const [paymentMethod, setPaymentMethod] = useState('jazzcash');
  const [transactionId, setTransactionId] = useState('');
  const [user, setUser] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Mock user
    setUser({ id: 1, name: 'Ahmed Khan', token_balance: 0 });
  }, []);

  const paymentMethods = [
    {
      id: 'jazzcash',
      name: 'JazzCash',
      icon: Smartphone,
      color: 'bg-red-50 border-red-200 data-[state=checked]:border-red-500',
      iconColor: 'text-red-600',
      instructions: 'Send to: 0300-1234567',
      account: 'Okara Auto Auction'
    },
    {
      id: 'easypaisa',
      name: 'EasyPaisa',
      icon: Smartphone,
      color: 'bg-green-50 border-green-200 data-[state=checked]:border-green-500',
      iconColor: 'text-green-600',
      instructions: 'Send to: 0300-7654321',
      account: 'Okara Auto Auction'
    },
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      icon: Building2,
      color: 'bg-blue-50 border-blue-200 data-[state=checked]:border-blue-500',
      iconColor: 'text-blue-600',
      instructions: 'HBL Account: 1234567890',
      account: 'Okara Auto Auction Pvt Ltd'
    }
  ];

  const selectedMethod = paymentMethods.find(m => m.id === paymentMethod);

  const handlePayment = () => {
    setIsPending(true);
    // Simulate payment processing
    setTimeout(() => {
      setUser({ ...user, token_balance: 10000 });
      setIsPending(false);
      navigate('/auctions/dashboard');
    }, 2000);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-orange-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Token Payment
            </h1>
            <p className="text-slate-400">
              Secure your bidding access with a refundable deposit
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-5 gap-8">
          {/* Left Column - Payment Form */}
          <div className="md:col-span-3 space-y-6">
            {/* Amount Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-white/80">Token Amount</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Refundable</span>
              </div>
              <p className="text-4xl font-bold mb-2">PKR 10,000</p>
              <p className="text-sm text-white/70">
                This amount will be applied to your first winning bid
              </p>
            </motion.div>

            {/* Payment Methods */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-slate-200 p-6"
            >
              <h3 className="font-semibold text-slate-900 mb-4">Select Payment Method</h3>
              
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`
                        relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all
                        ${paymentMethod === method.id ? method.color : 'bg-white border-slate-200 hover:border-slate-300'}
                      `}
                      onClick={() => setPaymentMethod(method.id)}
                    >
                      <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${
                        paymentMethod === method.id ? method.color.split(' ')[0] : 'bg-slate-100'
                      }`}>
                        <method.icon className={`w-6 h-6 ${paymentMethod === method.id ? method.iconColor : 'text-slate-400'}`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{method.name}</p>
                        <p className="text-sm text-slate-500">{method.instructions}</p>
                      </div>
                      {paymentMethod === method.id && (
                        <CheckCircle className={`w-6 h-6 ${method.iconColor}`} />
                      )}
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </motion.div>

            {/* Payment Instructions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl border border-slate-200 p-6"
            >
              <h3 className="font-semibold text-slate-900 mb-4">Payment Instructions</h3>
              
              <div className="bg-slate-50 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-slate-500">Account Name</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900">{selectedMethod?.account}</span>
                    <button 
                      className="p-1 hover:bg-slate-200 rounded"
                      onClick={() => copyToClipboard(selectedMethod?.account)}
                    >
                      <Copy className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Account/Number</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900">
                      {selectedMethod?.instructions.split(': ')[1]}
                    </span>
                    <button 
                      className="p-1 hover:bg-slate-200 rounded"
                      onClick={() => copyToClipboard(selectedMethod?.instructions.split(': ')[1])}
                    >
                      <Copy className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="transaction_id">Transaction ID / Reference Number *</Label>
                  <Input
                    id="transaction_id"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter your transaction ID"
                    className="h-12 mt-1"
                  />
                  <p className="text-sm text-slate-500 mt-1">
                    Enter the transaction ID from your payment confirmation
                  </p>
                </div>
              </div>

              <Alert className="mt-4 bg-amber-50 border-amber-200">
                <Clock className="w-4 h-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  Verification typically takes 1-2 hours during business hours. You'll receive a notification once approved.
                </AlertDescription>
              </Alert>
            </motion.div>

            {/* Submit Button */}
            <Button
              onClick={handlePayment}
              disabled={!transactionId || isPending}
              className="w-full h-14 text-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/25"
            >
              {isPending ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Confirm Payment
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </div>

          {/* Right Column - Info */}
          <div className="md:col-span-2 space-y-6">
            {/* Wallet Balance */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Wallet className="w-6 h-6 text-orange-500" />
                <h3 className="font-semibold text-slate-900">Your Wallet</h3>
              </div>
              <div className="text-center py-4">
                <p className="text-3xl font-bold text-slate-900">
                  PKR {(user?.token_balance || 0).toLocaleString()}
                </p>
                <p className="text-sm text-slate-500">Current Balance</p>
              </div>
            </div>

            {/* Refund Policy */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Refund Policy</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2 text-slate-600">
                  <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5" />
                  Full refund if you don't win any auction
                </li>
                <li className="flex items-start gap-2 text-slate-600">
                  <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5" />
                  Token deducted from winning bid amount
                </li>
                <li className="flex items-start gap-2 text-slate-600">
                  <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5" />
                  Refunds processed within 5-7 business days
                </li>
                <li className="flex items-start gap-2 text-slate-600">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
                  No refund if auction won but payment not completed
                </li>
              </ul>
            </div>

            {/* Security */}
            <div className="bg-slate-900 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-3 mb-3">
                <Lock className="w-5 h-5 text-orange-400" />
                <span className="font-semibold">Secure Payment</span>
              </div>
              <p className="text-sm text-slate-400">
                Your payment information is encrypted and secure. We never store your financial details.
              </p>
            </div>

            {/* Need Help */}
            <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6">
              <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
              <p className="text-sm text-blue-700 mb-3">
                Contact our support team for payment assistance
              </p>
              <p className="text-sm font-medium text-blue-900">
                📞 0300-1234567
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
