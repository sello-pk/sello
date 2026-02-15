import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  IoCarSportOutline as Car,
  IoAddOutline as Plus,
  IoTimeOutline as Clock,
  IoCheckmarkCircleOutline as CheckCircle,
  IoCloseCircleOutline as XCircle,
  IoCashOutline as DollarSign,
  IoTrendingUpOutline as TrendingUp,
  IoCalendarOutline as Calendar,
  IoEyeOutline as Eye,
  IoPencilOutline as Edit,
  IoAlertCircleOutline as AlertCircle,
  IoFlashOutline as Zap,
  IoChevronForward as ChevronRight,
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
    icon: "p-2",
  };

  const sizes = {
    default: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
    sm: "px-3 py-1.5 text-xs",
    icon: "p-2",
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

// Label Component
const Label = ({ children, className = '', ...props }) => {
  return (
    <label className={`text-sm font-medium text-slate-700 ${className}`} {...props}>
      {children}
    </label>
  );
};

// StatsCard Component
const StatsCard = ({ icon: Icon, value, label, color }) => {
  const colors = {
    orange: 'bg-orange-100 text-orange-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]} mb-3`}>
          <Icon className="w-5 h-5" />
        </div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </CardContent>
    </Card>
  );
};

// ==================== MAIN COMPONENT ====================

export default function SellerDashboard() {
  const [user, setUser] = useState(null);
  const [showAddCar, setShowAddCar] = useState(false);

  useEffect(() => {
    // Mock user
    setUser({ id: 1, name: 'Seller Ahmed' });
  }, []);

  const displayCars = [
    { id: 1, make: 'Toyota', model: 'Corolla', year: 2022, status: 'in_auction', current_bid: 3850000, starting_bid: 3200000, images: [] },
    { id: 2, make: 'Honda', model: 'Civic', year: 2021, status: 'pending_approval', starting_bid: 2800000, images: [] },
    { id: 3, make: 'Suzuki', model: 'Alto', year: 2023, status: 'sold', final_price: 1650000, starting_bid: 1400000, images: [] }
  ];

  const stats = [
    { icon: Car, value: displayCars.length, label: 'Total Vehicles', color: 'orange' },
    { icon: CheckCircle, value: displayCars.filter(c => c.status === 'sold').length, label: 'Sold', color: 'emerald' },
    { icon: Clock, value: displayCars.filter(c => c.status === 'in_auction').length, label: 'In Auction', color: 'blue' },
    { icon: DollarSign, value: `₨${(displayCars.filter(c => c.status === 'sold').reduce((sum, c) => sum + (c.final_price || 0), 0) / 1000000).toFixed(1)}M`, label: 'Total Sales', color: 'purple' }
  ];

  const statusConfig = {
    pending_approval: { label: 'Pending Approval', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
    approved: { label: 'Approved', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: CheckCircle },
    in_auction: { label: 'In Auction', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: TrendingUp },
    sold: { label: 'Sold', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: DollarSign },
    unsold: { label: 'Unsold', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: XCircle },
    withdrawn: { label: 'Withdrawn', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Seller Dashboard</h1>
              <p className="text-slate-400">Manage your vehicle listings</p>
            </div>
            <Button className="bg-gradient-to-r from-[#FFA602] to-amber-500 hover:from-amber-500 hover:to-[#FFA602]">
              <Plus className="w-5 h-5 mr-2" />
              Submit New Vehicle
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <StatsCard {...stat} />
            </motion.div>
          ))}
        </div>

        {/* Vehicle Listings */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Car className="w-5 h-5 text-[#FFA602]" />
              Your Vehicles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="mb-6">
                <TabsTrigger value="all">All ({displayCars.length})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({displayCars.filter(c => c.status === 'pending_approval').length})</TabsTrigger>
                <TabsTrigger value="active">In Auction ({displayCars.filter(c => c.status === 'in_auction').length})</TabsTrigger>
                <TabsTrigger value="sold">Sold ({displayCars.filter(c => c.status === 'sold').length})</TabsTrigger>
              </TabsList>

              {['all', 'pending', 'active', 'sold'].map((tab) => (
                <TabsContent key={tab} value={tab}>
                  <div className="space-y-4">
                    {displayCars
                      .filter(car => {
                        if (tab === 'all') return true;
                        if (tab === 'pending') return car.status === 'pending_approval';
                        if (tab === 'active') return car.status === 'in_auction';
                        if (tab === 'sold') return car.status === 'sold';
                        return true;
                      })
                      .map((car, index) => {
                        const status = statusConfig[car.status] || statusConfig.pending_approval;
                        const StatusIcon = status.icon;
                        
                        return (
                          <motion.div
                            key={car.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-shadow"
                          >
                            <div className="w-24 h-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={car.images?.[0] || `https://images.unsplash.com/photo-1590362891991-f776e747a588?w=200`}
                                alt={`${car.make} ${car.model}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-slate-900">
                                {car.year} {car.make} {car.model}
                              </h3>
                              <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                                <span>Starting: ₨{car.starting_bid?.toLocaleString()}</span>
                                {car.current_bid && (
                                  <span className="text-emerald-600 font-medium">
                                    Current: ₨{car.current_bid.toLocaleString()}
                                  </span>
                                )}
                                {car.final_price && (
                                  <span className="text-purple-600 font-medium">
                                    Sold: ₨{car.final_price.toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>

                            <Badge className={`${status.color} border`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {status.label}
                            </Badge>

                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon">
                                <Eye className="w-4 h-4" />
                              </Button>
                              {car.status === 'pending_approval' && (
                                <Button variant="ghost" size="icon">
                                  <Edit className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}

                    {displayCars.filter(car => {
                      if (tab === 'all') return true;
                      if (tab === 'pending') return car.status === 'pending_approval';
                      if (tab === 'active') return car.status === 'in_auction';
                      if (tab === 'sold') return car.status === 'sold';
                      return true;
                    }).length === 0 && (
                      <div className="text-center py-12">
                        <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">No vehicles in this category</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">How Vehicle Submission Works</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>1. Fill in vehicle details, upload photos, and complete self-inspection report</li>
                <li>2. Set starting bid, reserve price, and optional "Buy It Now" price</li>
                <li>3. Our team will verify the vehicle at Okara Auction Yard</li>
                <li>4. Once approved, your vehicle will be listed in the next available auction</li>
                <li>5. You'll receive notifications for new bids and when your vehicle sells</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
