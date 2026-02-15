import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IoHeartOutline as Heart,
  IoHeartDislikeOutline as HeartOff,
  IoCarSportOutline as Car,
  IoTimeOutline as Clock,
  IoHammerOutline as Gavel,
  IoTrendingUpOutline as TrendingUp,
  IoEyeOutline as Eye,
  IoNotificationsOutline as Bell,
  IoTrashOutline as Trash2,
  IoScaleOutline as Scale,
  IoArrowForward as ArrowRight
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
    <h3 className={`text-lg font-semibold text-slate-900 ${className}`}>
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

// CountdownTimer Component
const CountdownTimer = ({ targetDate, size = 'default', showLabel = true }) => {
  return (
    <div className={`flex items-center gap-1 ${size === 'large' ? 'text-2xl' : 'text-sm'}`}>
      <div className="text-center">
        <span className="font-bold text-slate-900">02</span>
        {showLabel && <span className="text-xs text-slate-500 ml-1">d</span>}
      </div>
      <span className="text-slate-400">:</span>
      <div className="text-center">
        <span className="font-bold text-slate-900">12</span>
        {showLabel && <span className="text-xs text-slate-500 ml-1">h</span>}
      </div>
      <span className="text-slate-400">:</span>
      <div className="text-center">
        <span className="font-bold text-slate-900">45</span>
        {showLabel && <span className="text-xs text-slate-500 ml-1">m</span>}
      </div>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================

export default function Watchlist() {
  const [user, setUser] = useState(null);
  const [compareCars, setCompareCars] = useState([]);
  
  const toggleCompare = (carId) => {
    setCompareCars(prev => 
      prev.includes(carId) 
        ? prev.filter(id => id !== carId)
        : prev.length < 3 ? [...prev, carId] : prev
    );
  };

  useEffect(() => {
    // Mock user
    setUser({ 
      id: 1, 
      name: 'Ahmed Khan',
      watchlist: [1, 2, 3]
    });
  }, []);

  // Sample data
  const sampleCars = [
    { id: 1, make: 'Toyota', model: 'Corolla', year: 2022, current_bid: 3850000, starting_bid: 3200000, status: 'in_auction', condition: 'excellent', images: ['https://images.unsplash.com/photo-1590362891991-f776e747a588?w=600'] },
    { id: 2, make: 'Honda', model: 'Civic', year: 2021, current_bid: 2950000, starting_bid: 2500000, status: 'in_auction', condition: 'good', images: ['https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600'] },
    { id: 3, make: 'BMW', model: '3 Series', year: 2020, current_bid: 6500000, starting_bid: 6000000, status: 'in_auction', condition: 'excellent', images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600'] }
  ];

  const removeFromWatchlist = (carId) => {
    // Simulate removal
    console.log('Removed car:', carId);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <Heart className="w-8 h-8 text-red-400 fill-red-400" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">My Watchlist</h1>
                <p className="text-slate-400">{sampleCars.length} cars you're following</p>
              </div>
            </div>
            {compareCars.length >= 2 && (
              <Link to="/compare">
                <Button className="bg-[#FFA602] hover:bg-amber-500">
                  <Scale className="w-4 h-4 mr-2" />
                  Compare ({compareCars.length})
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {sampleCars.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Heart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">Your watchlist is empty</h3>
              <p className="text-slate-500 mb-6">Start following cars to get notified about bid updates</p>
              <Link to="/auctions/live">
                <Button className="bg-[#FFA602] hover:bg-amber-500">Browse Auctions</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {sampleCars.map((car, index) => (
                <motion.div
                  key={car.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative aspect-[16/10] bg-slate-100">
                      <img
                        src={car.images?.[0] || 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=600'}
                        alt={`${car.make} ${car.model}`}
                        className="w-full h-full object-cover"
                      />
                      <Badge className={`absolute top-3 left-3 ${car.status === 'in_auction' ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-700 text-white'}`}>
                        {car.status === 'in_auction' ? 'Live' : 'Upcoming'}
                      </Badge>
                      <div className="absolute top-3 right-3 flex gap-2">
                        <button
                          onClick={() => toggleCompare(car.id)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                            compareCars.includes(car.id) 
                              ? 'bg-[#FFA602] text-white' 
                              : 'bg-white/90 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <Scale className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => removeFromWatchlist(car.id)}
                          className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors"
                        >
                          <HeartOff className="w-5 h-5 text-red-500" />
                        </button>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg text-slate-900 mb-1">
                        {car.year} {car.make} {car.model}
                      </h3>
                      <Badge variant="outline" className="mb-3 capitalize">{car.condition}</Badge>
                      
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-xs text-slate-500">Current Bid</p>
                          <p className="text-lg font-bold text-[#FFA602]">PKR {(car.current_bid || car.starting_bid)?.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500">Time Left</p>
                          <div className="text-sm font-medium text-slate-700">
                            <CountdownTimer targetDate={new Date(Date.now() + 3600000 * 4)} size="small" showLabel={false} />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link to="/auctions/car-detail" className="flex-1">
                          <Button variant="outline" className="w-full">
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                        </Link>
                        <Link to="/auctions/car-detail" className="flex-1">
                          <Button className="w-full bg-[#FFA602] hover:bg-amber-500">
                            <Gavel className="w-4 h-4 mr-2" />
                            Bid Now
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Notification Tip */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Stay Updated</p>
                <p className="text-sm text-blue-700">You'll receive notifications when someone bids on your watched cars or when auctions are ending soon.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
