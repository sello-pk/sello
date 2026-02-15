import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  IoTrophyOutline as Trophy,
  IoTimeOutline as Clock,
  IoLocationOutline as MapPin,
  IoCallOutline as Phone,
  IoCardOutline as CreditCard,
  IoCheckmarkCircleOutline as CheckCircle,
  IoCalendarOutline as Calendar,
  IoCarSportOutline as Car,
  IoArrowForward as ArrowRight,
  IoDownloadOutline as Download,
  IoShareSocialOutline as Share2,
  IoMailOutline as Mail,
  IoAlertCircleOutline as AlertTriangle,
  IoBusinessOutline as Building2,
  IoPersonOutline as User,
  IoDocumentTextOutline as FileText
} from 'react-icons/io5';

// ==================== CUSTOM COMPONENTS ====================

// Badge Component
const Badge = ({ children, variant = 'default', className = '', ...props }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-900',
    secondary: 'bg-slate-100 text-slate-600',
    destructive: 'bg-red-100 text-red-600',
    success: 'bg-emerald-100 text-emerald-600',
    warning: 'bg-amber-100 text-amber-600',
    outline: 'border border-slate-200 text-slate-700 bg-transparent',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

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

// Card Components
const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 overflow-hidden ${className}`}>
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '' }) => {
  return (
    <div className={`p-6 border-b border-slate-100 ${className}`}>
      {children}
    </div>
  );
};

const CardTitle = ({ children, className = '' }) => {
  return (
    <h3 className={`text-lg font-semibold text-slate-900 flex items-center gap-2 ${className}`}>
      {children}
    </h3>
  );
};

const CardContent = ({ children, className = '' }) => {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
};

// Alert Components
const Alert = ({ children, className = '', variant = 'default' }) => {
  const variants = {
    default: 'bg-slate-50 border-slate-300',
    warning: 'bg-amber-50 border-amber-300',
    error: 'bg-red-50 border-red-300',
    success: 'bg-emerald-50 border-emerald-300',
  };

  return (
    <div className={`rounded-xl border p-4 ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};

const AlertDescription = ({ children, className = '' }) => {
  return (
    <div className={`text-sm ${className}`}>
      {children}
    </div>
  );
};

// ==================== MAIN COMPONENT ====================

export default function AuctionResult() {
  const [user, setUser] = useState(null);
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const carId = urlParams.get('car_id');

  useEffect(() => {
    // Mock user
    setUser({
      id: 1,
      full_name: 'Ahmed Khan',
      email: 'ahmed@example.com',
      phone: '0300-1234567'
    });
  }, []);

  // Sample data
  const displayCar = {
    id: carId || 'demo',
    make: 'Toyota',
    model: 'Corolla GLi',
    year: 2022,
    final_price: 3850000,
    winner_id: user?.id,
    images: ['https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800']
  };

  const paymentDeadline = new Date(Date.now() + 48 * 60 * 60 * 1000);

  const steps = [
    { title: 'Auction Won', status: 'completed', icon: Trophy },
    { title: 'Payment', status: 'current', icon: CreditCard },
    { title: 'Documentation', status: 'pending', icon: FileText },
    { title: 'Vehicle Pickup', status: 'pending', icon: Car }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Congratulations!
            </h1>
            <p className="text-emerald-100 text-lg">
              You've won the auction for
            </p>
            <p className="text-2xl font-bold text-white mt-2">
              {displayCar.year} {displayCar.make} {displayCar.model}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-200 p-6 mb-8"
        >
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={index}>
                <div className="flex flex-col items-center">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center mb-2
                    ${step.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                      step.status === 'current' ? 'bg-orange-100 text-orange-600 ring-2 ring-orange-500 ring-offset-2' :
                      'bg-slate-100 text-slate-400'}
                  `}>
                    {step.status === 'completed' ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className={`text-xs font-medium text-center ${
                    step.status === 'pending' ? 'text-slate-400' : 'text-slate-900'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 rounded ${
                    step.status === 'completed' ? 'bg-emerald-500' : 'bg-slate-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left - Car Details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <Card>
              <CardContent className="p-0">
                <div className="aspect-video rounded-t-xl overflow-hidden">
                  <img
                    src={displayCar.images?.[0] || 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800'}
                    alt={`${displayCar.make} ${displayCar.model}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">
                    {displayCar.year} {displayCar.make} {displayCar.model}
                  </h2>
                  
                  <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                    <p className="text-sm text-emerald-600 mb-1">Winning Bid</p>
                    <p className="text-3xl font-bold text-emerald-700">
                      PKR {displayCar.final_price?.toLocaleString() || '3,850,000'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Winner Details */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <User className="w-5 h-5 text-orange-500" />
                  Winner Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">Name</span>
                  <span className="font-medium">{user?.full_name || 'Ahmed Khan'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email</span>
                  <span className="font-medium">{user?.email || 'ahmed@example.com'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone</span>
                  <span className="font-medium">{user?.phone || '0300-1234567'}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right - Payment & Pickup */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Payment Deadline */}
            <Alert variant="warning" className="border-amber-300">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <AlertDescription className="text-amber-800">
                  <strong>Payment Required Within 24-48 Hours</strong>
                  <p className="text-sm mt-1">
                    Deadline: {paymentDeadline.toLocaleDateString()} at {paymentDeadline.toLocaleTimeString()}
                  </p>
                </AlertDescription>
              </div>
            </Alert>

            {/* Payment Card */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <CreditCard className="w-5 h-5 text-orange-500" />
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">Winning Bid</span>
                  <span className="font-medium">PKR {(displayCar.final_price || 3850000).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">Token Deposit (Deducted)</span>
                  <span className="font-medium text-emerald-600">-PKR 10,000</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-semibold text-slate-900">Amount Due</span>
                  <span className="font-bold text-xl text-slate-900">
                    PKR {((displayCar.final_price || 3850000) - 10000).toLocaleString()}
                  </span>
                </div>

                <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Proceed to Payment
                </Button>
              </CardContent>
            </Card>

            {/* Pickup Location */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <MapPin className="w-5 h-5 text-orange-500" />
                  Pickup Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-50 rounded-xl p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-slate-500 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-900">Okara Auto Auction Yard</p>
                      <p className="text-sm text-slate-500">
                        GT Road, Near Industrial Area<br />
                        Okara, Punjab, Pakistan
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">Mon-Sat: 9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">0300-1234567</span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Required Documents:</strong> Original CNIC, Payment Receipt, Auction Win Confirmation
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Support */}
            <Card className="bg-slate-900 text-white border-0">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3">Need Help?</h3>
                <p className="text-sm text-slate-400 mb-4">
                  Our support team is here to assist you with payment and pickup.
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 border-white/20 text-white hover:bg-white/10">
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                  <Button variant="outline" className="flex-1 border-white/20 text-white hover:bg-white/10">
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
