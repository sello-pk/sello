import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IoChevronBack as ChevronLeft,
  IoChevronForward as ChevronRight,
  IoLocationOutline as MapPin,
  IoSpeedometerOutline as Gauge,
  IoCalendarOutline as Calendar,
  IoWaterOutline as Fuel,
  IoSettingsOutline as Settings2,
  IoDocumentTextOutline as FileText,
  IoShieldOutline as Shield,
  IoAlertCircleOutline as AlertTriangle,
  IoTimeOutline as Clock,
  IoCheckmarkCircleOutline as CheckCircle,
  IoCloseOutline as X,
  IoScanOutline as ZoomIn,
  IoCarSportOutline as Car,
  IoTrophyOutline as Award,
  IoInformationCircleOutline as Info,
  IoCalendarNumberOutline as CalendarDays,
  IoHeartOutline as Heart,
  IoHeartDislikeOutline as HeartOff,
  IoFlashOutline as Zap
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
    <div className={`flex ${className}`}>
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
      className={`px-4 py-2 text-sm font-medium transition-all ${
        isActive 
          ? 'bg-white text-slate-900 border-b-2 border-[#FFA602]' 
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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

// Alert Components
const Alert = ({ children, className = '', variant = 'default' }) => {
  const variants = {
    default: 'bg-slate-50 border-slate-300',
    warning: 'bg-amber-50 border-amber-200',
    error: 'bg-red-50 border-red-300',
    success: 'bg-emerald-50 border-emerald-200',
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

// CountdownTimer Component
const CountdownTimer = ({ targetDate, size = 'default' }) => {
  return (
    <div className={`flex items-center justify-center gap-2 ${size === 'large' ? 'text-3xl' : 'text-2xl'} font-bold text-white`}>
      <div className="text-center">
        <span>02</span>
        <span className="block text-xs font-normal text-slate-400">Days</span>
      </div>
      <span>:</span>
      <div className="text-center">
        <span>12</span>
        <span className="block text-xs font-normal text-slate-400">Hours</span>
      </div>
      <span>:</span>
      <div className="text-center">
        <span>45</span>
        <span className="block text-xs font-normal text-slate-400">Mins</span>
      </div>
    </div>
  );
};

// LiveBidPanel Component
const LiveBidPanel = ({ car, bids, currentUserId, currentUserName, onPlaceBid, isLoading }) => {
  const [bidAmount, setBidAmount] = useState((car.current_bid || car.starting_bid) + 50000);

  const formatPrice = (price) => `PKR ${price?.toLocaleString()}`;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-slate-500">Current Bid</span>
          <Badge className="bg-emerald-100 text-emerald-700">Live</Badge>
        </div>
        <p className="text-3xl font-bold text-slate-900 mb-2">{formatPrice(car.current_bid || car.starting_bid)}</p>
        {car.reserve_price && (
          <p className="text-sm text-slate-500">
            Reserve: {formatPrice(car.reserve_price)}
          </p>
        )}
      </div>

      <div className="p-6">
        <p className="text-sm font-medium text-slate-700 mb-3">Recent Bids</p>
        <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
          {bids.slice(0, 8).map((bid, index) => (
            <div key={bid.id || index} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <div>
                <p className="font-medium text-slate-900">{bid.bidder_name}</p>
                <p className="text-xs text-slate-500">
                  {new Date(bid.created_date).toLocaleTimeString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-[#FFA602]">{formatPrice(bid.amount)}</p>
                <Badge variant="secondary" className="text-xs">
                  {bid.bid_type === 'offline' ? 'Floor' : 'Online'}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(Number(e.target.value))}
              className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFA602]"
              step="50000"
              min={(car.current_bid || car.starting_bid) + 50000}
            />
            <Button 
              onClick={() => onPlaceBid(bidAmount)}
              disabled={isLoading}
              className="px-6"
            >
              Place Bid
            </Button>
          </div>
          <p className="text-xs text-slate-500 text-center">
            Minimum increment: PKR 50,000
          </p>
        </div>
      </div>
    </div>
  );
};

// InspectionBookingModal Component
const InspectionBookingModal = ({ car, open, onClose, user }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl max-w-md w-full p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-900">Book Inspection</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-slate-600 mb-4">
          Schedule a physical inspection for {car.year} {car.make} {car.model}
        </p>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-600 mb-1 block">Select Date</label>
            <input type="date" className="w-full px-4 py-2 border border-slate-200 rounded-lg" />
          </div>
          <div>
            <label className="text-sm text-slate-600 mb-1 block">Select Time</label>
            <select className="w-full px-4 py-2 border border-slate-200 rounded-lg">
              <option>10:00 AM</option>
              <option>11:00 AM</option>
              <option>12:00 PM</option>
              <option>2:00 PM</option>
              <option>3:00 PM</option>
              <option>4:00 PM</option>
            </select>
          </div>
          <Button className="w-full">Confirm Booking</Button>
        </div>
      </motion.div>
    </div>
  );
};

// ProxyBidForm Component
const ProxyBidForm = ({ open, onClose, car, user, currentBid }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl max-w-md w-full p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-900">Set Proxy Bid</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-slate-600 mb-4">
          Set maximum amount you're willing to bid. We'll bid automatically up to this amount.
        </p>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-600 mb-1 block">Maximum Bid Amount</label>
            <input
              type="number"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg"
              placeholder="Enter amount"
              defaultValue={currentBid + 100000}
              min={currentBid + 50000}
              step="50000"
            />
          </div>
          <Button className="w-full">Set Proxy Bid</Button>
          <p className="text-xs text-slate-500 text-center">
            You'll be notified if you're outbid
          </p>
        </div>
      </motion.div>
    </div>
  );
};

// CarValuationCard Component
const CarValuationCard = ({ car }) => {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200">
      <h4 className="font-semibold text-slate-900 mb-3">AI Valuation Estimate</h4>
      <p className="text-2xl font-bold text-purple-700 mb-2">
        PKR {(Math.random() * 1000000 + 3000000).toFixed(0)} - {(Math.random() * 500000 + 3500000).toFixed(0)}
      </p>
      <p className="text-xs text-slate-500">
        Based on market trends and similar auctions
      </p>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================

export default function CarDetail() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showProxyBidForm, setShowProxyBidForm] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [user, setUser] = useState(null);
  
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const carId = urlParams.get('id');

  useEffect(() => {
    // Mock user
    setUser({ id: 1, full_name: 'Ahmed Khan' });
  }, []);

  // Sample car data
  const displayCar = {
    id: carId || 'demo',
    make: 'Toyota',
    model: 'Corolla GLi',
    year: 2022,
    mileage: 35000,
    condition: 'excellent',
    color: 'White',
    engine_type: 'petrol',
    transmission: 'automatic',
    registration_city: 'Lahore',
    starting_bid: 3200000,
    current_bid: 3850000,
    reserve_price: 4000000,
    inspection_report: {
      engine: 'pass',
      body: 'pass',
      interior: 'pass',
      tires: 'minor_issues',
      notes: 'Minor wear on front tires, recommended replacement soon.'
    },
    images: [
      'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=1200',
      'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200',
      'https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=1200'
    ]
  };

  const displayAuction = {
    status: 'live',
    end_time: new Date(Date.now() + 3600000 * 5).toISOString()
  };

  const displayBids = [
    { id: 1, bidder_name: 'Ahmed K.', amount: 3850000, bid_type: 'online', created_date: new Date(Date.now() - 60000).toISOString() },
    { id: 2, bidder_name: 'Floor Bid', amount: 3800000, bid_type: 'offline', created_date: new Date(Date.now() - 180000).toISOString() },
    { id: 3, bidder_name: 'M. Hassan', amount: 3700000, bid_type: 'online', created_date: new Date(Date.now() - 300000).toISOString() },
    { id: 4, bidder_name: 'Floor Bid', amount: 3500000, bid_type: 'offline', created_date: new Date(Date.now() - 600000).toISOString() },
    { id: 5, bidder_name: 'Usman A.', amount: 3400000, bid_type: 'online', created_date: new Date(Date.now() - 900000).toISOString() }
  ];

  const inspectionStatusColors = {
    pass: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    minor_issues: 'bg-amber-100 text-amber-700 border-amber-200',
    major_issues: 'bg-red-100 text-red-700 border-red-200'
  };

  const formatPrice = (price) => `PKR ${price?.toLocaleString()}`;

  const specs = [
    { label: 'Make', value: displayCar.make, icon: Car },
    { label: 'Model', value: displayCar.model, icon: Award },
    { label: 'Year', value: displayCar.year, icon: Calendar },
    { label: 'Mileage', value: `${displayCar.mileage?.toLocaleString()} km`, icon: Gauge },
    { label: 'Engine', value: displayCar.engine_type, icon: Fuel },
    { label: 'Transmission', value: displayCar.transmission, icon: Settings2 },
    { label: 'Color', value: displayCar.color, icon: Info },
    { label: 'Registration', value: displayCar.registration_city, icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Back Button */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Link to="/auctions/live" className="inline-flex items-center text-slate-600 hover:text-slate-900">
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Auction
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-3 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-200">
              {/* Main Image */}
              <div className="relative aspect-[16/10] bg-slate-100">
                <img
                  src={displayCar.images?.[currentImageIndex] || displayCar.images?.[0]}
                  alt={`${displayCar.make} ${displayCar.model}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Navigation Arrows */}
                {displayCar.images?.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : displayCar.images.length - 1)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex(prev => prev < displayCar.images.length - 1 ? prev + 1 : 0)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}

                {/* Zoom Button */}
                <button
                  onClick={() => setShowGallery(true)}
                  className="absolute right-4 bottom-4 px-4 py-2 bg-white/90 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-white transition-colors"
                >
                  <ZoomIn className="w-4 h-4" />
                  View All Photos
                </button>

                {/* Location Badge */}
                <div className="absolute left-4 bottom-4">
                  <Badge className="bg-black/70 text-white border-0 backdrop-blur">
                    <MapPin className="w-3 h-3 mr-1" />
                    Okara Auction Yard
                  </Badge>
                </div>
              </div>

              {/* Thumbnails */}
              {displayCar.images?.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {displayCar.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                        currentImageIndex === index ? 'border-[#FFA602]' : 'border-transparent'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Car Title & Quick Info */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                    {displayCar.year} {displayCar.make} {displayCar.model}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Gauge className="w-4 h-4" />
                      {displayCar.mileage?.toLocaleString()} km
                    </span>
                    <span className="flex items-center gap-1">
                      <Fuel className="w-4 h-4" />
                      {displayCar.engine_type}
                    </span>
                    <span className="flex items-center gap-1">
                      <Settings2 className="w-4 h-4" />
                      {displayCar.transmission}
                    </span>
                  </div>
                </div>
                <Badge className={`text-sm capitalize ${
                  displayCar.condition === 'excellent' ? 'bg-emerald-100 text-emerald-700' :
                  displayCar.condition === 'good' ? 'bg-blue-100 text-blue-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {displayCar.condition} Condition
                </Badge>
              </div>

              {/* Reserve Price Indicator */}
              {displayCar.reserve_price && (
                <div className={`rounded-xl p-4 ${
                  (displayCar.current_bid || displayCar.starting_bid) >= displayCar.reserve_price
                    ? 'bg-emerald-50 border border-emerald-200'
                    : 'bg-amber-50 border border-amber-200'
                }`}>
                  <div className="flex items-center gap-2">
                    {(displayCar.current_bid || displayCar.starting_bid) >= displayCar.reserve_price ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                        <span className="font-medium text-emerald-700">Reserve price met</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                        <span className="font-medium text-amber-700">Reserve not yet met</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Tabs - Specs & Inspection */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <Tabs defaultValue="specs">
                <TabsList className="w-full border-b border-slate-200 bg-slate-50">
                  <TabsTrigger value="specs" className="flex-1 py-4">
                    Specifications
                  </TabsTrigger>
                  <TabsTrigger value="inspection" className="flex-1 py-4">
                    Inspection Report
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="specs" className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {specs.map((spec, index) => (
                      <div key={index} className="bg-slate-50 rounded-xl p-4">
                        <spec.icon className="w-5 h-5 text-[#FFA602] mb-2" />
                        <p className="text-xs text-slate-500 mb-1">{spec.label}</p>
                        <p className="font-semibold text-slate-900 capitalize">{spec.value}</p>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="inspection" className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {displayCar.inspection_report && Object.entries(displayCar.inspection_report)
                      .filter(([key]) => key !== 'notes')
                      .map(([key, value]) => (
                        <div key={key} className="text-center">
                          <div className={`rounded-xl p-4 border ${inspectionStatusColors[value]}`}>
                            {value === 'pass' ? (
                              <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                            ) : (
                              <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                            )}
                            <p className="text-xs uppercase tracking-wide mb-1">{key}</p>
                            <p className="font-semibold capitalize">{value.replace('_', ' ')}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                  
                  {displayCar.inspection_report?.notes && (
                    <Alert variant="warning">
                      <Info className="w-4 h-4 text-amber-600" />
                      <AlertDescription>
                        {displayCar.inspection_report.notes}
                      </AlertDescription>
                    </Alert>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Book Inspection & Buy Now */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 border-[#FFA602] text-[#FFA602] hover:bg-[#FFA602]/10"
                  onClick={() => setShowBookingModal(true)}
                >
                  <CalendarDays className="w-5 h-5 mr-2" />
                  Book Physical Inspection
                </Button>
                <Button
                  variant="outline"
                  className={`flex-1 ${isFollowing ? 'bg-red-50 border-red-300 text-red-600' : ''}`}
                  onClick={() => setIsFollowing(!isFollowing)}
                >
                  {isFollowing ? (
                    <>
                      <HeartOff className="w-5 h-5 mr-2" />
                      Unfollow
                    </>
                  ) : (
                    <>
                      <Heart className="w-5 h-5 mr-2" />
                      Follow Car
                    </>
                  )}
                </Button>
              </div>
              
              {/* Buy It Now */}
              {displayCar.buy_now_price && (
                <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-emerald-600 font-medium flex items-center gap-1">
                        <Zap className="w-4 h-4" />
                        Buy It Now Price
                      </p>
                      <p className="text-2xl font-bold text-emerald-700">
                        PKR {displayCar.buy_now_price.toLocaleString()}
                      </p>
                    </div>
                    <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700">
                      Buy Now
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Notice */}
            <Alert variant="warning" className="bg-amber-50 border-amber-200">
              <Clock className="w-4 h-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>Important:</strong> Winning bidder must complete payment within 24-48 hours and collect the vehicle from Okara Auction Yard.
              </AlertDescription>
            </Alert>
          </div>

          {/* Right Column - Bidding Panel */}
          <div className="lg:col-span-2">
            <div className="sticky top-20">
              {/* Timer */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 mb-6 text-center">
                <p className="text-slate-400 text-sm mb-3">Auction ends in</p>
                <CountdownTimer targetDate={displayAuction.end_time} />
              </div>

              {/* Bid Panel */}
              <LiveBidPanel
                car={displayCar}
                bids={displayBids}
                currentUserId={user?.id}
                currentUserName={user?.full_name}
                onPlaceBid={(amount) => console.log('Place bid:', amount)}
                isLoading={false}
              />

              {/* Proxy Bid Button */}
              {user && (
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    className="w-full border-[#FFA602] text-[#FFA602] hover:bg-[#FFA602]/10"
                    onClick={() => setShowProxyBidForm(true)}
                  >
                    Set Proxy Bid (Auto-Bid)
                  </Button>
                </div>
              )}

              {/* AI Valuation Card */}
              <div className="mt-6">
                <CarValuationCard car={displayCar} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inspection Booking Modal */}
      <InspectionBookingModal
        car={displayCar}
        open={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        user={user}
      />

      {/* Proxy Bid Form */}
      <ProxyBidForm
        open={showProxyBidForm}
        onClose={() => setShowProxyBidForm(false)}
        car={displayCar}
        user={user}
        currentBid={displayCar.current_bid || displayCar.starting_bid}
      />

      {/* Full Screen Gallery */}
      <AnimatePresence>
        {showGallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50 flex items-center justify-center"
          >
            <button
              onClick={() => setShowGallery(false)}
              className="absolute top-4 right-4 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            
            <img
              src={displayCar.images?.[currentImageIndex]}
              alt=""
              className="max-w-full max-h-full object-contain"
            />
            
            {displayCar.images?.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : displayCar.images.length - 1)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={() => setCurrentImageIndex(prev => prev < displayCar.images.length - 1 ? prev + 1 : 0)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </>
            )}

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {displayCar.images?.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    currentImageIndex === index ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
