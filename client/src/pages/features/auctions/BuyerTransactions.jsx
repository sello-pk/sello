import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  IoTrophyOutline as Trophy,
  IoWalletOutline as Wallet,
  IoShieldOutline as Shield,
  IoTimeOutline as Clock,
  IoCarSportOutline as Car,
  IoCashOutline as DollarSign,
  IoSearchOutline as Search,
  IoCheckmarkCircleOutline as CheckCircle,
  IoAlertCircleOutline as AlertTriangle,
  IoDocumentTextOutline as FileText,
  IoDownloadOutline as Download,
  IoChevronForward as ChevronRight,
  IoCardOutline as CreditCard,
  IoLockClosedOutline as Lock,
  IoStarOutline as Star
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

// Tabs Components
const Tabs = ({ defaultValue, value, onValueChange, children }) => {
  const [activeTab, setActiveTab] = useState(defaultValue || value);
  
  const handleChange = (tabValue) => {
    setActiveTab(tabValue);
    if (onValueChange) onValueChange(tabValue);
  };

  return (
    <div className="tabs">
      {React.Children.map(children, child => 
        React.cloneElement(child, { activeTab, onValueChange: handleChange })
      )}
    </div>
  );
};

const TabsList = ({ children, className = '', activeTab, onValueChange }) => {
  return (
    <div className={`inline-flex p-1 bg-slate-100 rounded-lg ${className}`}>
      {React.Children.map(children, child => 
        React.cloneElement(child, { activeTab, onValueChange })
      )}
    </div>
  );
};

const TabsTrigger = ({ value, children, className = '', activeTab, onValueChange }) => {
  const isActive = activeTab === value;
  
  return (
    <button
      className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
        isActive 
          ? 'bg-white text-slate-900 shadow-sm' 
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
      } ${className}`}
      onClick={() => onValueChange?.(value)}
    >
      {children}
    </button>
  );
};

const TabsContent = ({ value, children, className = '', activeTab }) => {
  if (activeTab !== value) return null;
  
  return (
    <div className={className}>
      {children}
    </div>
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

// ==================== MAIN COMPONENT ====================

export default function BuyerTransactions() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Mock user
    setUser({ id: 1, name: 'Ahmed Khan' });
  }, []);

  // Sample data
  const sampleWonCars = [
    { id: 1, make: 'Toyota', model: 'Corolla', year: 2022, final_price: 3850000, updated_date: new Date().toISOString() },
    { id: 2, make: 'Honda', model: 'Civic', year: 2021, final_price: 2950000, updated_date: new Date(Date.now() - 604800000).toISOString() }
  ];

  const sampleEscrow = [
    { id: 1, amount: 3850000, status: 'in_escrow', created_date: new Date().toISOString(), car_id: '1' },
    { id: 2, amount: 2950000, status: 'released_to_seller', created_date: new Date(Date.now() - 604800000).toISOString(), car_id: '2' }
  ];

  const sampleTokenPayments = [
    { id: 1, amount: 50000, status: 'completed', payment_method: 'jazzcash', created_date: new Date(Date.now() - 86400000).toISOString() },
    { id: 2, amount: 25000, status: 'completed', payment_method: 'easypaisa', created_date: new Date(Date.now() - 172800000).toISOString() }
  ];

  const disputes = [];

  const escrowStatusConfig = {
    pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: Clock },
    in_escrow: { label: 'In Escrow', color: 'bg-blue-100 text-blue-700', icon: Lock },
    released_to_seller: { label: 'Released', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
    refunded_to_buyer: { label: 'Refunded', color: 'bg-purple-100 text-purple-700', icon: Wallet },
    disputed: { label: 'Disputed', color: 'bg-red-100 text-red-700', icon: AlertTriangle }
  };

  const totalSpent = sampleEscrow.filter(e => e.status === 'released_to_seller').reduce((sum, e) => sum + e.amount, 0);
  const activeEscrow = sampleEscrow.filter(e => e.status === 'in_escrow').reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Transaction History</h1>
          <p className="text-slate-400">View your purchases, payments, and escrow status</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <Trophy className="w-8 h-8 text-amber-500 mb-2" />
              <p className="text-2xl font-bold text-slate-900">{sampleWonCars.length}</p>
              <p className="text-sm text-slate-500">Auctions Won</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <DollarSign className="w-8 h-8 text-emerald-500 mb-2" />
              <p className="text-2xl font-bold text-slate-900">PKR {(totalSpent / 1000000).toFixed(1)}M</p>
              <p className="text-sm text-slate-500">Total Spent</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Lock className="w-8 h-8 text-blue-500 mb-2" />
              <p className="text-2xl font-bold text-slate-900">PKR {(activeEscrow / 1000000).toFixed(1)}M</p>
              <p className="text-sm text-slate-500">In Escrow</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Shield className="w-8 h-8 text-purple-500 mb-2" />
              <p className="text-2xl font-bold text-slate-900">{disputes.length}</p>
              <p className="text-sm text-slate-500">Disputes</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="won">
          <TabsList className="mb-6">
            <TabsTrigger value="won">Won Auctions</TabsTrigger>
            <TabsTrigger value="escrow">Escrow Status</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="disputes">Disputes</TabsTrigger>
          </TabsList>

          {/* Won Auctions */}
          <TabsContent value="won">
            <Card>
              <CardHeader>
                <CardTitle>
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Won Auctions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sampleWonCars.map((car, i) => (
                    <motion.div 
                      key={car.id} 
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-14 bg-slate-200 rounded-lg overflow-hidden">
                          <img 
                            src="https://images.unsplash.com/photo-1590362891991-f776e747a588?w=200" 
                            alt="" 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{car.year} {car.make} {car.model}</p>
                          <p className="text-sm text-slate-500">Won on {new Date(car.updated_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-600">PKR {car.final_price?.toLocaleString()}</p>
                        <Link to={`/car/detail?id=${car.id}`}>
                          <Button variant="ghost" size="sm">
                            View <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Escrow Status */}
          <TabsContent value="escrow">
            <Card>
              <CardHeader>
                <CardTitle>
                  <Shield className="w-5 h-5 text-blue-500" />
                  Escrow Payments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sampleEscrow.map((escrow, i) => {
                    const status = escrowStatusConfig[escrow.status] || escrowStatusConfig.pending;
                    const StatusIcon = status.icon;
                    return (
                      <motion.div 
                        key={escrow.id} 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${status.color}`}>
                            <StatusIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">PKR {escrow.amount.toLocaleString()}</p>
                            <p className="text-sm text-slate-500">{new Date(escrow.created_date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <Badge className={status.color}>{status.label}</Badge>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments */}
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>
                  <CreditCard className="w-5 h-5 text-purple-500" />
                  Token Payments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sampleTokenPayments.map((payment, i) => (
                    <motion.div 
                      key={payment.id} 
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-emerald-100 text-emerald-700">
                          <Wallet className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">PKR {payment.amount.toLocaleString()}</p>
                          <p className="text-sm text-slate-500 capitalize">
                            {payment.payment_method?.replace('_', ' ')} • {new Date(payment.created_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-700">Completed</Badge>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Disputes */}
          <TabsContent value="disputes">
            <Card>
              <CardHeader>
                <CardTitle>
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  My Disputes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {disputes.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
                    <p className="text-slate-500">No disputes filed</p>
                    <p className="text-sm text-slate-400 mt-1">All your transactions are smooth!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {disputes.map((dispute) => (
                      <div key={dispute.id} className="p-4 bg-red-50 rounded-xl border border-red-200">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={dispute.status === 'open' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}>
                            {dispute.status?.replace('_', ' ')}
                          </Badge>
                          <span className="text-sm text-slate-500">{new Date(dispute.created_date).toLocaleDateString()}</span>
                        </div>
                        <p className="font-medium text-slate-900">{dispute.reason?.replace('_', ' ')}</p>
                        <p className="text-sm text-slate-500 mt-1">{dispute.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
