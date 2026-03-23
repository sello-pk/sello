# Code base for Auction

***Pages***

## Home Page

```jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Gavel, ArrowRight, MapPin, Calendar, Users, Car, 
  TrendingUp, Play, Shield, Clock, ChevronRight,
  Zap, CheckCircle
} from 'lucide-react';
import CountdownTimer from '@/components/auction/CountdownTimer';
import CarCard from '@/components/auction/CarCard';
import TrustBadges from '@/components/auction/TrustBadges';
import AuctionStatusBadge from '@/components/auction/AuctionStatusBadge';
import FeaturedAuctions from '@/components/home/FeaturedAuctions';

export default function Home() {
  const { data: auctions = [] } = useQuery({
    queryKey: ['auctions'],
    queryFn: () => base44.entities.Auction.list('-start_time', 10)
  });

  const { data: cars = [] } = useQuery({
    queryKey: ['cars'],
    queryFn: () => base44.entities.Car.filter({ status: 'in_auction' }, '-current_bid', 6)
  });

  const liveAuction = auctions.find(a => a.status === 'live');
  const nextAuction = auctions.find(a => a.status === 'upcoming');

  const stats = [
    { value: '500+', label: 'Cars Sold', icon: Car },
    { value: '10K+', label: 'Active Bidders', icon: Users },
    { value: '₨2B+', label: 'Total Sales', icon: TrendingUp },
    { value: '48hrs', label: 'Quick Delivery', icon: Clock }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920"
            alt="Luxury car"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-slate-900/60" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {liveAuction && (
                <Badge className="bg-red-500 text-white border-0 mb-6 animate-pulse">
                  <Zap className="w-4 h-4 mr-1" />
                  Live Auction in Progress
                </Badge>
              )}
              
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Pakistan's Premier
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#FFA602] to-amber-500">
                  Car Auction
                </span>
              </h1>
              
              <p className="text-lg text-slate-300 mb-8 max-w-xl">
                Join Pakistan's most trusted hybrid auction platform. Bid online or visit our Okara yard. 
                Every second day, great cars find new owners.
              </p>

              <div className="flex items-center gap-2 text-slate-400 mb-8">
                <MapPin className="w-5 h-5 text-[#FFA602]" />
                <span>Okara Auction Yard, Punjab, Pakistan</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to={createPageUrl('LiveAuction')}>
                  <Button size="lg" className="bg-gradient-to-r from-[#FFA602] to-amber-500 hover:from-amber-500 hover:to-[#FFA602] text-white shadow-lg shadow-[#FFA602]/30 w-full sm:w-auto">
                    <Play className="w-5 h-5 mr-2" />
                    View Live Auction
                  </Button>
                </Link>
                <Link to={createPageUrl('Register')}>
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/20 hover:text-white bg-white/10 w-full sm:w-auto">
                    Register to Bid
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Right Content - Countdown */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                <div className="text-center mb-6">
                  <h3 className="text-white font-semibold text-xl mb-2">
                    {liveAuction ? 'Auction Ends In' : 'Next Auction Starts In'}
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Auctions held every second day
                  </p>
                </div>
                
                <CountdownTimer 
                  targetDate={liveAuction?.end_time || nextAuction?.start_time || new Date(Date.now() + 86400000 * 2)}
                  size="large"
                />

                <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-white">{cars.length || 15}</p>
                    <p className="text-xs text-slate-400">Cars Available</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">127</p>
                    <p className="text-xs text-slate-400">Active Bidders</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">₨8.5M</p>
                    <p className="text-xs text-slate-400">Highest Bid</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-y border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <stat.icon className="w-8 h-8 mx-auto mb-2 text-[#FFA602]" />
                <p className="text-2xl md:text-3xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Why Choose Us?</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Pakistan's most transparent and trusted car auction platform
          </p>
        </motion.div>
        <TrustBadges />
      </section>

      {/* Featured Auctions Section */}
      <FeaturedAuctions />

      {/* How It Works */}
      <section className="py-16 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">How It Works</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Simple, transparent, and secure bidding process
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Register', desc: 'Complete verification & pay refundable token', icon: Users },
              { step: '02', title: 'Browse', desc: 'Explore cars in current or upcoming auctions', icon: Car },
              { step: '03', title: 'Bid', desc: 'Place bids online or visit Okara yard', icon: Gavel },
              { step: '04', title: 'Win & Collect', desc: 'Pay within 48hrs & pickup from Okara', icon: CheckCircle }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15 }}
                className="relative text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-[#FFA602] to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#FFA602]/30">
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 text-6xl font-bold text-white/5">
                  {item.step}
                </span>
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-[#FFA602] to-amber-500 rounded-3xl p-12 shadow-2xl shadow-[#FFA602]/25"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Find Your Next Car?
            </h2>
            <p className="text-white/80 mb-8 text-lg">
              Join thousands of buyers who trust Okara Auto Auction
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={createPageUrl('Register')}>
                <Button size="lg" className="bg-white text-[#FFA602] hover:bg-white/90 shadow-lg w-full sm:w-auto">
                  Register Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to={createPageUrl('AuctionSchedule')}>
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/20 hover:text-white bg-white/10 w-full sm:w-auto">
                  <Calendar className="w-5 h-5 mr-2" />
                  View Schedule
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
```

```jsx
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Users, Car, Gavel, Calendar, Shield, AlertTriangle, CheckCircle, XCircle, 
  Clock, TrendingUp, DollarSign, Search, Plus, Eye, Edit, Settings, 
  Activity, Bell, RefreshCw, Ban, UserCheck, FileText, ClipboardCheck,
  CalendarDays, Star, MessageSquare, Zap, Brain, Award
} from 'lucide-react';
import StatsCard from '@/components/ui/StatsCard';
import BetManagement from '@/components/admin/BetManagement';
import RiskMonitor from '@/components/admin/RiskMonitor';
import PlatformFeeSettings from '@/components/admin/PlatformFeeSettings';
import EscrowManagement from '@/components/admin/EscrowManagement';
import VerificationReview from '@/components/admin/VerificationReview';

export default function AdminDashboard() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setAdminUser).catch(() => {});
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [showOfflineBidDialog, setShowOfflineBidDialog] = useState(false);
  const [showAuctionDialog, setShowAuctionDialog] = useState(false);
  const [vehicleStatusFilter, setVehicleStatusFilter] = useState('all');
  const [offlineBid, setOfflineBid] = useState({ car_id: '', amount: '', bidder_name: '' });
  const [newAuction, setNewAuction] = useState({ title: '', start_time: '', end_time: '' });

  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => base44.entities.User.list('-created_date', 100)
  });

  const { data: cars = [] } = useQuery({
    queryKey: ['allCars'],
    queryFn: () => base44.entities.Car.list('-created_date', 100)
  });

  const { data: auctions = [] } = useQuery({
    queryKey: ['allAuctions'],
    queryFn: () => base44.entities.Auction.list('-start_time', 50)
  });

  const { data: bids = [] } = useQuery({
    queryKey: ['allBids'],
    queryFn: () => base44.entities.Bid.list('-created_date', 200)
  });

  const { data: inspectionBookings = [] } = useQuery({
    queryKey: ['allBookings'],
    queryFn: () => base44.entities.InspectionBooking.list('-created_date', 100)
  });

  const { data: disputes = [] } = useQuery({
    queryKey: ['allDisputes'],
    queryFn: () => base44.entities.Dispute.list('-created_date', 50)
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['allReviews'],
    queryFn: () => base44.entities.SellerReview.list('-created_date', 100)
  });

  // Mutations
  const approveCarMutation = useMutation({
    mutationFn: ({ carId, status }) => base44.entities.Car.update(carId, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allCars'] })
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ userId, data }) => base44.entities.User.update(userId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allUsers'] })
  });

  const updateBookingMutation = useMutation({
    mutationFn: ({ bookingId, status }) => base44.entities.InspectionBooking.update(bookingId, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allBookings'] })
  });

  const createAuctionMutation = useMutation({
    mutationFn: (data) => base44.entities.Auction.create({ ...data, status: 'upcoming', total_cars: 0, total_bids: 0 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allAuctions'] });
      setShowAuctionDialog(false);
      setNewAuction({ title: '', start_time: '', end_time: '' });
    }
  });

  const updateAuctionMutation = useMutation({
    mutationFn: ({ auctionId, status }) => base44.entities.Auction.update(auctionId, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allAuctions'] })
  });

  const addOfflineBidMutation = useMutation({
    mutationFn: async (bidData) => {
      const bid = await base44.entities.Bid.create({ ...bidData, bid_type: 'offline', is_winning: false });
      await base44.entities.Car.update(bidData.car_id, { current_bid: bidData.amount });
      return bid;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allBids', 'allCars'] });
      setShowOfflineBidDialog(false);
      setOfflineBid({ car_id: '', amount: '', bidder_name: '' });
    }
  });

  const resolveDisputeMutation = useMutation({
    mutationFn: ({ disputeId, status, notes }) => base44.entities.Dispute.update(disputeId, { 
      status, 
      resolution_notes: notes,
      resolved_date: new Date().toISOString()
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allDisputes'] })
  });

  // Sample data fallbacks
  const sampleUsers = users.length > 0 ? users : [
    { id: 1, full_name: 'Ahmed Khan', email: 'ahmed@test.com', role: 'user', is_approved: true, is_banned: false },
    { id: 2, full_name: 'Hassan Ali', email: 'hassan@test.com', role: 'user', is_approved: false, is_banned: false },
    { id: 3, full_name: 'Usman', email: 'usman@test.com', role: 'admin', is_approved: true, is_banned: false }
  ];

  const sampleCars = cars.length > 0 ? cars : [
    { id: 1, make: 'Toyota', model: 'Corolla', year: 2022, status: 'in_auction', current_bid: 3850000, inspection_report: { engine: 'pass', body: 'minor_issues' } },
    { id: 2, make: 'Honda', model: 'Civic', year: 2021, status: 'pending_approval', starting_bid: 2800000, inspection_report: { engine: 'pass', body: 'pass' } },
    { id: 3, make: 'Suzuki', model: 'Alto', year: 2023, status: 'approved', starting_bid: 1400000 }
  ];

  const sampleAuctions = auctions.length > 0 ? auctions : [
    { id: 1, title: 'Auction #101', status: 'live', total_cars: 18, total_bids: 127, start_time: new Date().toISOString(), end_time: new Date(Date.now() + 3600000 * 6).toISOString() },
    { id: 2, title: 'Auction #102', status: 'upcoming', total_cars: 22, start_time: new Date(Date.now() + 86400000 * 2).toISOString() }
  ];

  const sampleBookings = inspectionBookings.length > 0 ? inspectionBookings : [
    { id: 1, car_details: '2022 Toyota Corolla', buyer_name: 'Ahmed', booking_date: '2024-02-10', booking_time: '10:00 AM', status: 'pending' },
    { id: 2, car_details: '2021 Honda Civic', buyer_name: 'Hassan', booking_date: '2024-02-11', booking_time: '2:00 PM', status: 'confirmed' }
  ];

  const stats = [
    { icon: Users, value: sampleUsers.length, label: 'Total Users', color: 'blue', trend: 12 },
    { icon: Car, value: sampleCars.length, label: 'Total Vehicles', color: 'orange', trend: 8 },
    { icon: Gavel, value: bids.length || 127, label: 'Total Bids', color: 'purple', trend: 25 },
    { icon: DollarSign, value: '₨8.5M', label: 'Total Sales', color: 'emerald', trend: 15 }
  ];

  const liveAuction = sampleAuctions.find(a => a.status === 'live');
  const carsInAuction = sampleCars.filter(c => c.status === 'in_auction');
  const pendingCars = sampleCars.filter(c => c.status === 'pending_approval');
  const openDisputes = disputes.filter(d => d.status === 'open' || d.status === 'under_review');

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <Shield className="w-7 h-7 text-orange-400" />
                Admin Control Panel
              </h1>
              <p className="text-slate-400">Okara Auto Auction Management</p>
            </div>
            <div className="flex items-center gap-4">
              {liveAuction && (
                <Badge className="bg-red-500 text-white border-0 animate-pulse">
                  <Activity className="w-4 h-4 mr-1" />
                  Live Auction Active
                </Badge>
              )}
              {openDisputes.length > 0 && (
                <Badge className="bg-amber-500 text-white border-0">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  {openDisputes.length} Open Disputes
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <StatsCard {...stat} />
            </motion.div>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="bg-white border border-slate-200 mb-6 flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
            <TabsTrigger value="auctions">Auctions</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="inspections">Inspections</TabsTrigger>
            <TabsTrigger value="disputes">Disputes</TabsTrigger>
            <TabsTrigger value="bids">Live Bids</TabsTrigger>
            <TabsTrigger value="betting"><Zap className="w-3 h-3 mr-1 inline" />Bets</TabsTrigger>
            <TabsTrigger value="risk"><Brain className="w-3 h-3 mr-1 inline" />Risk</TabsTrigger>
            <TabsTrigger value="escrow"><DollarSign className="w-3 h-3 mr-1 inline" />Escrow</TabsTrigger>
            <TabsTrigger value="fees"><Settings className="w-3 h-3 mr-1 inline" />Fees</TabsTrigger>
            <TabsTrigger value="verification"><Award className="w-3 h-3 mr-1 inline" />Verify</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Live Auction Monitor */}
              <Card className="border-red-200 bg-red-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <Activity className="w-5 h-5" />
                    Live Auction Monitor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {liveAuction ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{liveAuction.title}</span>
                        <Badge className="bg-red-500 text-white animate-pulse">LIVE</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-white rounded-lg p-3">
                          <p className="text-2xl font-bold">{liveAuction.total_cars}</p>
                          <p className="text-xs text-slate-500">Cars</p>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                          <p className="text-2xl font-bold">{liveAuction.total_bids}</p>
                          <p className="text-xs text-slate-500">Bids</p>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                          <p className="text-2xl font-bold">127</p>
                          <p className="text-xs text-slate-500">Bidders</p>
                        </div>
                      </div>
                      <Dialog open={showOfflineBidDialog} onOpenChange={setShowOfflineBidDialog}>
                        <DialogTrigger asChild>
                          <Button className="w-full bg-red-600 hover:bg-red-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Enter Offline Bid
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Enter Offline Bid</DialogTitle></DialogHeader>
                          <div className="space-y-4 py-4">
                            <div>
                              <Label>Select Vehicle</Label>
                              <Select value={offlineBid.car_id} onValueChange={(v) => setOfflineBid({ ...offlineBid, car_id: v })}>
                                <SelectTrigger className="mt-1"><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                                <SelectContent>
                                  {carsInAuction.map((car) => (
                                    <SelectItem key={car.id} value={car.id}>
                                      {car.year} {car.make} {car.model} - PKR {car.current_bid?.toLocaleString()}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Bidder Name</Label>
                              <Input value={offlineBid.bidder_name} onChange={(e) => setOfflineBid({ ...offlineBid, bidder_name: e.target.value })} placeholder="Floor Bidder Name" className="mt-1" />
                            </div>
                            <div>
                              <Label>Bid Amount (PKR)</Label>
                              <Input type="number" value={offlineBid.amount} onChange={(e) => setOfflineBid({ ...offlineBid, amount: e.target.value })} placeholder="Enter amount" className="mt-1" />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setShowOfflineBidDialog(false)}>Cancel</Button>
                            <Button onClick={() => addOfflineBidMutation.mutate({ car_id: offlineBid.car_id, amount: parseInt(offlineBid.amount), bidder_name: offlineBid.bidder_name || 'Floor Bid', auction_id: liveAuction.id })} disabled={!offlineBid.car_id || !offlineBid.amount} className="bg-red-600 hover:bg-red-700">
                              Submit Bid
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <Clock className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p>No live auction currently</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Pending Approvals */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-500" />
                    Pending Approvals ({pendingCars.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {pendingCars.slice(0, 5).map((car) => (
                        <div key={car.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                          <div>
                            <p className="font-medium">{car.year} {car.make} {car.model}</p>
                            <p className="text-sm text-slate-500">Starting: PKR {car.starting_bid?.toLocaleString()}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="border-red-300 text-red-600" onClick={() => approveCarMutation.mutate({ carId: car.id, status: 'withdrawn' })}>
                              <XCircle className="w-4 h-4" />
                            </Button>
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => approveCarMutation.mutate({ carId: car.id, status: 'approved' })}>
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>User Management</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sampleUsers.filter(u => u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase())).map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.full_name?.[0] || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold">{user.full_name}</p>
                          <p className="text-sm text-slate-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="capitalize">{user.role}</Badge>
                        {user.is_banned ? (
                          <Badge className="bg-red-100 text-red-700">Banned</Badge>
                        ) : user.is_approved ? (
                          <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>
                        ) : (
                          <Badge className="bg-amber-100 text-amber-700">Pending</Badge>
                        )}
                        <Select defaultValue={user.role} onValueChange={(role) => updateUserMutation.mutate({ userId: user.id, data: { role } })}>
                          <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        {!user.is_banned ? (
                          <Button size="sm" variant="outline" className="border-red-300 text-red-600" onClick={() => updateUserMutation.mutate({ userId: user.id, data: { is_banned: true } })}>
                            <Ban className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" className="border-emerald-300 text-emerald-600" onClick={() => updateUserMutation.mutate({ userId: user.id, data: { is_banned: false } })}>
                            <UserCheck className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vehicles Tab */}
          <TabsContent value="vehicles">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Vehicle Management</CardTitle>
                  <Select value={vehicleStatusFilter} onValueChange={setVehicleStatusFilter}>
                    <SelectTrigger className="w-40"><SelectValue placeholder="Filter status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending_approval">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="in_auction">In Auction</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sampleCars.filter(c => vehicleStatusFilter === 'all' || c.status === vehicleStatusFilter).map((car) => (
                    <div key={car.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-12 bg-slate-200 rounded-lg overflow-hidden">
                          <img src="https://images.unsplash.com/photo-1590362891991-f776e747a588?w=200" alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-semibold">{car.year} {car.make} {car.model}</p>
                          <p className="text-sm text-slate-500">{car.current_bid ? `Current: PKR ${car.current_bid.toLocaleString()}` : `Starting: PKR ${car.starting_bid?.toLocaleString()}`}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={car.status === 'pending_approval' ? 'bg-amber-100 text-amber-700' : car.status === 'in_auction' ? 'bg-emerald-100 text-emerald-700' : car.status === 'approved' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}>
                          {car.status?.replace('_', ' ')}
                        </Badge>
                        {car.status === 'pending_approval' && (
                          <>
                            <Button size="sm" variant="outline" className="border-red-300 text-red-600" onClick={() => approveCarMutation.mutate({ carId: car.id, status: 'withdrawn' })}>Reject</Button>
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => approveCarMutation.mutate({ carId: car.id, status: 'approved' })}>Approve</Button>
                          </>
                        )}
                        <Button variant="ghost" size="icon"><Eye className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Auctions Tab */}
          <TabsContent value="auctions">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Auction Management</CardTitle>
                  <Dialog open={showAuctionDialog} onOpenChange={setShowAuctionDialog}>
                    <DialogTrigger asChild>
                      <Button><Plus className="w-4 h-4 mr-2" />Create Auction</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Create New Auction</DialogTitle></DialogHeader>
                      <div className="space-y-4 py-4">
                        <div><Label>Auction Title</Label><Input value={newAuction.title} onChange={(e) => setNewAuction({ ...newAuction, title: e.target.value })} placeholder="e.g. Auction #103" className="mt-1" /></div>
                        <div><Label>Start Time</Label><Input type="datetime-local" value={newAuction.start_time} onChange={(e) => setNewAuction({ ...newAuction, start_time: e.target.value })} className="mt-1" /></div>
                        <div><Label>End Time</Label><Input type="datetime-local" value={newAuction.end_time} onChange={(e) => setNewAuction({ ...newAuction, end_time: e.target.value })} className="mt-1" /></div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAuctionDialog(false)}>Cancel</Button>
                        <Button onClick={() => createAuctionMutation.mutate(newAuction)} disabled={!newAuction.title || !newAuction.start_time}>Create Auction</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sampleAuctions.map((auction) => (
                    <div key={auction.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${auction.status === 'live' ? 'bg-red-500 animate-pulse' : auction.status === 'upcoming' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                        <div>
                          <p className="font-semibold">{auction.title}</p>
                          <p className="text-sm text-slate-500">{auction.start_time ? new Date(auction.start_time).toLocaleString() : auction.status}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-500">{auction.total_cars} cars</span>
                        <Badge className={auction.status === 'live' ? 'bg-red-100 text-red-700' : auction.status === 'upcoming' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}>{auction.status}</Badge>
                        <Select defaultValue={auction.status} onValueChange={(status) => updateAuctionMutation.mutate({ auctionId: auction.id, status })}>
                          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="upcoming">Upcoming</SelectItem>
                            <SelectItem value="live">Go Live</SelectItem>
                            <SelectItem value="completed">End</SelectItem>
                            <SelectItem value="cancelled">Cancel</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><CalendarDays className="w-5 h-5 text-blue-500" />Inspection Bookings</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sampleBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div>
                        <p className="font-semibold">{booking.car_details}</p>
                        <p className="text-sm text-slate-500">Buyer: {booking.buyer_name} • {booking.booking_date} at {booking.booking_time}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={booking.status === 'pending' ? 'bg-amber-100 text-amber-700' : booking.status === 'confirmed' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}>{booking.status}</Badge>
                        <Select defaultValue={booking.status} onValueChange={(status) => updateBookingMutation.mutate({ bookingId: booking.id, status })}>
                          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirm</SelectItem>
                            <SelectItem value="completed">Complete</SelectItem>
                            <SelectItem value="cancelled">Cancel</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inspections Tab */}
          <TabsContent value="inspections">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><ClipboardCheck className="w-5 h-5 text-emerald-500" />Seller Inspection Reports</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sampleCars.filter(c => c.inspection_report).map((car) => (
                    <div key={car.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-semibold">{car.year} {car.make} {car.model}</p>
                        <Badge className={car.status === 'pending_approval' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}>{car.status?.replace('_', ' ')}</Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {Object.entries(car.inspection_report || {}).filter(([k]) => k !== 'notes').map(([key, value]) => (
                          <div key={key} className={`text-center p-2 rounded-lg text-xs ${value === 'pass' ? 'bg-emerald-100 text-emerald-700' : value === 'minor_issues' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                            <p className="capitalize">{key}</p>
                            <p className="font-medium">{value?.replace('_', ' ')}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Disputes Tab */}
          <TabsContent value="disputes">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-red-500" />Dispute Resolution ({openDisputes.length} Open)</CardTitle></CardHeader>
              <CardContent>
                {disputes.length === 0 ? (
                  <div className="text-center py-12 text-slate-500"><CheckCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" /><p>No disputes at this time</p></div>
                ) : (
                  <div className="space-y-4">
                    {disputes.map((dispute) => (
                      <div key={dispute.id} className={`p-4 rounded-xl border ${dispute.status === 'open' ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <Badge className={dispute.status === 'open' ? 'bg-red-100 text-red-700' : dispute.status === 'under_review' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}>{dispute.status?.replace('_', ' ')}</Badge>
                            <p className="font-semibold mt-2">{dispute.reason?.replace('_', ' ')}</p>
                            <p className="text-sm text-slate-500 mt-1">{dispute.description}</p>
                          </div>
                          {(dispute.status === 'open' || dispute.status === 'under_review') && (
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => resolveDisputeMutation.mutate({ disputeId: dispute.id, status: 'resolved_seller_favor', notes: 'Resolved in seller favor' })}>Seller Favor</Button>
                              <Button size="sm" className="bg-blue-600" onClick={() => resolveDisputeMutation.mutate({ disputeId: dispute.id, status: 'resolved_buyer_favor', notes: 'Resolved in buyer favor' })}>Buyer Favor</Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Live Bids Tab */}
          <TabsContent value="bids">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5 text-red-500" />Live Bid Stream</CardTitle>
                  <div className="flex items-center gap-2 text-emerald-600"><RefreshCw className="w-4 h-4 animate-spin" />Auto-refreshing</div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[...Array(10)].map((_, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center gap-3">
                        <Badge className={i % 2 === 0 ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}>{i % 2 === 0 ? 'Online' : 'Offline'}</Badge>
                        <span className="font-medium">{['Ahmed K.', 'Floor Bid', 'Hassan A.', 'Floor Bid', 'Usman M.'][i % 5]}</span>
                        <span className="text-slate-500">bid on</span>
                        <span className="font-medium">{['Toyota Corolla', 'Honda Civic', 'Suzuki Alto'][i % 3]}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-emerald-600">PKR {(3000000 + i * 50000).toLocaleString()}</span>
                        <span className="text-sm text-slate-400">{i < 3 ? 'Just now' : `${i} mins ago`}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          {/* Betting Management Tab */}
          <TabsContent value="betting">
            <BetManagement adminUser={adminUser} />
          </TabsContent>

          {/* Risk Monitor Tab */}
          <TabsContent value="risk">
            <RiskMonitor adminUser={adminUser} />
          </TabsContent>

          {/* Escrow Management Tab */}
          <TabsContent value="escrow">
            <EscrowManagement adminUser={adminUser} />
          </TabsContent>

          {/* Platform Fee Settings Tab */}
          <TabsContent value="fees">
            <PlatformFeeSettings />
          </TabsContent>

          {/* Verification Review Tab */}
          <TabsContent value="verification">
            <VerificationReview adminUser={adminUser} />
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}
```

```jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Trophy, Clock, MapPin, Phone, CreditCard, CheckCircle,
  Calendar, Car, ArrowRight, Download, Share2, Mail,
  AlertTriangle, Building2, User, FileText
} from 'lucide-react';

export default function AuctionResult() {
  const [user, setUser] = useState(null);
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const carId = urlParams.get('car_id');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: car } = useQuery({
    queryKey: ['wonCar', carId],
    queryFn: () => carId ? base44.entities.Car.filter({ id: carId }) : null,
    select: (data) => data?.[0]
  });

  // Sample data
  const displayCar = car || {
    id: 'demo',
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
                <CardTitle className="text-lg flex items-center gap-2">
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
            <Alert className="bg-amber-50 border-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>Payment Required Within 24-48 Hours</strong>
                <p className="text-sm mt-1">
                  Deadline: {paymentDeadline.toLocaleDateString()} at {paymentDeadline.toLocaleTimeString()}
                </p>
              </AlertDescription>
            </Alert>

            {/* Payment Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
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
                <CardTitle className="text-lg flex items-center gap-2">
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
```

```jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, Clock, Car, Users, ArrowRight, 
  CalendarDays, MapPin, Gavel, ChevronRight, Filter
} from 'lucide-react';
import { format, addDays, isBefore, isAfter, isToday, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import CountdownTimer from '@/components/auction/CountdownTimer';
import AuctionStatusBadge from '@/components/auction/AuctionStatusBadge';

export default function AuctionSchedule() {
  const [filter, setFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');

  const { data: auctions = [], isLoading } = useQuery({
    queryKey: ['auctions'],
    queryFn: () => base44.entities.Auction.list('-start_time', 50)
  });

  // Generate sample auctions if none exist
  const displayAuctions = auctions.length > 0 ? auctions : [...Array(10)].map((_, i) => {
    const startDate = addDays(new Date(), i * 2 - 4);
    const endDate = addDays(startDate, 0);
    endDate.setHours(18, 0, 0);
    startDate.setHours(10, 0, 0);
    
    let status = 'upcoming';
    if (isBefore(endDate, new Date())) status = 'completed';
    else if (isBefore(startDate, new Date()) && isAfter(endDate, new Date())) status = 'live';

    return {
      id: i,
      title: `Auction #${100 + i}`,
      start_time: startDate.toISOString(),
      end_time: endDate.toISOString(),
      status,
      total_cars: 15 + Math.floor(Math.random() * 20),
      total_bids: 50 + Math.floor(Math.random() * 200),
      total_sold: status === 'completed' ? 10 + Math.floor(Math.random() * 15) : 0
    };
  });

  const filteredAuctions = displayAuctions.filter(a => {
    // Status filter
    if (filter !== 'all' && a.status !== filter) return false;
    
    // Date filter
    if (dateFilter === 'today') {
      if (!isToday(new Date(a.start_time))) return false;
    } else if (dateFilter === 'this_week') {
      const auctionDate = new Date(a.start_time);
      const now = new Date();
      const weekFromNow = addDays(now, 7);
      if (isBefore(auctionDate, now) || isAfter(auctionDate, weekFromNow)) return false;
    }
    
    // Month filter
    if (monthFilter !== 'all') {
      const auctionMonth = format(new Date(a.start_time), 'yyyy-MM');
      if (auctionMonth !== monthFilter) return false;
    }
    
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Badge className="bg-[#FFA602]/20 text-[#FFA602] border-[#FFA602]/30 mb-4">
              <CalendarDays className="w-4 h-4 mr-1" />
              Every Second Day
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Auction Schedule
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Our auctions run every second day. Plan your bidding strategy and never miss an opportunity.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Tabs value={filter} onValueChange={setFilter}>
              <TabsList className="bg-white border border-slate-200">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="live" className="text-red-600">Live</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <MapPin className="w-4 h-4" />
              All auctions at Okara Yard, Punjab
            </div>
          </div>
          
          {/* Date Filters */}
          <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl border border-slate-200">
            <Filter className="w-4 h-4 text-slate-500" />
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="this_week">This Week</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                <SelectItem value={format(new Date(), 'yyyy-MM')}>{format(new Date(), 'MMMM yyyy')}</SelectItem>
                <SelectItem value={format(addDays(new Date(), 30), 'yyyy-MM')}>{format(addDays(new Date(), 30), 'MMMM yyyy')}</SelectItem>
                <SelectItem value={format(addDays(new Date(), 60), 'yyyy-MM')}>{format(addDays(new Date(), 60), 'MMMM yyyy')}</SelectItem>
              </SelectContent>
            </Select>
            
            {(dateFilter !== 'all' || monthFilter !== 'all') && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => { setDateFilter('all'); setMonthFilter('all'); }}
                className="text-red-600 hover:text-red-700"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Auction List */}
        <div className="space-y-4">
          {filteredAuctions.map((auction, index) => (
            <motion.div
              key={auction.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className={`
                bg-white rounded-2xl border overflow-hidden
                ${auction.status === 'live' 
                  ? 'border-red-300 ring-2 ring-red-500/20 shadow-lg shadow-red-500/10' 
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-md'}
                transition-all duration-300
              `}>
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left - Date & Info */}
                    <div className="flex items-start gap-4">
                      {/* Date Box */}
                      <div className={`
                        w-20 h-20 rounded-xl flex flex-col items-center justify-center flex-shrink-0
                        ${auction.status === 'live' 
                          ? 'bg-gradient-to-br from-red-500 to-red-600 text-white' 
                          : 'bg-slate-100 text-slate-700'}
                      `}>
                        <span className="text-xs uppercase tracking-wider opacity-80">
                          {format(new Date(auction.start_time), 'MMM')}
                        </span>
                        <span className="text-3xl font-bold">
                          {format(new Date(auction.start_time), 'd')}
                        </span>
                        <span className="text-xs opacity-80">
                          {format(new Date(auction.start_time), 'EEE')}
                        </span>
                      </div>

                      {/* Info */}
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-slate-900">{auction.title}</h3>
                          <AuctionStatusBadge status={auction.status} />
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {format(new Date(auction.start_time), 'h:mm a')} - {format(new Date(auction.end_time), 'h:mm a')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Car className="w-4 h-4" />
                            {auction.total_cars} Cars
                          </span>
                          {auction.total_bids > 0 && (
                            <span className="flex items-center gap-1">
                              <Gavel className="w-4 h-4" />
                              {auction.total_bids} Bids
                            </span>
                          )}
                          {auction.status === 'completed' && (
                            <span className="flex items-center gap-1 text-emerald-600">
                              <Users className="w-4 h-4" />
                              {auction.total_sold} Sold
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right - Timer & CTA */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6">
                      {(auction.status === 'live' || auction.status === 'upcoming') && (
                        <div className="bg-slate-50 rounded-xl px-4 py-3">
                          <p className="text-xs text-slate-500 mb-1">
                            {auction.status === 'live' ? 'Ends in' : 'Starts in'}
                          </p>
                          <CountdownTimer 
                            targetDate={auction.status === 'live' ? auction.end_time : auction.start_time}
                            size="small"
                            showLabel={false}
                          />
                        </div>
                      )}
                      
                      <Link to={createPageUrl(`LiveAuction?auction_id=${auction.id}`)}>
                        <Button 
                          className={`
                            ${auction.status === 'live'
                              ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-red-500/25'
                              : auction.status === 'upcoming'
                              ? 'bg-gradient-to-r from-[#FFA602] to-amber-500 hover:from-amber-500 hover:to-[#FFA602] shadow-[#FFA602]/25'
                              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}
                            shadow-lg
                          `}
                        >
                          {auction.status === 'live' ? 'Enter Auction' : auction.status === 'upcoming' ? 'View Cars' : 'View Results'}
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Live Auction Footer */}
                {auction.status === 'live' && (
                  <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border-t border-red-200 px-6 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-red-600">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-sm font-medium">Bidding in progress</span>
                      </div>
                      <span className="text-sm text-slate-600">
                        127 active bidders
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredAuctions.length === 0 && (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No auctions found</h3>
            <p className="text-slate-500">Check back soon for more auctions</p>
          </div>
        )}

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="mt-12 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 text-center"
        >
          <h3 className="text-2xl font-bold text-white mb-3">Auction Every Second Day</h3>
          <p className="text-slate-400 max-w-2xl mx-auto mb-6">
            Our regular auction schedule means you never have to wait long. 
            Each auction features 15-30 inspected vehicles ready for bidding.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="w-4 h-4 text-[#FFA602]" />
              Auctions run 10:00 AM - 6:00 PM
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <MapPin className="w-4 h-4 text-[#FFA602]" />
              Okara Auction Yard, Punjab
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
```

```jsx
import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Wallet, Zap, TrendingUp, Trophy, Clock, AlertCircle,
  CheckCircle, XCircle, RefreshCw, ArrowUpRight, Loader2,
  Activity, DollarSign
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';

const betStatusConfig = {
  pending: { color: 'bg-amber-100 text-amber-700', icon: Clock, label: 'Pending' },
  active: { color: 'bg-blue-100 text-blue-700', icon: Activity, label: 'Active' },
  won: { color: 'bg-emerald-100 text-emerald-700', icon: Trophy, label: 'Won!' },
  lost: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Lost' },
  cancelled: { color: 'bg-slate-100 text-slate-600', icon: XCircle, label: 'Cancelled' },
  adjusted: { color: 'bg-purple-100 text-purple-700', icon: CheckCircle, label: 'Adjusted' }
};

export default function BettingInterface() {
  const [user, setUser] = useState(null);
  const [betAmount, setBetAmount] = useState('');
  const [realtimeBets, setRealtimeBets] = useState([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: wallets = [] } = useQuery({
    queryKey: ['wallet', user?.id],
    queryFn: () => base44.entities.Wallet.filter({ user_id: user.id }, '-created_date', 1),
    enabled: !!user?.id,
    refetchInterval: 5000
  });

  const { data: myBets = [], refetch: refetchBets } = useQuery({
    queryKey: ['myBets', user?.id],
    queryFn: () => base44.entities.Bet.filter({ user_id: user.id }, '-created_date', 50),
    enabled: !!user?.id
  });

  const { data: settings = [] } = useQuery({
    queryKey: ['bettingSettings'],
    queryFn: () => base44.entities.BettingSettings.list('-created_date', 1)
  });

  // Real-time bet subscriptions
  useEffect(() => {
    if (!user?.id) return;
    const unsub = base44.entities.Bet.subscribe((event) => {
      if (event.data?.user_id === user.id) {
        queryClient.invalidateQueries({ queryKey: ['myBets', user.id] });
        queryClient.invalidateQueries({ queryKey: ['wallet', user.id] });

        if (event.type === 'update') {
          const status = event.data?.status;
          if (status === 'won') toast.success(`🎉 Bet won! PKR ${event.data?.actual_payout?.toLocaleString()} credited!`);
          if (status === 'lost') toast.error('Bet lost. Better luck next time!');
          if (status === 'cancelled') toast.info('Your bet has been cancelled and refunded.');
          if (status === 'adjusted') toast.info('Your bet outcome has been adjusted by admin.');
        }

        setRealtimeBets(prev => {
          if (event.type === 'create') return [event.data, ...prev].slice(0, 5);
          if (event.type === 'update') return prev.map(b => b.id === event.id ? event.data : b);
          return prev;
        });
      }
    });
    return unsub;
  }, [user?.id, queryClient]);

  // Real-time wallet updates
  useEffect(() => {
    if (!user?.id) return;
    const unsub = base44.entities.Wallet.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ['wallet', user.id] });
    });
    return unsub;
  }, [user?.id, queryClient]);

  const wallet = wallets[0];
  const config = settings[0] || { multiplier: 2, min_bet: 100, max_bet: 100000, is_betting_enabled: true };
  const parsedAmount = parseFloat(betAmount) || 0;
  const potentialPayout = parsedAmount * (config.multiplier || 2);
  const canBet = parsedAmount >= (config.min_bet || 100)
    && parsedAmount <= (config.max_bet || 100000)
    && parsedAmount <= (wallet?.available_balance || 0)
    && config.is_betting_enabled
    && !wallet?.is_frozen;

  const placeBetMutation = useMutation({
    mutationFn: async () => {
      if (parsedAmount > wallet.available_balance) throw new Error('Insufficient balance');

      // Deduct from wallet first (lock balance)
      await base44.entities.Wallet.update(wallet.id, {
        available_balance: wallet.available_balance - parsedAmount,
        total_bet_amount: (wallet.total_bet_amount || 0) + parsedAmount
      });

      const bet = await base44.entities.Bet.create({
        user_id: user.id,
        user_name: user.full_name,
        wallet_id: wallet.id,
        bet_amount: parsedAmount,
        multiplier: config.multiplier || 2,
        betting_power: parsedAmount * (config.multiplier || 2),
        potential_payout: potentialPayout,
        actual_payout: 0,
        status: 'active',
        outcome: 'pending',
        admin_adjusted: false,
        idempotency_key: `${user.id}-${Date.now()}`
      });

      return bet;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myBets', user.id] });
      queryClient.invalidateQueries({ queryKey: ['wallet', user.id] });
      toast.success(`Bet placed! PKR ${parsedAmount.toLocaleString()} staked.`);
      setBetAmount('');
    },
    onError: (err) => toast.error(err.message || 'Failed to place bet')
  });

  const activeBets = myBets.filter(b => b.status === 'active' || b.status === 'pending');
  const resolvedBets = myBets.filter(b => !['active', 'pending'].includes(b.status));

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Zap className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 mb-4">Sign in to access the betting interface</p>
          <Button onClick={() => base44.auth.redirectToLogin()} className="bg-[#FFA602] hover:bg-amber-500">Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 py-4 px-4 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#FFA602]/20 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#FFA602]" />
            </div>
            <div>
              <h1 className="text-white font-bold">Betting Arena</h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-emerald-400 text-xs">Live</span>
              </div>
            </div>
          </div>
          {/* Live Wallet Balance */}
          <div className="flex items-center gap-4">
            <div className="bg-white/10 rounded-xl px-4 py-2">
              <p className="text-slate-400 text-xs">Wallet Balance</p>
              <AnimatePresence mode="wait">
                <motion.p
                  key={wallet?.available_balance}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-white font-bold text-lg"
                >
                  PKR {wallet?.available_balance?.toLocaleString() || '0'}
                </motion.p>
              </AnimatePresence>
            </div>
            <Link to={createPageUrl('WalletDashboard')}>
              <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                <ArrowUpRight className="w-4 h-4 mr-1" /> Top Up
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 grid lg:grid-cols-3 gap-6">
        {/* Bet Placement Panel */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#FFA602]" />
                Place a Bet
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!config.is_betting_enabled && (
                <Alert className="bg-red-900/30 border-red-700">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <AlertDescription className="text-red-300">Betting is currently disabled by admin.</AlertDescription>
                </Alert>
              )}
              {wallet?.is_frozen && (
                <Alert className="bg-red-900/30 border-red-700">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <AlertDescription className="text-red-300">Your wallet is frozen. Contact support.</AlertDescription>
                </Alert>
              )}
              {(!wallet || wallet.available_balance < (config.min_bet || 100)) && !wallet?.is_frozen && (
                <Alert className="bg-amber-900/30 border-amber-700">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <AlertDescription className="text-amber-300">
                    Insufficient balance. <Link to={createPageUrl('WalletDashboard')} className="underline">Deposit funds</Link> to bet.
                  </AlertDescription>
                </Alert>
              )}

              <div>
                <label className="text-slate-400 text-sm mb-1 block">Bet Amount (PKR)</label>
                <Input
                  type="number"
                  placeholder={`Min: ${config.min_bet?.toLocaleString()}`}
                  value={betAmount}
                  onChange={e => setBetAmount(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white text-lg h-12"
                  min={config.min_bet}
                  max={Math.min(config.max_bet, wallet?.available_balance || 0)}
                />
                {/* Quick amounts */}
                <div className="grid grid-cols-4 gap-1 mt-2">
                  {[500, 1000, 5000, 10000].map(amt => (
                    <button
                      key={amt}
                      onClick={() => setBetAmount(Math.min(amt, wallet?.available_balance || 0).toString())}
                      className="text-xs py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
                    >
                      {amt >= 1000 ? `${amt / 1000}K` : amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Multiplier Info */}
              <div className="bg-slate-700 rounded-xl p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Multiplier</span>
                  <span className="text-[#FFA602] font-bold">{config.multiplier || 2}x</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Stake</span>
                  <span className="text-white">PKR {parsedAmount.toLocaleString() || '0'}</span>
                </div>
                <div className="border-t border-slate-600 pt-2 flex justify-between">
                  <span className="text-slate-400 text-sm">Potential Win</span>
                  <span className="text-emerald-400 font-bold">PKR {potentialPayout.toLocaleString()}</span>
                </div>
              </div>

              <Button
                onClick={() => placeBetMutation.mutate()}
                disabled={!canBet || placeBetMutation.isPending}
                className="w-full h-12 bg-[#FFA602] hover:bg-amber-500 text-slate-900 font-bold text-lg"
              >
                {placeBetMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Place Bet
                  </>
                )}
              </Button>

              <p className="text-xs text-slate-500 text-center">
                Max bet: PKR {config.max_bet?.toLocaleString()} • Min: PKR {config.min_bet?.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          {/* Active Bets */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                Active Bets ({activeBets.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeBets.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-4">No active bets</p>
              ) : (
                <div className="space-y-2">
                  <AnimatePresence>
                    {activeBets.map(bet => (
                      <motion.div
                        key={bet.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex items-center justify-between p-3 bg-blue-900/30 border border-blue-700/50 rounded-lg"
                      >
                        <div>
                          <p className="text-white text-sm font-medium">PKR {bet.bet_amount?.toLocaleString()}</p>
                          <p className="text-blue-400 text-xs">→ PKR {bet.potential_payout?.toLocaleString()} if win</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Activity className="w-3 h-3 text-blue-400 animate-pulse" />
                          <span className="text-blue-400 text-xs">Active</span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* History & Live Feed */}
        <div className="lg:col-span-2 space-y-4">
          {/* Real-time Activity Feed */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />
                Live Updates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-32 overflow-hidden">
                <AnimatePresence>
                  {(realtimeBets.length > 0 ? realtimeBets : activeBets.slice(0, 3)).map((bet, i) => (
                    <motion.div
                      key={bet.id + '-' + i}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 p-2 bg-slate-700 rounded-lg"
                    >
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse flex-shrink-0" />
                      <p className="text-slate-300 text-xs">
                        Bet of <strong className="text-white">PKR {bet.bet_amount?.toLocaleString()}</strong> placed — status: <strong className="text-[#FFA602]">{bet.status}</strong>
                      </p>
                      <span className="text-slate-500 text-xs ml-auto">{format(new Date(bet.created_date), 'h:mm:ss a')}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {realtimeBets.length === 0 && activeBets.length === 0 && (
                  <p className="text-slate-500 text-xs text-center py-2">Waiting for activity...</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Bet History Tabs */}
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-4">
              <Tabs defaultValue="all">
                <TabsList className="bg-slate-700 border-0">
                  <TabsTrigger value="all" className="data-[state=active]:bg-[#FFA602] data-[state=active]:text-slate-900 text-slate-400">All Bets</TabsTrigger>
                  <TabsTrigger value="won" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-slate-400">Won</TabsTrigger>
                  <TabsTrigger value="lost" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-slate-400">Lost</TabsTrigger>
                </TabsList>

                {['all', 'won', 'lost'].map(tab => (
                  <TabsContent key={tab} value={tab} className="mt-4">
                    <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                      <AnimatePresence>
                        {myBets
                          .filter(b => tab === 'all' ? true : b.status === tab || b.outcome === tab)
                          .map((bet, i) => {
                            const cfg = betStatusConfig[bet.status] || betStatusConfig.pending;
                            const Icon = cfg.icon;
                            return (
                              <motion.div
                                key={bet.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}
                                className={`flex items-center justify-between p-3 rounded-xl border ${
                                  bet.status === 'won' ? 'bg-emerald-900/20 border-emerald-700/40' :
                                  bet.status === 'lost' ? 'bg-red-900/20 border-red-700/40' :
                                  bet.status === 'adjusted' ? 'bg-purple-900/20 border-purple-700/40' :
                                  'bg-slate-700/50 border-slate-600/40'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${cfg.color}`}>
                                    <Icon className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <p className="text-white font-medium text-sm">PKR {bet.bet_amount?.toLocaleString()}</p>
                                    <p className="text-slate-400 text-xs">
                                      {format(new Date(bet.created_date), 'MMM d, h:mm a')}
                                      {bet.admin_adjusted && ' • Admin adjusted'}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  {bet.actual_payout > 0 && (
                                    <p className="text-emerald-400 font-bold text-sm">+PKR {bet.actual_payout?.toLocaleString()}</p>
                                  )}
                                  <Badge className={cfg.color + ' text-xs'}>{cfg.label}</Badge>
                                </div>
                              </motion.div>
                            );
                          })}
                      </AnimatePresence>
                      {myBets.filter(b => tab === 'all' ? true : b.status === tab || b.outcome === tab).length === 0 && (
                        <div className="text-center py-8 text-slate-500">
                          <Trophy className="w-10 h-10 mx-auto mb-2 opacity-30" />
                          <p className="text-sm">No {tab === 'all' ? '' : tab} bets yet</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
```

```jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Gavel, Wallet, Trophy, Calendar, Bell, Clock,
  ArrowRight, Car, ChevronRight, TrendingUp, AlertCircle,
  CheckCircle, Eye, DollarSign, Timer
} from 'lucide-react';
import CountdownTimer from '@/components/auction/CountdownTimer';
import StatsCard from '@/components/ui/StatsCard';

export default function BuyerDashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: myBids = [] } = useQuery({
    queryKey: ['myBids', user?.id],
    queryFn: () => user?.id ? base44.entities.Bid.filter({ bidder_id: user.id }, '-created_date', 50) : [],
    enabled: !!user?.id
  });

  const { data: wonCars = [] } = useQuery({
    queryKey: ['wonCars', user?.id],
    queryFn: () => user?.id ? base44.entities.Car.filter({ winner_id: user.id }, '-updated_date', 50) : [],
    enabled: !!user?.id
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => user?.id ? base44.entities.Notification.filter({ user_id: user.id }, '-created_date', 20) : [],
    enabled: !!user?.id
  });

  const { data: auctions = [] } = useQuery({
    queryKey: ['upcomingAuctions'],
    queryFn: () => base44.entities.Auction.filter({ status: 'upcoming' }, 'start_time', 5)
  });

  // Sample data
  const sampleBids = myBids.length > 0 ? myBids : [
    { id: 1, amount: 3850000, is_winning: true, created_date: new Date().toISOString(), car_id: '1' },
    { id: 2, amount: 2700000, is_winning: false, created_date: new Date(Date.now() - 86400000).toISOString(), car_id: '2' },
    { id: 3, amount: 1950000, is_winning: true, created_date: new Date(Date.now() - 172800000).toISOString(), car_id: '3' }
  ];

  const sampleNotifications = notifications.length > 0 ? notifications : [
    { id: 1, title: 'Outbid Alert', message: 'You have been outbid on Toyota Corolla 2022', type: 'outbid', is_read: false, created_date: new Date().toISOString() },
    { id: 2, title: 'Auction Starting', message: 'Auction #102 starts in 1 hour', type: 'auction_reminder', is_read: false, created_date: new Date(Date.now() - 3600000).toISOString() },
    { id: 3, title: 'Verification Complete', message: 'Your CNIC has been verified successfully', type: 'verification', is_read: true, created_date: new Date(Date.now() - 86400000).toISOString() }
  ];

  const sampleWonCars = wonCars.length > 0 ? wonCars : [];

  const stats = [
    { icon: Gavel, value: sampleBids.length, label: 'Active Bids', color: 'orange' },
    { icon: Trophy, value: sampleWonCars.length || user?.auctions_won || 0, label: 'Auctions Won', color: 'emerald' },
    { icon: Wallet, value: `₨${((user?.token_balance || 10000) / 1000).toFixed(0)}K`, label: 'Token Balance', color: 'blue' },
    { icon: TrendingUp, value: user?.total_bids || sampleBids.length, label: 'Total Bids', color: 'purple' }
  ];

  const notificationIcons = {
    outbid: { icon: AlertCircle, color: 'text-amber-600 bg-amber-100' },
    auction_won: { icon: Trophy, color: 'text-emerald-600 bg-emerald-100' },
    auction_reminder: { icon: Calendar, color: 'text-blue-600 bg-blue-100' },
    payment_due: { icon: Clock, color: 'text-red-600 bg-red-100' },
    verification: { icon: CheckCircle, color: 'text-emerald-600 bg-emerald-100' },
    general: { icon: Bell, color: 'text-slate-600 bg-slate-100' }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Welcome back, {user?.full_name?.split(' ')[0] || 'Bidder'}
              </h1>
              <p className="text-slate-400">Manage your bids and auctions</p>
            </div>
            <Link to={createPageUrl('LiveAuction')}>
              <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                <Gavel className="w-5 h-5 mr-2" />
                Enter Live Auction
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Bids */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Gavel className="w-5 h-5 text-orange-500" />
                  Your Active Bids
                </CardTitle>
                <Link to={createPageUrl('LiveAuction')}>
                  <Button variant="ghost" size="sm">
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {sampleBids.length > 0 ? (
                  <div className="space-y-3">
                    {sampleBids.map((bid, index) => (
                      <motion.div
                        key={bid.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`
                          flex items-center justify-between p-4 rounded-xl border
                          ${bid.is_winning 
                            ? 'bg-emerald-50 border-emerald-200' 
                            : 'bg-slate-50 border-slate-200'}
                        `}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-12 bg-slate-200 rounded-lg overflow-hidden">
                            <img 
                              src={`https://images.unsplash.com/photo-${1590362891991 + index}-f776e747a588?w=200`}
                              alt="Car"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">
                              {['Toyota Corolla 2022', 'Honda Civic 2021', 'Suzuki Alto 2023'][index]}
                            </p>
                            <p className="text-sm text-slate-500">
                              Bid: PKR {bid.amount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {bid.is_winning ? (
                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Highest Bid
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Outbid
                            </Badge>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Gavel className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No active bids yet</p>
                    <Link to={createPageUrl('LiveAuction')}>
                      <Button className="mt-4" variant="outline">
                        Browse Auctions
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Auctions Won */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Auctions Won
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sampleWonCars.length > 0 ? (
                  <div className="space-y-3">
                    {sampleWonCars.map((car) => (
                      <div key={car.id} className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <div>
                          <p className="font-medium text-slate-900">{car.make} {car.model} {car.year}</p>
                          <p className="text-sm text-slate-500">
                            Final Price: PKR {car.final_price?.toLocaleString()}
                          </p>
                        </div>
                        <Badge className="bg-amber-500 text-white">
                          Payment Due
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No auctions won yet</p>
                    <p className="text-sm text-slate-400 mt-1">Keep bidding to win your dream car!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Auctions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  Upcoming Auctions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(auctions.length > 0 ? auctions.slice(0, 3) : [
                    { id: 1, title: 'Auction #102', start_time: new Date(Date.now() + 86400000 * 2).toISOString(), total_cars: 18 },
                    { id: 2, title: 'Auction #103', start_time: new Date(Date.now() + 86400000 * 4).toISOString(), total_cars: 22 }
                  ]).map((auction) => (
                    <div key={auction.id} className="p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-slate-900">{auction.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {auction.total_cars} Cars
                        </Badge>
                      </div>
                      <CountdownTimer targetDate={auction.start_time} size="small" showLabel={false} />
                    </div>
                  ))}
                </div>
                <Link to={createPageUrl('AuctionSchedule')}>
                  <Button variant="outline" className="w-full mt-4">
                    View Full Schedule
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Bell className="w-5 h-5 text-orange-500" />
                  Notifications
                  {sampleNotifications.filter(n => !n.is_read).length > 0 && (
                    <Badge className="bg-red-500 text-white ml-auto">
                      {sampleNotifications.filter(n => !n.is_read).length}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sampleNotifications.slice(0, 5).map((notif) => {
                    const { icon: Icon, color } = notificationIcons[notif.type] || notificationIcons.general;
                    return (
                      <div
                        key={notif.id}
                        className={`flex items-start gap-3 p-3 rounded-xl ${notif.is_read ? 'bg-slate-50' : 'bg-orange-50 border border-orange-200'}`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${notif.is_read ? 'text-slate-700' : 'text-slate-900'}`}>
                            {notif.title}
                          </p>
                          <p className="text-xs text-slate-500 truncate">{notif.message}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Token Balance */}
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Wallet className="w-6 h-6 text-orange-400" />
                  <span className="font-semibold">Token Balance</span>
                </div>
                <p className="text-3xl font-bold mb-2">
                  PKR {(user?.token_balance || 10000).toLocaleString()}
                </p>
                <p className="text-sm text-slate-400 mb-4">Available for bidding</p>
                <Link to={createPageUrl('TokenPayment')}>
                  <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                    Add More Tokens
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
```

```jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Trophy, Wallet, Shield, Clock, Car, DollarSign, Search,
  CheckCircle, AlertTriangle, FileText, Download, ChevronRight,
  CreditCard, Lock, Star
} from 'lucide-react';

export default function BuyerTransactions() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: wonCars = [] } = useQuery({
    queryKey: ['wonCars', user?.id],
    queryFn: () => user?.id ? base44.entities.Car.filter({ winner_id: user.id }, '-updated_date', 50) : [],
    enabled: !!user?.id
  });

  const { data: escrowPayments = [] } = useQuery({
    queryKey: ['escrowPayments', user?.id],
    queryFn: () => user?.id ? base44.entities.EscrowPayment.filter({ buyer_id: user.id }, '-created_date', 50) : [],
    enabled: !!user?.id
  });

  const { data: tokenPayments = [] } = useQuery({
    queryKey: ['tokenPayments', user?.id],
    queryFn: () => user?.id ? base44.entities.TokenPayment.filter({ user_id: user.id }, '-created_date', 50) : [],
    enabled: !!user?.id
  });

  const { data: disputes = [] } = useQuery({
    queryKey: ['myDisputes', user?.id],
    queryFn: () => user?.id ? base44.entities.Dispute.filter({ buyer_id: user.id }, '-created_date', 20) : [],
    enabled: !!user?.id
  });

  // Sample data
  const sampleWonCars = wonCars.length > 0 ? wonCars : [
    { id: 1, make: 'Toyota', model: 'Corolla', year: 2022, final_price: 3850000, updated_date: new Date().toISOString() },
    { id: 2, make: 'Honda', model: 'Civic', year: 2021, final_price: 2950000, updated_date: new Date(Date.now() - 604800000).toISOString() }
  ];

  const sampleEscrow = escrowPayments.length > 0 ? escrowPayments : [
    { id: 1, amount: 3850000, status: 'in_escrow', created_date: new Date().toISOString(), car_id: '1' },
    { id: 2, amount: 2950000, status: 'released_to_seller', created_date: new Date(Date.now() - 604800000).toISOString(), car_id: '2' }
  ];

  const sampleTokenPayments = tokenPayments.length > 0 ? tokenPayments : [
    { id: 1, amount: 50000, status: 'completed', payment_method: 'jazzcash', created_date: new Date(Date.now() - 86400000).toISOString() },
    { id: 2, amount: 25000, status: 'completed', payment_method: 'easypaisa', created_date: new Date(Date.now() - 172800000).toISOString() }
  ];

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
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Won Auctions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sampleWonCars.map((car, i) => (
                    <motion.div key={car.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-14 bg-slate-200 rounded-lg overflow-hidden">
                          <img src="https://images.unsplash.com/photo-1590362891991-f776e747a588?w=200" alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{car.year} {car.make} {car.model}</p>
                          <p className="text-sm text-slate-500">Won on {new Date(car.updated_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-600">PKR {car.final_price?.toLocaleString()}</p>
                        <Link to={createPageUrl('CarDetail') + `?id=${car.id}`}>
                          <Button variant="ghost" size="sm">View <ChevronRight className="w-4 h-4 ml-1" /></Button>
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
                <CardTitle className="flex items-center gap-2">
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
                      <motion.div key={escrow.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
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
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-purple-500" />
                  Token Payments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sampleTokenPayments.map((payment, i) => (
                    <motion.div key={payment.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-emerald-100 text-emerald-700">
                          <Wallet className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">PKR {payment.amount.toLocaleString()}</p>
                          <p className="text-sm text-slate-500 capitalize">{payment.payment_method?.replace('_', ' ')} • {new Date(payment.created_date).toLocaleDateString()}</p>
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
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  My Disputes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {disputes.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
                    <p className="text-slate-500">No disputes filed</p>
                    <p className="text-sm text-slate-400">All your transactions are smooth!</p>
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
```

```jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ChevronLeft, ChevronRight, MapPin, Gauge, Calendar, Fuel,
  Settings2, FileText, Shield, AlertTriangle, Clock, CheckCircle,
  X, ZoomIn, Car, Award, Info, CalendarDays, Heart, HeartOff, Zap
} from 'lucide-react';
import CountdownTimer from '@/components/auction/CountdownTimer';
import LiveBidPanel from '@/components/auction/LiveBidPanel';
import InspectionBookingModal from '@/components/booking/InspectionBookingModal';
import CarValuationCard from '@/components/valuation/CarValuationCard';
import ProxyBidForm from '@/components/bidding/ProxyBidForm';
import BidPriceChart from '@/components/auction/BidPriceChart';

export default function CarDetail() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showProxyBidForm, setShowProxyBidForm] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [user, setUser] = useState(null);
  const [extensionSeconds, setExtensionSeconds] = useState(0);
  const [sellerExtendOpen, setSellerExtendOpen] = useState(false);
  
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const carId = urlParams.get('id');

  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: car } = useQuery({
    queryKey: ['car', carId],
    queryFn: () => carId ? base44.entities.Car.filter({ id: carId }) : null,
    select: (data) => data?.[0]
  });

  const { data: bids = [] } = useQuery({
    queryKey: ['bids', carId],
    queryFn: () => carId ? base44.entities.Bid.filter({ car_id: carId }, '-created_date', 50) : [],
    refetchInterval: 5000
  });

  const { data: auction } = useQuery({
    queryKey: ['auction', car?.auction_id],
    queryFn: () => car?.auction_id ? base44.entities.Auction.filter({ id: car.auction_id }) : null,
    select: (data) => data?.[0],
    enabled: !!car?.auction_id
  });

  const { data: platformSettings = [] } = useQuery({
    queryKey: ['platformSettings'],
    queryFn: () => base44.entities.PlatformSettings.list()
  });
  const settings = platformSettings[0] || { timer_extension_enabled: true, timer_extension_trigger_seconds: 30, timer_extension_base_seconds: 60, timer_extension_per_bidder_seconds: 10 };

  const handleAntiSnipeExtension = async (currentEndTime) => {
    if (!settings.timer_extension_enabled) return;
    const timeLeft = (new Date(currentEndTime) - Date.now()) / 1000;
    if (timeLeft > 0 && timeLeft <= (settings.timer_extension_trigger_seconds || 30)) {
      const activeBidders = [...new Set(bids.slice(0, 20).map(b => b.bidder_id))].length;
      const lastBidAmt = bids[0]?.amount || 0;
      const prevBidAmt = bids[1]?.amount || lastBidAmt;
      const bidIncrement = lastBidAmt - prevBidAmt;
      const dynamicExtra = (activeBidders * (settings.timer_extension_per_bidder_seconds || 10)) + (bidIncrement > 100000 ? 30 : 0);
      const totalExtension = (settings.timer_extension_base_seconds || 60) + dynamicExtra;
      setExtensionSeconds(s => s + totalExtension);
    }
  };

  const bidMutation = useMutation({
    mutationFn: async (amount) => {
      const bid = await base44.entities.Bid.create({
        car_id: carId,
        auction_id: car?.auction_id,
        bidder_id: user?.id,
        bidder_name: user?.full_name,
        amount,
        bid_type: 'online'
      });
      await base44.entities.Car.update(carId, { current_bid: amount });
      await handleAntiSnipeExtension(displayAuction.end_time);
      if (car?.auction_id) {
        await base44.entities.AuctionExtension.create({
          car_id: carId,
          auction_id: car.auction_id,
          extension_type: 'auto_snipe',
          extended_by_seconds: settings.timer_extension_base_seconds || 60,
          active_bidders_at_time: [...new Set(bids.slice(0, 20).map(b => b.bidder_id))].length,
          bid_increment_at_time: amount - (bids[0]?.amount || 0),
          triggered_by: user?.id
        });
      }
      return bid;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bids', carId] });
      queryClient.invalidateQueries({ queryKey: ['car', carId] });
    }
  });

  const sellerExtendMutation = useMutation({
    mutationFn: async (extraMinutes) => {
      await base44.entities.AuctionExtension.create({
        car_id: carId,
        auction_id: car?.auction_id,
        extension_type: 'manual_seller',
        extended_by_seconds: extraMinutes * 60,
        triggered_by: user?.id
      });
      setExtensionSeconds(s => s + extraMinutes * 60);
    },
    onSuccess: () => setSellerExtendOpen(false)
  });

  // Sample car data
  const displayCar = car || {
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

  const baseEndTime = auction?.end_time || new Date(Date.now() + 3600000 * 5).toISOString();
  const effectiveEndTime = extensionSeconds > 0
    ? new Date(new Date(baseEndTime).getTime() + extensionSeconds * 1000).toISOString()
    : baseEndTime;

  const displayAuction = auction ? { ...auction, end_time: effectiveEndTime } : {
    status: 'live',
    end_time: effectiveEndTime
  };

  const displayBids = bids.length > 0 ? bids : [
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
          <Link to={createPageUrl('LiveAuction')} className="inline-flex items-center text-slate-600 hover:text-slate-900">
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
                <TabsList className="w-full rounded-none border-b border-slate-200 bg-slate-50 p-0 h-auto">
                  <TabsTrigger value="specs" className="flex-1 rounded-none data-[state=active]:bg-white py-4">
                    Specifications
                  </TabsTrigger>
                  <TabsTrigger value="inspection" className="flex-1 rounded-none data-[state=active]:bg-white py-4">
                    Inspection Report
                  </TabsTrigger>
                  <TabsTrigger value="chart" className="flex-1 rounded-none data-[state=active]:bg-white py-4">
                    Price Chart
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="specs" className="p-6 mt-0">
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

                <TabsContent value="chart" className="p-4 mt-0">
                  <BidPriceChart bids={displayBids} car={displayCar} />
                </TabsContent>

                <TabsContent value="inspection" className="p-6 mt-0">
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
                    <Alert>
                      <Info className="w-4 h-4" />
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
            <Alert className="bg-amber-50 border-amber-200">
              <Clock className="w-4 h-4 text-[#FFA602]" />
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
                <CountdownTimer targetDate={displayAuction.end_time} size="default" />
                {extensionSeconds > 0 && (
                  <div className="mt-3 px-3 py-1.5 bg-amber-500/20 rounded-lg border border-amber-500/30">
                    <p className="text-amber-400 text-xs font-medium">
                      ⏱ Extended by {Math.round(extensionSeconds / 60)} min (anti-snipe)
                    </p>
                  </div>
                )}
                {/* Seller manual extend option */}
                {user && displayCar.seller_id === user.id && displayAuction.status === 'live' && (
                  <div className="mt-3">
                    {!sellerExtendOpen ? (
                      <Button variant="outline" size="sm" className="text-white border-white/30 hover:bg-white/10 text-xs w-full" onClick={() => setSellerExtendOpen(true)}>
                        Extend or Close Auction
                      </Button>
                    ) : (
                      <div className="space-y-2 mt-2">
                        <p className="text-white/70 text-xs">Extend auction by:</p>
                        <div className="flex gap-2 flex-wrap justify-center">
                          {[5, 10, 30].map(min => (
                            <Button key={min} size="sm" variant="outline" className="text-white border-white/30 hover:bg-white/10 text-xs" onClick={() => sellerExtendMutation.mutate(min)} disabled={sellerExtendMutation.isPending}>
                              +{min}m
                            </Button>
                          ))}
                        </div>
                        <Button size="sm" variant="ghost" className="text-red-400 text-xs w-full" onClick={() => setSellerExtendOpen(false)}>
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bid Panel */}
              <LiveBidPanel
                car={displayCar}
                bids={displayBids}
                currentUserId={user?.id}
                currentUserName={user?.full_name}
                onPlaceBid={(amount) => bidMutation.mutateAsync(amount)}
                isLoading={bidMutation.isPending}
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
```

```jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Scale, Car, X, Plus, Check, Minus, Gavel, TrendingUp, Gauge, Calendar,
  Fuel, Settings2, MapPin, DollarSign, Star
} from 'lucide-react';

export default function CompareVehicles() {
  const [selectedCars, setSelectedCars] = useState([null, null, null]);
  
  const { data: cars = [] } = useQuery({
    queryKey: ['allCars'],
    queryFn: () => base44.entities.Car.filter({ status: 'in_auction' }, '-current_bid', 100)
  });

  const displayCars = cars.length > 0 ? cars : [
    { id: '1', make: 'Toyota', model: 'Corolla', year: 2022, mileage: 35000, condition: 'excellent', engine_type: 'petrol', transmission: 'automatic', current_bid: 3850000, starting_bid: 3200000, registration_city: 'Lahore', color: 'White', images: ['https://images.unsplash.com/photo-1590362891991-f776e747a588?w=600'] },
    { id: '2', make: 'Honda', model: 'Civic', year: 2021, mileage: 42000, condition: 'good', engine_type: 'petrol', transmission: 'automatic', current_bid: 4200000, starting_bid: 3800000, registration_city: 'Karachi', color: 'Black', images: ['https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600'] },
    { id: '3', make: 'BMW', model: '3 Series', year: 2020, mileage: 28000, condition: 'excellent', engine_type: 'petrol', transmission: 'automatic', current_bid: 6500000, starting_bid: 6000000, registration_city: 'Islamabad', color: 'Blue', images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600'] },
    { id: '4', make: 'Mercedes', model: 'C-Class', year: 2021, mileage: 22000, condition: 'excellent', engine_type: 'petrol', transmission: 'automatic', current_bid: 8500000, starting_bid: 7800000, registration_city: 'Lahore', color: 'Silver', images: ['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600'] }
  ];

  const addCar = (index, carId) => {
    const newSelected = [...selectedCars];
    newSelected[index] = displayCars.find(c => c.id === carId);
    setSelectedCars(newSelected);
  };

  const removeCar = (index) => {
    const newSelected = [...selectedCars];
    newSelected[index] = null;
    setSelectedCars(newSelected);
  };

  const compareSpecs = [
    { label: 'Year', key: 'year', icon: Calendar, format: (v) => v, category: 'Basic' },
    { label: 'Mileage', key: 'mileage', icon: Gauge, format: (v) => `${v?.toLocaleString()} km`, category: 'Basic' },
    { label: 'Condition', key: 'condition', icon: Star, format: (v) => v?.charAt(0).toUpperCase() + v?.slice(1), category: 'Basic' },
    { label: 'Engine', key: 'engine_type', icon: Fuel, format: (v) => v?.charAt(0).toUpperCase() + v?.slice(1), category: 'Technical' },
    { label: 'Transmission', key: 'transmission', icon: Settings2, format: (v) => v?.charAt(0).toUpperCase() + v?.slice(1), category: 'Technical' },
    { label: 'Color', key: 'color', icon: Car, format: (v) => v, category: 'Technical' },
    { label: 'Registration', key: 'registration_city', icon: MapPin, format: (v) => v, category: 'Technical' },
    { label: 'Starting Bid', key: 'starting_bid', icon: DollarSign, format: (v) => `PKR ${v?.toLocaleString()}`, category: 'Pricing' },
    { label: 'Current Bid', key: 'current_bid', icon: Gavel, format: (v) => `PKR ${v?.toLocaleString()}`, category: 'Pricing' },
  ];

  const inspectionKeys = ['engine', 'body', 'interior', 'tires', 'ac', 'electrical', 'suspension', 'brakes'];

  const getHighlight = (key, cars) => {
    const values = cars.filter(c => c).map(c => c[key]);
    if (values.length < 2) return {};
    
    if (key === 'year') {
      const max = Math.max(...values);
      return { best: max, type: 'max' };
    }
    if (key === 'mileage') {
      const min = Math.min(...values);
      return { best: min, type: 'min' };
    }
    if (key === 'current_bid' || key === 'starting_bid') {
      const min = Math.min(...values);
      return { best: min, type: 'min' };
    }
    if (key === 'condition') {
      const ranks = { excellent: 4, good: 3, fair: 2, needs_repair: 1 };
      const max = Math.max(...values.map(v => ranks[v] || 0));
      const bestCondition = Object.keys(ranks).find(k => ranks[k] === max);
      return { best: bestCondition, type: 'exact' };
    }
    return {};
  };

  const selectedCount = selectedCars.filter(c => c).length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Scale className="w-8 h-8 text-[#FFA602]" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Compare Vehicles</h1>
              <p className="text-slate-400">Select up to 3 cars to compare side-by-side</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Car Selection */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {selectedCars.map((car, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <Card className={`h-full ${car ? 'border-[#FFA602]' : 'border-dashed border-2'}`}>
                <CardContent className="p-4">
                  {car ? (
                    <div>
                      <div className="relative">
                        <img src={car.images?.[0] || 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=400'} alt="" className="w-full h-40 object-cover rounded-lg" />
                        <button onClick={() => removeCar(index)} className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                          <X className="w-4 h-4 text-slate-600" />
                        </button>
                      </div>
                      <h3 className="font-semibold text-slate-900 mt-3">{car.year} {car.make} {car.model}</h3>
                      <p className="text-lg font-bold text-[#FFA602]">PKR {car.current_bid?.toLocaleString()}</p>
                    </div>
                  ) : (
                    <div className="h-56 flex flex-col items-center justify-center">
                      <Car className="w-12 h-12 text-slate-300 mb-3" />
                      <p className="text-slate-500 mb-3">Select a car</p>
                      <Select onValueChange={(v) => addCar(index, v)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Choose vehicle" />
                        </SelectTrigger>
                        <SelectContent>
                          {displayCars.filter(c => !selectedCars.find(s => s?.id === c.id)).map(c => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.year} {c.make} {c.model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Comparison Table */}
        {selectedCount >= 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#FFA602]" />
                Specifications Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-slate-500">Specification</th>
                      {selectedCars.map((car, i) => car && (
                        <th key={i} className="text-center py-3 px-4 font-semibold text-slate-900">
                          {car.make} {car.model}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {compareSpecs.map((spec) => {
                      const highlight = getHighlight(spec.key, selectedCars);
                      return (
                        <tr key={spec.key} className="border-b hover:bg-slate-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2 text-slate-600">
                              <spec.icon className="w-4 h-4" />
                              {spec.label}
                            </div>
                          </td>
                          {selectedCars.map((car, i) => car && (
                            <td key={i} className="text-center py-4 px-4">
                              <span className={`
                                inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium
                                ${(highlight.type === 'exact' && car[spec.key] === highlight.best) ||
                                  (highlight.type === 'max' && car[spec.key] === highlight.best) ||
                                  (highlight.type === 'min' && car[spec.key] === highlight.best)
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'text-slate-700'}
                              `}>
                                {(highlight.type === 'exact' && car[spec.key] === highlight.best) ||
                                  (highlight.type === 'max' && car[spec.key] === highlight.best) ||
                                  (highlight.type === 'min' && car[spec.key] === highlight.best)
                                  ? <Check className="w-3 h-3" />
                                  : null}
                                {spec.format(car[spec.key])}
                              </span>
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Inspection Report Section */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#FFA602]" />
                  Condition Report
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4 font-medium text-slate-500 text-sm">Component</th>
                        {selectedCars.map((car, i) => car && (
                          <th key={i} className="text-center py-2 px-4 font-semibold text-slate-900 text-sm">
                            {car.make} {car.model}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {inspectionKeys.map((key) => (
                        <tr key={key} className="border-b hover:bg-slate-50">
                          <td className="py-3 px-4 text-slate-600 capitalize text-sm">{key}</td>
                          {selectedCars.map((car, i) => {
                            const val = car?.inspection_report?.[key];
                            return car ? (
                              <td key={i} className="text-center py-3 px-4">
                                {val ? (
                                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                    val === 'pass' ? 'bg-emerald-100 text-emerald-700' :
                                    val === 'minor_issues' ? 'bg-amber-100 text-amber-700' :
                                    val === 'major_issues' ? 'bg-red-100 text-red-700' :
                                    'bg-slate-100 text-slate-500'
                                  }`}>
                                    {val === 'pass' ? '✓' : val === 'major_issues' ? '✗' : '~'} {val.replace('_', ' ')}
                                  </span>
                                ) : (
                                  <span className="text-slate-300 text-xs">N/A</span>
                                )}
                              </td>
                            ) : null;
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t">
                {selectedCars.filter(c => c).map((car, i) => (
                  <Link key={i} to={createPageUrl('CarDetail') + `?id=${car.id}`}>
                    <Button className="bg-[#FFA602] hover:bg-amber-500">
                      <Gavel className="w-4 h-4 mr-2" />
                      Bid on {car.make} {car.model}
                    </Button>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedCount < 2 && (
          <Card className="py-12">
            <CardContent className="text-center">
              <Scale className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">Select at least 2 cars to compare</h3>
              <p className="text-slate-500">Choose vehicles from the dropdowns above</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
```

```jsx
import React, { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search, Grid3X3, List, MapPin, Zap, Car, Clock, SortAsc, RefreshCw, X, Scale
} from 'lucide-react';
import CountdownTimer from '@/components/auction/CountdownTimer';
import CarCard from '@/components/auction/CarCard';
import AdvancedFilters from '@/components/search/AdvancedFilters';
import LiveAuctionUpdates from '@/components/realtime/LiveAuctionUpdates';
import SavedSearches from '@/components/search/SavedSearches';

const defaultFilters = {
  make: 'all',
  model: 'all',
  yearMin: '',
  yearMax: '',
  priceMin: '',
  priceMax: '',
  condition: 'all',
  transmission: 'all',
  fuelType: 'all',
  sortBy: 'ending_soon'
};

export default function LiveAuction() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState(defaultFilters);
  const [user, setUser] = useState(null);
  const [compareCars, setCompareCars] = useState([]);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const toggleCompare = (carId) => {
    setCompareCars(prev => 
      prev.includes(carId) 
        ? prev.filter(id => id !== carId)
        : prev.length < 3 ? [...prev, carId] : prev
    );
  };

  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const auctionId = urlParams.get('auction_id');

  const { data: auctions = [] } = useQuery({
    queryKey: ['auctions'],
    queryFn: () => base44.entities.Auction.list('-start_time', 5)
  });

  const { data: cars = [], isLoading } = useQuery({
    queryKey: ['cars', auctionId],
    queryFn: () => base44.entities.Car.filter(
      auctionId ? { auction_id: auctionId, status: 'in_auction' } : { status: 'in_auction' },
      '-current_bid',
      100
    )
  });

  const liveAuction = auctions.find(a => a.status === 'live') || {
    id: 'demo',
    title: 'Auction #101',
    start_time: new Date().toISOString(),
    end_time: new Date(Date.now() + 3600000 * 6).toISOString(),
    status: 'live',
    total_cars: 18
  };

  // Sample cars if none exist
  const displayCars = cars.length > 0 ? cars : [...Array(12)].map((_, i) => ({
    id: i,
    make: ['Toyota', 'Honda', 'Suzuki', 'Hyundai', 'Kia', 'Mercedes', 'BMW', 'Audi', 'Nissan', 'Mazda', 'Ford', 'Chevrolet'][i],
    model: ['Corolla', 'Civic', 'Alto', 'Elantra', 'Sportage', 'C-Class', '3 Series', 'A4', 'Altima', 'CX-5', 'Mustang', 'Camaro'][i],
    year: 2018 + (i % 6),
    mileage: 20000 + (i * 8000),
    condition: ['excellent', 'good', 'fair', 'good', 'excellent', 'good'][i % 6],
    engine_type: ['petrol', 'diesel', 'hybrid', 'petrol', 'petrol', 'diesel'][i % 6],
    transmission: i % 3 === 0 ? 'automatic' : 'manual',
    registration_city: ['Lahore', 'Karachi', 'Islamabad', 'Multan', 'Faisalabad', 'Peshawar'][i % 6],
    starting_bid: 1200000 + (i * 400000),
    current_bid: 1500000 + (i * 450000),
    images: [
      'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=600',
      'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600',
      'https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=600',
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600',
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600',
      'https://images.unsplash.com/photo-1603386329225-868f9b1ee6c9?w=600',
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600',
      'https://images.unsplash.com/photo-1542362567-b07e54358753?w=600',
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600',
      'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600'
    ][i]
  }));

  const uniqueMakes = [...new Set(displayCars.map(c => c.make))];

  const filteredCars = useMemo(() => {
    let result = displayCars;

    // Text search
    if (searchQuery) {
      result = result.filter(car =>
        `${car.make} ${car.model} ${car.year}`.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Make filter
    if (filters.make !== 'all') {
      result = result.filter(car => car.make === filters.make);
    }

    // Model filter
    if (filters.model !== 'all') {
      result = result.filter(car => car.model === filters.model);
    }

    // Year range
    if (filters.yearMin) {
      result = result.filter(car => car.year >= parseInt(filters.yearMin));
    }
    if (filters.yearMax) {
      result = result.filter(car => car.year <= parseInt(filters.yearMax));
    }

    // Price range
    if (filters.priceMin) {
      result = result.filter(car => (car.current_bid || car.starting_bid) >= parseInt(filters.priceMin));
    }
    if (filters.priceMax) {
      result = result.filter(car => (car.current_bid || car.starting_bid) <= parseInt(filters.priceMax));
    }

    // Condition filter
    if (filters.condition !== 'all') {
      result = result.filter(car => car.condition === filters.condition);
    }

    // Transmission filter
    if (filters.transmission !== 'all') {
      result = result.filter(car => car.transmission === filters.transmission);
    }

    // Fuel type filter
    if (filters.fuelType !== 'all') {
      result = result.filter(car => car.engine_type === filters.fuelType);
    }

    // Sorting
    result = [...result].sort((a, b) => {
      switch (filters.sortBy) {
        case 'price_low': return (a.current_bid || a.starting_bid) - (b.current_bid || b.starting_bid);
        case 'price_high': return (b.current_bid || b.starting_bid) - (a.current_bid || a.starting_bid);
        case 'newest': return new Date(b.created_date) - new Date(a.created_date);
        case 'year_new': return b.year - a.year;
        case 'year_old': return a.year - b.year;
        case 'mileage_low': return a.mileage - b.mileage;
        default: return 0; // ending_soon - keep original order
      }
    });

    return result;
  }, [displayCars, searchQuery, filters]);

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => 
    value && value !== 'all' && value !== '' && value !== 'ending_soon'
  ).length;

  const clearAllFilters = () => {
    setFilters(defaultFilters);
    setSearchQuery('');
  };

  const handleBidUpdate = (bid) => {
    // Refresh car data when a new bid comes in
    // The react-query cache will be invalidated by the subscription
  };

  const carIds = filteredCars.map(c => c.id);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Live Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 sticky top-0 z-40 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-red-500 text-white border-0 animate-pulse">
                  <Zap className="w-4 h-4 mr-1" />
                  LIVE
                </Badge>
                <h1 className="text-xl font-bold text-white">{liveAuction.title}</h1>
              </div>
              <div className="hidden md:flex items-center gap-2 text-slate-400 text-sm">
                <MapPin className="w-4 h-4" />
                Okara Auction Yard
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Live updates
              </div>
              <div className="bg-white/10 rounded-xl px-4 py-2 backdrop-blur">
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 text-sm">Ends in:</span>
                  <CountdownTimer targetDate={liveAuction.end_time} size="small" showLabel={false} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b border-slate-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Car className="w-5 h-5 text-[#FFA602]" />
                <span className="font-semibold text-slate-900">{filteredCars.length}</span>
                <span className="text-slate-500">Cars Found</span>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-slate-500">127 active bidders</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-500">Auction ends at 6:00 PM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search by make, model, year..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <Select value={filters.make} onValueChange={(v) => setFilters({...filters, make: v, model: 'all'})}>
                <SelectTrigger className="w-36 h-11">
                  <SelectValue placeholder="All Makes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Makes</SelectItem>
                  {uniqueMakes.map(make => (
                    <SelectItem key={make} value={make}>{make}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.condition} onValueChange={(v) => setFilters({...filters, condition: v})}>
                <SelectTrigger className="w-36 h-11">
                  <SelectValue placeholder="Condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Conditions</SelectItem>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.sortBy} onValueChange={(v) => setFilters({...filters, sortBy: v})}>
                <SelectTrigger className="w-44 h-11">
                  <SortAsc className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ending_soon">Ending Soon</SelectItem>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest Arrivals</SelectItem>
                  <SelectItem value="year_new">Year: Newest First</SelectItem>
                  <SelectItem value="mileage_low">Mileage: Low to High</SelectItem>
                </SelectContent>
              </Select>

              {/* Advanced Filters Button */}
              <AdvancedFilters 
                filters={filters} 
                onFiltersChange={setFilters}
                onClear={clearAllFilters}
              />

              {/* View Toggle */}
              <div className="flex border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 ${viewMode === 'grid' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:bg-slate-50'}`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 ${viewMode === 'list' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:bg-slate-50'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {/* Compare Button */}
              {compareCars.length >= 2 && (
                <Link to={createPageUrl('CompareVehicles')}>
                  <Button className="bg-[#FFA602] hover:bg-amber-500">
                    <Scale className="w-4 h-4 mr-2" />
                    Compare ({compareCars.length})
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-100">
              <span className="text-sm text-slate-500">Active filters:</span>
              {filters.make !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Make: {filters.make}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters({...filters, make: 'all'})} />
                </Badge>
              )}
              {filters.model !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Model: {filters.model}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters({...filters, model: 'all'})} />
                </Badge>
              )}
              {filters.condition !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {filters.condition}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters({...filters, condition: 'all'})} />
                </Badge>
              )}
              {filters.transmission !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {filters.transmission}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters({...filters, transmission: 'all'})} />
                </Badge>
              )}
              {filters.fuelType !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {filters.fuelType}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters({...filters, fuelType: 'all'})} />
                </Badge>
              )}
              {(filters.priceMin || filters.priceMax) && (
                <Badge variant="secondary" className="gap-1">
                  Price: {filters.priceMin || '0'} - {filters.priceMax || '∞'}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters({...filters, priceMin: '', priceMax: ''})} />
                </Badge>
              )}
              {(filters.yearMin || filters.yearMax) && (
                <Badge variant="secondary" className="gap-1">
                  Year: {filters.yearMin || 'any'} - {filters.yearMax || 'any'}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters({...filters, yearMin: '', yearMax: ''})} />
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-red-600 hover:text-red-700">
                Clear All
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Real-time Updates */}
      <LiveAuctionUpdates carIds={carIds} onBidUpdate={handleBidUpdate} userId={user?.id} />

      {/* Saved Searches */}
      {user && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <SavedSearches 
            currentFilters={filters} 
            onApplyFilter={(f) => setFilters({ ...defaultFilters, ...f })} 
            userId={user.id} 
          />
        </div>
      )}

      {/* Car Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-96 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${searchQuery}-${JSON.stringify(filters)}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`
                  ${viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-4'}
                `}
              >
                {filteredCars.map((car, index) => (
                  <motion.div
                    key={car.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <CarCard
                      car={car}
                      auction={liveAuction}
                      compact={viewMode === 'list'}
                      showCompare={true}
                      onCompareToggle={toggleCompare}
                      isComparing={compareCars.includes(car.id)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {filteredCars.length === 0 && (
              <div className="text-center py-16">
                <Car className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-700 mb-2">No cars found</h3>
                <p className="text-slate-500">Try adjusting your filters</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={clearAllFilters}
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
```

```jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  User, Phone, CreditCard, FileText, CheckCircle,
  ArrowRight, ArrowLeft, Shield, MapPin, Clock, Info,
  Smartphone, IdCard
} from 'lucide-react';

export default function Register() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    cnic: '',
    address: '',
    city: '',
    agreed_to_terms: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const steps = [
    { number: 1, title: 'Personal Info', icon: User },
    { number: 2, title: 'Verification', icon: IdCard },
    { number: 3, title: 'Rules & Terms', icon: FileText },
    { number: 4, title: 'Token Payment', icon: CreditCard }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = () => {
    switch (step) {
      case 1:
        return formData.full_name && formData.phone && formData.city;
      case 2:
        return formData.cnic && formData.cnic.length === 13;
      case 3:
        return formData.agreed_to_terms;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await base44.auth.updateMe({
        phone: formData.phone,
        cnic: formData.cnic,
        address: formData.address,
        city: formData.city,
        user_type: 'buyer',
        is_approved: false
      });
      navigate(createPageUrl('TokenPayment'));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const rules = [
    'Auctions are held every second day from 10:00 AM to 6:00 PM',
    'Both online and offline bids are combined in real-time',
    'The highest bidder at auction end wins the vehicle',
    'Winning bidder must complete payment within 24-48 hours',
    'Vehicle must be collected from Okara Auction Yard',
    'Refundable token deposit is required to participate',
    'Platform acts as facilitator only - not vehicle owner'
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Register to Bid
            </h1>
            <p className="text-slate-400">
              Complete verification to start bidding on our live auctions
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((s, index) => (
              <React.Fragment key={s.number}>
                <div className="flex flex-col items-center">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors
                    ${step >= s.number 
                      ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white' 
                      : 'bg-slate-100 text-slate-400'}
                  `}>
                    {step > s.number ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <s.icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className={`text-xs font-medium ${step >= s.number ? 'text-slate-900' : 'text-slate-400'}`}>
                    {s.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${step > s.number ? 'bg-orange-500' : 'bg-slate-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
          <Progress value={(step / 4) * 100} className="h-2" />
        </div>

        {/* Form Steps */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl border border-slate-200 p-8"
        >
          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Personal Information</h2>
                <p className="text-slate-500">Let's start with your basic details</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    placeholder="Enter your full name"
                    className="h-12 mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="03XX-XXXXXXX"
                      className="h-12 pl-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Your city"
                      className="h-12 mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Street address"
                      className="h-12 mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Verification */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IdCard className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Identity Verification</h2>
                <p className="text-slate-500">We need to verify your identity for secure bidding</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="cnic">CNIC Number *</Label>
                  <Input
                    id="cnic"
                    value={formData.cnic}
                    onChange={(e) => handleInputChange('cnic', e.target.value.replace(/\D/g, '').slice(0, 13))}
                    placeholder="XXXXXXXXXXXXX (13 digits)"
                    className="h-12 mt-1 text-lg tracking-wider"
                    maxLength={13}
                  />
                  <p className="text-sm text-slate-500 mt-2">
                    Enter your 13-digit CNIC number without dashes
                  </p>
                </div>

                <Alert className="bg-blue-50 border-blue-200">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    Your CNIC is required for identity verification. It will be kept secure and confidential.
                  </AlertDescription>
                </Alert>

                <div className="bg-slate-50 rounded-xl p-4">
                  <h4 className="font-medium text-slate-900 mb-3">Phone Verification</h4>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                    <Smartphone className="w-5 h-5 text-slate-400" />
                    <span className="text-slate-700">{formData.phone || 'Not provided'}</span>
                    <CheckCircle className="w-5 h-5 text-emerald-500 ml-auto" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Rules & Terms */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Auction Rules</h2>
                <p className="text-slate-500">Please read and accept our bidding terms</p>
              </div>

              <div className="bg-slate-50 rounded-xl p-6">
                <h4 className="font-semibold text-slate-900 mb-4">Key Rules & Guidelines</h4>
                <ul className="space-y-3">
                  {rules.map((rule, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-orange-600">{index + 1}</span>
                      </div>
                      <span className="text-slate-700">{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-800">Payment Deadline</h4>
                    <p className="text-sm text-amber-700">
                      Winners must complete payment within 24-48 hours. Failure to pay may result in penalty and ban from future auctions.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-200">
                <Checkbox
                  id="terms"
                  checked={formData.agreed_to_terms}
                  onCheckedChange={(checked) => handleInputChange('agreed_to_terms', checked)}
                />
                <label htmlFor="terms" className="text-sm text-slate-700 cursor-pointer">
                  I have read and agree to the auction rules, terms of service, and understand that the platform acts as a facilitator only. I commit to completing payment within 48 hours if I win an auction.
                </label>
              </div>
            </div>
          )}

          {/* Step 4: Token Payment */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Token Payment</h2>
                <p className="text-slate-500">Secure your bidding access with a refundable deposit</p>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white text-center">
                <p className="text-sm opacity-80 mb-2">Required Token Amount</p>
                <p className="text-4xl font-bold mb-2">PKR 10,000</p>
                <p className="text-sm opacity-80">Fully Refundable</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                  <Shield className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="font-medium text-slate-900">Secure Deposit</p>
                    <p className="text-sm text-slate-500">Your token is held securely and protects serious buyers</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="font-medium text-slate-900">Fully Refundable</p>
                    <p className="text-sm text-slate-500">Get your full deposit back if you don't win any auction</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                  <Info className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-slate-900">Applied to Purchase</p>
                    <p className="text-sm text-slate-500">Token is deducted from winning bid amount</p>
                  </div>
                </div>
              </div>

              <Alert>
                <AlertDescription>
                  Complete your registration to proceed to payment. Multiple payment methods available including JazzCash, EasyPaisa, and bank transfer.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
            {step > 1 ? (
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <Button 
                onClick={nextStep}
                disabled={!validateStep()}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
              >
                {isLoading ? 'Processing...' : 'Proceed to Payment'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </motion.div>

        {/* Trust Footer */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Secure Registration
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Okara Auction Yard
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            24/7 Support
          </div>
        </div>
      </div>
    </div>
  );
}
```

```jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Car, Plus, Clock, CheckCircle, XCircle, DollarSign,
  TrendingUp, Calendar, Eye, Edit, AlertCircle, Zap,
  ChevronRight, FileText
} from 'lucide-react';
import StatsCard from '@/components/ui/StatsCard';
import CarImageUploader from '@/components/seller/CarImageUploader';
import InspectionReportForm from '@/components/seller/InspectionReportForm';
import SellerAnalytics from '@/components/seller/SellerAnalytics';
import InspectionManager from '@/components/seller/InspectionManager';
import SellerNotificationService from '@/components/notifications/SellerNotificationService';

export default function SellerDashboard() {
  const [user, setUser] = useState(null);
  const [showAddCar, setShowAddCar] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [newCar, setNewCar] = useState({
    make: '', model: '', year: '', mileage: '', condition: '',
    engine_type: '', transmission: '', color: '', registration_city: '',
    starting_bid: '', reserve_price: '', buy_now_price: '', images: [],
    inspection_report: {}
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: myCars = [] } = useQuery({
    queryKey: ['myCars', user?.id],
    queryFn: () => user?.id ? base44.entities.Car.filter({ seller_id: user.id }, '-created_date', 50) : [],
    enabled: !!user?.id
  });

  const addCarMutation = useMutation({
    mutationFn: (carData) => base44.entities.Car.create({
      ...carData,
      seller_id: user?.id,
      status: 'pending_approval',
      year: parseInt(carData.year),
      mileage: parseInt(carData.mileage),
      starting_bid: parseInt(carData.starting_bid),
      reserve_price: carData.reserve_price ? parseInt(carData.reserve_price) : null,
      buy_now_price: carData.buy_now_price ? parseInt(carData.buy_now_price) : null
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myCars'] });
      setShowAddCar(false);
      setCurrentStep(1);
      setNewCar({
        make: '', model: '', year: '', mileage: '', condition: '',
        engine_type: '', transmission: '', color: '', registration_city: '',
        starting_bid: '', reserve_price: '', buy_now_price: '', images: [],
        inspection_report: {}
      });
    }
  });

  const displayCars = myCars.length > 0 ? myCars : [
    { id: 1, make: 'Toyota', model: 'Corolla', year: 2022, status: 'in_auction', current_bid: 3850000, starting_bid: 3200000 },
    { id: 2, make: 'Honda', model: 'Civic', year: 2021, status: 'pending_approval', starting_bid: 2800000 },
    { id: 3, make: 'Suzuki', model: 'Alto', year: 2023, status: 'sold', final_price: 1650000, starting_bid: 1400000 }
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

  const steps = [
    { num: 1, title: 'Basic Info' },
    { num: 2, title: 'Photos' },
    { num: 3, title: 'Inspection' },
    { num: 4, title: 'Pricing' }
  ];

  const canProceedStep1 = newCar.make && newCar.model && newCar.year && newCar.mileage && newCar.condition;
  const canProceedStep2 = newCar.images.length >= 3;
  const canSubmit = canProceedStep1 && newCar.starting_bid;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Seller real-time notification service */}
      <SellerNotificationService sellerId={user?.id} sellerCars={myCars} />
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Seller Dashboard</h1>
              <p className="text-slate-400">Manage your vehicle listings</p>
            </div>
            <Dialog open={showAddCar} onOpenChange={(open) => {
              setShowAddCar(open);
              if (!open) {
                setCurrentStep(1);
              }
            }}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-[#FFA602] to-amber-500 hover:from-amber-500 hover:to-[#FFA602]">
                  <Plus className="w-5 h-5 mr-2" />
                  Submit New Vehicle
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                  <DialogTitle>Submit Vehicle for Auction</DialogTitle>
                </DialogHeader>
                
                {/* Steps Indicator */}
                <div className="flex items-center justify-between py-4 border-b">
                  {steps.map((step, index) => (
                    <React.Fragment key={step.num}>
                      <div 
                        className={`flex items-center gap-2 cursor-pointer ${currentStep >= step.num ? 'text-[#FFA602]' : 'text-slate-400'}`}
                        onClick={() => setCurrentStep(step.num)}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          currentStep >= step.num ? 'bg-[#FFA602] text-white' : 'bg-slate-200 text-slate-500'
                        }`}>
                          {step.num}
                        </div>
                        <span className="hidden sm:inline text-sm font-medium">{step.title}</span>
                      </div>
                      {index < steps.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-2 ${currentStep > step.num ? 'bg-[#FFA602]' : 'bg-slate-200'}`} />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                <ScrollArea className="flex-1 pr-4">
                  {/* Step 1: Basic Info */}
                  {currentStep === 1 && (
                    <div className="grid grid-cols-2 gap-4 py-4">
                      <div>
                        <Label>Make *</Label>
                        <Input
                          value={newCar.make}
                          onChange={(e) => setNewCar({ ...newCar, make: e.target.value })}
                          placeholder="e.g. Toyota"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Model *</Label>
                        <Input
                          value={newCar.model}
                          onChange={(e) => setNewCar({ ...newCar, model: e.target.value })}
                          placeholder="e.g. Corolla"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Year *</Label>
                        <Input
                          type="number"
                          value={newCar.year}
                          onChange={(e) => setNewCar({ ...newCar, year: e.target.value })}
                          placeholder="e.g. 2022"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Mileage (km) *</Label>
                        <Input
                          type="number"
                          value={newCar.mileage}
                          onChange={(e) => setNewCar({ ...newCar, mileage: e.target.value })}
                          placeholder="e.g. 35000"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Condition *</Label>
                        <Select value={newCar.condition} onValueChange={(v) => setNewCar({ ...newCar, condition: v })}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="excellent">Excellent</SelectItem>
                            <SelectItem value="good">Good</SelectItem>
                            <SelectItem value="fair">Fair</SelectItem>
                            <SelectItem value="needs_repair">Needs Repair</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Engine Type</Label>
                        <Select value={newCar.engine_type} onValueChange={(v) => setNewCar({ ...newCar, engine_type: v })}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select engine" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="petrol">Petrol</SelectItem>
                            <SelectItem value="diesel">Diesel</SelectItem>
                            <SelectItem value="hybrid">Hybrid</SelectItem>
                            <SelectItem value="cng">CNG</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Transmission</Label>
                        <Select value={newCar.transmission} onValueChange={(v) => setNewCar({ ...newCar, transmission: v })}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select transmission" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="automatic">Automatic</SelectItem>
                            <SelectItem value="manual">Manual</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Color</Label>
                        <Input
                          value={newCar.color}
                          onChange={(e) => setNewCar({ ...newCar, color: e.target.value })}
                          placeholder="e.g. White"
                          className="mt-1"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Registration City</Label>
                        <Input
                          value={newCar.registration_city}
                          onChange={(e) => setNewCar({ ...newCar, registration_city: e.target.value })}
                          placeholder="e.g. Lahore"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 2: Photos */}
                  {currentStep === 2 && (
                    <div className="py-4 space-y-4">
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-2">Vehicle Photos</h3>
                        <p className="text-sm text-slate-500 mb-4">
                          Upload at least 3 photos. Include exterior (front, back, sides), interior, and engine bay.
                        </p>
                        <CarImageUploader
                          images={newCar.images}
                          onChange={(images) => setNewCar({ ...newCar, images })}
                          maxImages={10}
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 3: Inspection */}
                  {currentStep === 3 && (
                    <div className="py-4 space-y-4">
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-2">Self-Inspection Report</h3>
                        <p className="text-sm text-slate-500 mb-4">
                          Rate each component honestly. Our team will verify during physical inspection.
                        </p>
                        <InspectionReportForm
                          report={newCar.inspection_report}
                          onChange={(report) => setNewCar({ ...newCar, inspection_report: report })}
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 4: Pricing */}
                  {currentStep === 4 && (
                    <div className="py-4 space-y-6">
                      <div>
                        <Label>Starting Bid (PKR) *</Label>
                        <Input
                          type="number"
                          value={newCar.starting_bid}
                          onChange={(e) => setNewCar({ ...newCar, starting_bid: e.target.value })}
                          placeholder="e.g. 3000000"
                          className="mt-1 text-lg"
                        />
                        <p className="text-xs text-slate-500 mt-1">Minimum starting price for bidding</p>
                      </div>
                      
                      <div>
                        <Label>Reserve Price (PKR)</Label>
                        <Input
                          type="number"
                          value={newCar.reserve_price}
                          onChange={(e) => setNewCar({ ...newCar, reserve_price: e.target.value })}
                          placeholder="Minimum price you'll accept"
                          className="mt-1"
                        />
                        <p className="text-xs text-slate-500 mt-1">Car won't sell below this price (optional)</p>
                      </div>

                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="w-5 h-5 text-emerald-600" />
                          <Label className="text-emerald-800 font-medium">Buy It Now Price (PKR)</Label>
                        </div>
                        <Input
                          type="number"
                          value={newCar.buy_now_price}
                          onChange={(e) => setNewCar({ ...newCar, buy_now_price: e.target.value })}
                          placeholder="Instant purchase price"
                          className="mt-1"
                        />
                        <p className="text-xs text-emerald-700 mt-2">
                          Allow buyers to skip bidding and purchase immediately at this price (optional)
                        </p>
                      </div>

                      {/* Summary */}
                      <div className="bg-slate-50 rounded-xl p-4">
                        <h4 className="font-medium text-slate-900 mb-3">Listing Summary</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-slate-500">Vehicle:</span>
                            <p className="font-medium">{newCar.year} {newCar.make} {newCar.model}</p>
                          </div>
                          <div>
                            <span className="text-slate-500">Condition:</span>
                            <p className="font-medium capitalize">{newCar.condition || 'Not set'}</p>
                          </div>
                          <div>
                            <span className="text-slate-500">Photos:</span>
                            <p className="font-medium">{newCar.images.length} uploaded</p>
                          </div>
                          <div>
                            <span className="text-slate-500">Starting Bid:</span>
                            <p className="font-medium">PKR {parseInt(newCar.starting_bid || 0).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </ScrollArea>

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : setShowAddCar(false)}
                  >
                    {currentStep > 1 ? 'Back' : 'Cancel'}
                  </Button>
                  
                  {currentStep < 4 ? (
                    <Button
                      onClick={() => setCurrentStep(currentStep + 1)}
                      disabled={currentStep === 1 && !canProceedStep1}
                      className="bg-gradient-to-r from-[#FFA602] to-amber-500"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  ) : (
                    <Button
                      onClick={() => addCarMutation.mutate(newCar)}
                      disabled={!canSubmit || addCarMutation.isPending}
                      className="bg-gradient-to-r from-[#FFA602] to-amber-500"
                    >
                      {addCarMutation.isPending ? 'Submitting...' : 'Submit for Approval'}
                    </Button>
                  )}
                </div>
              </DialogContent>
            </Dialog>
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

        {/* Analytics Section */}
        <div className="mb-8">
          <SellerAnalytics sellerId={user?.id} cars={displayCars} />
        </div>

        {/* Vehicle Listings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
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
                                <span>Starting: PKR {car.starting_bid?.toLocaleString()}</span>
                                {car.current_bid && (
                                  <span className="text-emerald-600 font-medium">
                                    Current: PKR {car.current_bid.toLocaleString()}
                                  </span>
                                )}
                                {car.final_price && (
                                  <span className="text-purple-600 font-medium">
                                    Sold: PKR {car.final_price.toLocaleString()}
                                  </span>
                                )}
                                {car.buy_now_price && (
                                  <span className="text-emerald-600 flex items-center gap-1">
                                    <Zap className="w-3 h-3" />
                                    Buy Now: PKR {car.buy_now_price.toLocaleString()}
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

        {/* Inspection Manager for first car */}
        {displayCars.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Manage Inspections</h3>
            <InspectionManager car={displayCars[0]} sellerId={user?.id} />
          </div>
        )}

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
```

```jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Car, DollarSign, Clock, CheckCircle, AlertTriangle, Wallet,
  TrendingUp, ChevronRight, Star, FileText, Download, Banknote
} from 'lucide-react';

export default function SellerTransactions() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: soldCars = [] } = useQuery({
    queryKey: ['soldCars', user?.id],
    queryFn: () => user?.id ? base44.entities.Car.filter({ seller_id: user.id, status: 'sold' }, '-updated_date', 50) : [],
    enabled: !!user?.id
  });

  const { data: escrowPayments = [] } = useQuery({
    queryKey: ['sellerEscrow', user?.id],
    queryFn: () => user?.id ? base44.entities.EscrowPayment.filter({ seller_id: user.id }, '-created_date', 50) : [],
    enabled: !!user?.id
  });

  const { data: disputes = [] } = useQuery({
    queryKey: ['sellerDisputes', user?.id],
    queryFn: () => user?.id ? base44.entities.Dispute.filter({ seller_id: user.id }, '-created_date', 20) : [],
    enabled: !!user?.id
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['sellerReviews', user?.id],
    queryFn: () => user?.id ? base44.entities.SellerReview.filter({ seller_id: user.id }, '-created_date', 50) : [],
    enabled: !!user?.id
  });

  // Sample data
  const sampleSoldCars = soldCars.length > 0 ? soldCars : [
    { id: 1, make: 'Toyota', model: 'Corolla', year: 2022, final_price: 3850000, updated_date: new Date().toISOString() },
    { id: 2, make: 'Honda', model: 'Civic', year: 2021, final_price: 2950000, updated_date: new Date(Date.now() - 604800000).toISOString() },
    { id: 3, make: 'Suzuki', model: 'Alto', year: 2023, final_price: 1650000, updated_date: new Date(Date.now() - 1209600000).toISOString() }
  ];

  const sampleEscrow = escrowPayments.length > 0 ? escrowPayments : [
    { id: 1, amount: 3850000, platform_fee: 77000, status: 'released_to_seller', created_date: new Date().toISOString() },
    { id: 2, amount: 2950000, platform_fee: 59000, status: 'in_escrow', created_date: new Date(Date.now() - 86400000).toISOString() }
  ];

  const sampleReviews = reviews.length > 0 ? reviews : [
    { id: 1, overall_rating: 5, review_text: 'Excellent seller, car was exactly as described!', created_date: new Date().toISOString() },
    { id: 2, overall_rating: 4, review_text: 'Good experience, quick handover.', created_date: new Date(Date.now() - 604800000).toISOString() }
  ];

  const totalEarnings = sampleEscrow.filter(e => e.status === 'released_to_seller').reduce((sum, e) => sum + (e.amount - (e.platform_fee || 0)), 0);
  const pendingPayouts = sampleEscrow.filter(e => e.status === 'in_escrow').reduce((sum, e) => sum + e.amount, 0);
  const avgRating = sampleReviews.length > 0 ? (sampleReviews.reduce((sum, r) => sum + r.overall_rating, 0) / sampleReviews.length).toFixed(1) : 0;

  const escrowStatusConfig = {
    pending: { label: 'Awaiting Payment', color: 'bg-amber-100 text-amber-700', icon: Clock },
    in_escrow: { label: 'Buyer Paid', color: 'bg-blue-100 text-blue-700', icon: Clock },
    released_to_seller: { label: 'Paid Out', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
    refunded_to_buyer: { label: 'Refunded', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
    disputed: { label: 'Disputed', color: 'bg-red-100 text-red-700', icon: AlertTriangle }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Sales & Payouts</h1>
          <p className="text-slate-400">Track your vehicle sales, earnings, and reviews</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <Car className="w-8 h-8 text-orange-500 mb-2" />
              <p className="text-2xl font-bold text-slate-900">{sampleSoldCars.length}</p>
              <p className="text-sm text-slate-500">Vehicles Sold</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Banknote className="w-8 h-8 text-emerald-500 mb-2" />
              <p className="text-2xl font-bold text-slate-900">PKR {(totalEarnings / 1000000).toFixed(1)}M</p>
              <p className="text-sm text-slate-500">Total Earnings</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Clock className="w-8 h-8 text-blue-500 mb-2" />
              <p className="text-2xl font-bold text-slate-900">PKR {(pendingPayouts / 1000000).toFixed(1)}M</p>
              <p className="text-sm text-slate-500">Pending Payouts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Star className="w-8 h-8 text-amber-500 mb-2" />
              <p className="text-2xl font-bold text-slate-900">{avgRating} ★</p>
              <p className="text-sm text-slate-500">{sampleReviews.length} Reviews</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="sales">
          <TabsList className="mb-6">
            <TabsTrigger value="sales">Sales History</TabsTrigger>
            <TabsTrigger value="payouts">Payouts</TabsTrigger>
            <TabsTrigger value="disputes">Disputes</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          {/* Sales History */}
          <TabsContent value="sales">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="w-5 h-5 text-orange-500" />
                  Sold Vehicles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sampleSoldCars.map((car, i) => (
                    <motion.div key={car.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-14 bg-slate-200 rounded-lg overflow-hidden">
                          <img src="https://images.unsplash.com/photo-1590362891991-f776e747a588?w=200" alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{car.year} {car.make} {car.model}</p>
                          <p className="text-sm text-slate-500">Sold on {new Date(car.updated_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-600">PKR {car.final_price?.toLocaleString()}</p>
                        <Badge className="bg-emerald-100 text-emerald-700">Completed</Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payouts */}
          <TabsContent value="payouts">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-emerald-500" />
                  Payout Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sampleEscrow.map((payout, i) => {
                    const status = escrowStatusConfig[payout.status] || escrowStatusConfig.pending;
                    const StatusIcon = status.icon;
                    const netAmount = payout.amount - (payout.platform_fee || 0);
                    return (
                      <motion.div key={payout.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex items-center justify-between mb-3">
                          <Badge className={status.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {status.label}
                          </Badge>
                          <span className="text-sm text-slate-500">{new Date(payout.created_date).toLocaleDateString()}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-slate-500">Sale Amount</p>
                            <p className="font-semibold">PKR {payout.amount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Platform Fee (2%)</p>
                            <p className="font-semibold text-red-600">-PKR {(payout.platform_fee || 0).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Net Payout</p>
                            <p className="font-bold text-emerald-600">PKR {netAmount.toLocaleString()}</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Disputes */}
          <TabsContent value="disputes">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Dispute History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {disputes.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
                    <p className="text-slate-500">No disputes raised against your sales</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {disputes.map((dispute) => (
                      <div key={dispute.id} className={`p-4 rounded-xl border ${dispute.status === 'open' || dispute.status === 'under_review' ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={dispute.status.includes('resolved') ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}>
                            {dispute.status?.replace('_', ' ')}
                          </Badge>
                          <span className="text-sm text-slate-500">{new Date(dispute.created_date).toLocaleDateString()}</span>
                        </div>
                        <p className="font-medium text-slate-900">{dispute.reason?.replace('_', ' ')}</p>
                        {dispute.resolution_notes && (
                          <p className="text-sm text-slate-600 mt-2 p-2 bg-white rounded">Resolution: {dispute.resolution_notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews */}
          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500" />
                  Buyer Reviews ({sampleReviews.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sampleReviews.map((review, i) => (
                    <motion.div key={review.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                      className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, j) => (
                            <Star key={j} className={`w-4 h-4 ${j < review.overall_rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                          ))}
                        </div>
                        <span className="text-sm text-slate-500">{new Date(review.created_date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-slate-700">{review.review_text}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
```

```jsx
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, Award, Building2, CheckCircle, Clock, Upload,
  Star, TrendingUp, Loader2, ArrowRight, FileText, User
} from 'lucide-react';
import { toast } from 'sonner';

const BENEFITS = {
  verified_seller: [
    'Verified Seller badge on all listings',
    'Higher trust score in search rankings',
    'Access to premium auction slots',
    'Reduced listing fees (10% discount)',
    'Priority customer support'
  ],
  verified_dealer: [
    'Verified Dealer badge & business profile',
    'List unlimited vehicles per month',
    'Dedicated dealer dashboard & analytics',
    'Bulk listing tools',
    'Featured placement in search results',
    'Dealer membership pricing'
  ]
};

export default function SellerVerification() {
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);
  const [applicationType, setApplicationType] = useState('verified_seller');
  const [form, setForm] = useState({
    business_name: '',
    business_registration_no: '',
    cnic_number: '',
    phone: '',
    address: '',
    years_in_business: '',
    additional_info: ''
  });

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: existingApps = [] } = useQuery({
    queryKey: ['myVerificationApps'],
    queryFn: () => user ? base44.entities.VerificationApplication.filter({ user_id: user.id }, '-created_date', 5) : [],
    enabled: !!user
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['myReviews'],
    queryFn: () => user ? base44.entities.SellerReview.filter({ seller_id: user.id }) : [],
    enabled: !!user
  });

  const submitMutation = useMutation({
    mutationFn: (data) => base44.entities.VerificationApplication.create(data),
    onSuccess: () => {
      toast.success('Application submitted! Our team will review it within 2-3 business days.');
      setStep(4);
    }
  });

  const handleSubmit = () => {
    if (!form.cnic_number || !form.phone) {
      toast.error('CNIC and phone are required');
      return;
    }
    const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.overall_rating, 0) / reviews.length : 0;
    submitMutation.mutate({
      user_id: user.id,
      user_name: user.full_name,
      user_email: user.email,
      application_type: applicationType,
      ...form,
      years_in_business: form.years_in_business ? parseInt(form.years_in_business) : 0,
      total_transactions: reviews.length,
      avg_rating: avgRating,
      status: 'pending'
    });
  };

  const latestApp = existingApps[0];
  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.overall_rating, 0) / reviews.length).toFixed(1) : 0;

  if (latestApp && latestApp.status === 'approved') {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">You're Verified!</h1>
          <p className="text-slate-500 mb-4">Your <strong>{latestApp.application_type?.replace('_', ' ')}</strong> status is active.</p>
          <Badge className="bg-emerald-100 text-emerald-700 text-sm px-4 py-1">
            <Award className="w-4 h-4 mr-2" /> {latestApp.application_type === 'verified_dealer' ? 'Verified Dealer' : 'Verified Seller'}
          </Badge>
        </div>
      </div>
    );
  }

  if (latestApp && (latestApp.status === 'pending' || latestApp.status === 'under_review')) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Application Under Review</h1>
          <p className="text-slate-500">Your <strong>{latestApp.application_type?.replace('_', ' ')}</strong> application is being reviewed. We'll notify you within 2-3 business days.</p>
          <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200 text-sm text-amber-700">
            Submitted on: {new Date(latestApp.created_date).toLocaleDateString()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-[#FFA602] to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Get Verified</h1>
          <p className="text-slate-500">Build trust with buyers and unlock premium features</p>
        </div>

        {/* Your Stats */}
        {user && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Avg Rating', value: avgRating > 0 ? `${avgRating}★` : 'N/A', icon: Star, color: 'text-amber-500' },
              { label: 'Reviews', value: reviews.length, icon: User, color: 'text-blue-500' },
              { label: 'Your Status', value: user.role === 'admin' ? 'Admin' : 'Seller', icon: Award, color: 'text-purple-500' }
            ].map(s => (
              <Card key={s.label}>
                <CardContent className="pt-4 pb-3 text-center">
                  <s.icon className={`w-5 h-5 mx-auto mb-1 ${s.color}`} />
                  <p className="font-bold text-lg">{s.value}</p>
                  <p className="text-xs text-slate-500">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {step === 4 ? (
          <Card>
            <CardContent className="pt-10 pb-10 text-center">
              <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Application Submitted!</h2>
              <p className="text-slate-500">Our team will review your application within 2-3 business days and notify you by email.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Type Selection */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900">Choose Verification Type</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { type: 'verified_seller', icon: Award, title: 'Verified Seller', desc: 'For individuals with consistent positive transaction history', req: '5+ successful auctions, 4.0+ rating' },
                    { type: 'verified_dealer', icon: Building2, title: 'Verified Dealer', desc: 'For registered car dealerships and businesses', req: 'Business registration, CNIC, address proof' }
                  ].map(option => (
                    <div
                      key={option.type}
                      onClick={() => setApplicationType(option.type)}
                      className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${
                        applicationType === option.type ? 'border-[#FFA602] bg-amber-50' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <option.icon className={`w-6 h-6 ${applicationType === option.type ? 'text-[#FFA602]' : 'text-slate-500'}`} />
                        <span className="font-semibold">{option.title}</span>
                      </div>
                      <p className="text-sm text-slate-500 mb-3">{option.desc}</p>
                      <div className="space-y-1">
                        {BENEFITS[option.type].slice(0, 3).map(b => (
                          <p key={b} className="text-xs text-slate-600 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-emerald-500 flex-shrink-0" /> {b}
                          </p>
                        ))}
                      </div>
                      <p className="text-xs text-slate-400 mt-2 italic">Requires: {option.req}</p>
                    </div>
                  ))}
                </div>
                <Button className="w-full bg-[#FFA602] hover:bg-amber-500 text-white" onClick={() => setStep(2)}>
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {/* Form */}
            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Personal & Business Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {applicationType === 'verified_dealer' && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Business Name *</Label>
                          <Input value={form.business_name} onChange={e => setForm({ ...form, business_name: e.target.value })} placeholder="ABC Motors" className="mt-1" />
                        </div>
                        <div>
                          <Label>Registration No.</Label>
                          <Input value={form.business_registration_no} onChange={e => setForm({ ...form, business_registration_no: e.target.value })} placeholder="REG-12345" className="mt-1" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Years in Business</Label>
                          <Input type="number" value={form.years_in_business} onChange={e => setForm({ ...form, years_in_business: e.target.value })} placeholder="5" className="mt-1" />
                        </div>
                      </div>
                    </>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>CNIC Number *</Label>
                      <Input value={form.cnic_number} onChange={e => setForm({ ...form, cnic_number: e.target.value })} placeholder="12345-6789012-3" className="mt-1" />
                    </div>
                    <div>
                      <Label>Phone Number *</Label>
                      <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="03XX-XXXXXXX" className="mt-1" />
                    </div>
                  </div>
                  <div>
                    <Label>Address</Label>
                    <Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="City, Province" className="mt-1" />
                  </div>
                  <Alert className="bg-blue-50 border-blue-200">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <AlertDescription className="text-sm text-blue-700">
                      Documents (CNIC copy, business registration) can be submitted via email to verify@okaraautoauction.pk after applying.
                    </AlertDescription>
                  </Alert>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
                    <Button onClick={() => setStep(3)} disabled={!form.cnic_number || !form.phone} className="flex-1 bg-[#FFA602] hover:bg-amber-500 text-white">
                      Continue <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Confirm */}
            {step === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Confirm & Submit Application</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-xl space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      {applicationType === 'verified_dealer' ? <Building2 className="w-4 h-4 text-blue-600" /> : <Award className="w-4 h-4 text-emerald-600" />}
                      <span className="font-semibold capitalize">{applicationType.replace('_', ' ')}</span>
                    </div>
                    <p><span className="text-slate-500">CNIC:</span> {form.cnic_number}</p>
                    <p><span className="text-slate-500">Phone:</span> {form.phone}</p>
                    {form.business_name && <p><span className="text-slate-500">Business:</span> {form.business_name}</p>}
                  </div>

                  <div>
                    <Label>Any additional information</Label>
                    <Textarea value={form.additional_info} onChange={e => setForm({ ...form, additional_info: e.target.value })} placeholder="Anything you'd like us to know..." className="h-20 mt-1" />
                  </div>

                  <Alert>
                    <AlertDescription className="text-xs">
                      By submitting, you confirm that all provided information is accurate. False information will result in permanent ban from the platform.
                    </AlertDescription>
                  </Alert>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(2)} className="flex-1">Back</Button>
                    <Button onClick={handleSubmit} disabled={submitMutation.isPending} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                      {submitMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                      Submit Application
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
```

```jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CreditCard, Smartphone, Building2, Wallet, Shield,
  CheckCircle, Info, ArrowRight, RefreshCw, Lock,
  Copy, Clock, AlertTriangle
} from 'lucide-react';

export default function TokenPayment() {
  const [paymentMethod, setPaymentMethod] = useState('jazzcash');
  const [transactionId, setTransactionId] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => navigate(createPageUrl('Register')));
  }, []);

  const paymentMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.TokenPayment.create({
        user_id: user?.id,
        amount: 10000,
        payment_method: paymentMethod,
        transaction_id: transactionId,
        status: 'pending',
        purpose: 'bidding_deposit'
      });
      await base44.auth.updateMe({
        token_balance: 10000
      });
    },
    onSuccess: () => {
      navigate(createPageUrl('BuyerDashboard'));
    }
  });

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
                    <button className="p-1 hover:bg-slate-200 rounded">
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
                    <button className="p-1 hover:bg-slate-200 rounded">
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
              onClick={() => paymentMutation.mutate()}
              disabled={!transactionId || paymentMutation.isPending}
              className="w-full h-14 text-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/25"
            >
              {paymentMutation.isPending ? (
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
```

```jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  Shield, FileText, MapPin, Scale, AlertTriangle,
  Clock, DollarSign, HelpCircle, Phone, Mail, Building2
} from 'lucide-react';

export default function TrustLegal() {
  const sections = [
    {
      icon: Shield,
      title: '1–2. Acceptance of Terms & Platform Role',
      content: `By accessing or using the Seller.pk platform, all users including buyers, dealers, and sellers agree to comply with these Terms & Conditions. If you do not agree with any part of these terms, you must not use the platform.

Seller.pk acts as an online marketplace that connects car sellers and buyers through an auction system. Seller.pk does not own the vehicles listed unless explicitly stated.`
    },
    {
      icon: FileText,
      title: '3–4. User Eligibility & Account Registration',
      content: `USER ELIGIBILITY
Users must be at least 18 years old and legally capable of entering into binding agreements under the laws of Pakistan.

ACCOUNT REGISTRATION
Users must provide accurate and complete information when creating an account. Users are responsible for maintaining the confidentiality of their login credentials.`
    },
    {
      icon: Scale,
      title: '5–6. Vehicle Listing & Auction Process',
      content: `VEHICLE LISTING (Dealers / Sellers)
Dealers or sellers who list vehicles on the platform must ensure:
• The vehicle details are accurate and truthful.
• The vehicle is legally owned or authorized for sale.
• All documents required under Pakistani law are valid.

Seller.pk reserves the right to remove any listing that contains misleading or false information.

AUCTION PROCESS
Vehicles listed for auction will be open for bidding for a specific time period defined by the platform. The highest valid bid at the end of the auction period will be considered the winning bid.

Seller.pk reserves the right to cancel auctions in case of suspicious activity or system errors.`
    },
    {
      icon: DollarSign,
      title: '7–9. Service Fees, Admin Control & Payment Terms',
      content: `PLATFORM SERVICE FEES
Seller.pk may charge service fees from buyers, sellers, or dealers for using the platform. These fees may include but are not limited to:
• Listing fee for uploading a vehicle
• Auction participation fee
• Transaction or success fee after a successful sale

All applicable fees will be determined and managed by the platform administrator and may vary depending on the vehicle price, dealer category, or promotional campaigns.

ADMIN FEE CONTROL
The platform administrator reserves the right to apply platform service fees per vehicle, per dealer, or per transaction. These fees may be updated, modified, or adjusted at any time based on business policies.

PAYMENT TERMS
All payments must be made through the approved payment methods available on Seller.pk. Users must complete payments within the timeframe defined after winning an auction. Failure to complete payment may result in account suspension or cancellation of the transaction.`
    },
    {
      icon: AlertTriangle,
      title: '10–11. Vehicle Inspection & Prohibited Activities',
      content: `VEHICLE INSPECTION & RESPONSIBILITY
Buyers are responsible for verifying vehicle condition, documents, and legal status before completing a purchase. Seller.pk does not guarantee the condition of any vehicle listed on the platform.

PROHIBITED ACTIVITIES
Users must not:
• Submit fake bids
• Manipulate auction prices
• Use multiple accounts for unfair bidding
• Upload illegal or stolen vehicles

Violation may lead to account suspension or permanent ban.`
    },
    {
      icon: Scale,
      title: '12–13. Transaction Completion & Dispute Resolution',
      content: `TRANSACTION COMPLETION
After a successful auction, the buyer and seller must complete the transaction according to Pakistani legal requirements including vehicle transfer documentation. Seller.pk may assist with transaction coordination but is not responsible for disputes between users.

DISPUTE RESOLUTION
In case of disputes between buyers and sellers, Seller.pk may review the issue and attempt to mediate, but the final legal responsibility remains with the involved parties.`
    },
    {
      icon: AlertTriangle,
      title: '14–15. Account Suspension & Limitation of Liability',
      content: `ACCOUNT SUSPENSION
Seller.pk reserves the right to suspend or terminate any account involved in fraudulent, illegal, or suspicious activities.

LIMITATION OF LIABILITY
Seller.pk shall not be liable for:
• Vehicle condition disputes
• Delays in transactions
• Financial losses resulting from user actions`
    },
    {
      icon: FileText,
      title: '16–17. Changes to Terms & Governing Law',
      content: `CHANGES TO TERMS
Seller.pk reserves the right to modify these Terms & Conditions at any time. Updated terms will be published on the platform.

GOVERNING LAW
These Terms & Conditions are governed by the laws of the Islamic Republic of Pakistan.`
    }
  ];

  const faqs = [
    {
      question: 'How do I verify if a car is genuine?',
      answer: 'All vehicles undergo our standard inspection at the Okara yard. You can also request the inspection report and view the vehicle in person before bidding. We recommend conducting your own due diligence for high-value purchases.'
    },
    {
      question: 'What happens if I win but cannot pay within 48 hours?',
      answer: 'Failure to complete payment within 48 hours may result in forfeiture of your token deposit, temporary or permanent ban from future auctions, and the vehicle being re-listed for the next auction.'
    },
    {
      question: 'Can I get a refund if the vehicle has undisclosed issues?',
      answer: 'Once payment is completed and the vehicle is collected, we cannot process refunds for previously undisclosed issues. We strongly recommend inspecting the vehicle before bidding and reviewing the inspection report.'
    },
    {
      question: 'How are offline and online bids combined?',
      answer: 'Our auctioneer enters offline bids in real-time into the system. All bids, whether online or from the floor, are displayed in the same bid history and compete equally.'
    },
    {
      question: 'Is my token deposit safe?',
      answer: 'Yes, your token deposit is held securely and is fully refundable if you do not win any auction. It is applied to your winning bid amount if you win.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-orange-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Trust & Legal
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Understanding our platform policies, terms of service, and your rights as a buyer or seller
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Location Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 mb-8 text-white"
        >
          <div className="flex items-start gap-4">
            <Building2 className="w-8 h-8 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-xl mb-2">Physical Auction Yard</h3>
              <p className="text-white/80 mb-4">
                All vehicles are physically located at our auction yard. You are welcome to visit and inspect vehicles before bidding.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  GT Road, Near Industrial Area, Okara, Punjab
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Mon-Sat: 9:00 AM - 6:00 PM
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Sections */}
        <div className="space-y-6 mb-12">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                      <section.icon className="w-5 h-5 text-orange-600" />
                    </div>
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-slate-600 whitespace-pre-line leading-relaxed">
                    {section.content}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* FAQs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-blue-600" />
                </div>
                Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`faq-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-600">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-slate-900 rounded-2xl p-8 text-center"
        >
          <h3 className="text-xl font-bold text-white mb-4">Have Questions?</h3>
          <p className="text-slate-400 mb-6">
            Our support team is here to help with any questions about our policies or platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:03001234567" className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-colors">
              <Phone className="w-5 h-5" />
              0300-1234567
            </a>
            <a href="mailto:support@okaraauction.pk" className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-colors">
              <Mail className="w-5 h-5" />
              support@okaraauction.pk
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
```

```jsx
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  User, Phone, Mail, Shield, Wallet, Activity, Trophy,
  Clock, CheckCircle, Edit2, Save, X, AlertCircle, CreditCard,
  TrendingUp, Zap, ArrowUpRight, ArrowDownLeft, Star
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setFormData({ full_name: u.full_name || '', phone: u.phone || '', cnic: u.cnic || '' });
    }).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: wallets = [] } = useQuery({
    queryKey: ['wallet', user?.id],
    queryFn: () => base44.entities.Wallet.filter({ user_id: user.id }, '-created_date', 1),
    enabled: !!user?.id
  });

  const { data: myBets = [] } = useQuery({
    queryKey: ['myBets', user?.id],
    queryFn: () => base44.entities.Bet.filter({ user_id: user.id }, '-created_date', 50),
    enabled: !!user?.id
  });

  const { data: withdrawals = [] } = useQuery({
    queryKey: ['myWithdrawals', user?.id],
    queryFn: () => base44.entities.WithdrawalRequest.filter({ user_id: user.id }, '-created_date', 20),
    enabled: !!user?.id
  });

  const { data: securityEvents = [] } = useQuery({
    queryKey: ['mySecEvents', user?.id],
    queryFn: () => base44.entities.SecurityEvent.filter({ user_id: user.id }, '-created_date', 20),
    enabled: !!user?.id
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: (updated) => {
      setUser(prev => ({ ...prev, ...updated }));
      setEditing(false);
      toast.success('Profile updated successfully');
      queryClient.invalidateQueries();
    },
    onError: () => toast.error('Failed to update profile')
  });

  const wallet = wallets[0];
  const wonBets = myBets.filter(b => b.status === 'won');
  const lostBets = myBets.filter(b => b.status === 'lost');
  const activeBets = myBets.filter(b => b.status === 'active' || b.status === 'pending');
  const totalWon = wonBets.reduce((s, b) => s + (b.actual_payout || 0), 0);
  const totalStaked = myBets.reduce((s, b) => s + (b.bet_amount || 0), 0);
  const winRate = myBets.length ? Math.round((wonBets.length / myBets.length) * 100) : 0;

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#FFA602] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-8 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 mb-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFA602]/10 rounded-full -translate-y-32 translate-x-32" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative">
            <div className="w-20 h-20 bg-gradient-to-br from-[#FFA602] to-amber-500 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-lg">
              {user.full_name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-white">{user.full_name}</h1>
                {user.role === 'admin' && (
                  <Badge className="bg-red-500 text-white border-0"><Shield className="w-3 h-3 mr-1" />Admin</Badge>
                )}
                {user.is_verified && (
                  <Badge className="bg-emerald-500 text-white border-0"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>
                )}
              </div>
              <p className="text-slate-400 text-sm">{user.email}</p>
              <p className="text-slate-500 text-xs mt-1">Member since {user.created_date ? format(new Date(user.created_date), 'MMMM yyyy') : 'N/A'}</p>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <div className="text-right">
                <p className="text-slate-400 text-xs">Wallet Balance</p>
                <p className="text-2xl font-bold text-[#FFA602]">PKR {wallet?.available_balance?.toLocaleString() || '0'}</p>
              </div>
              {wallet?.is_frozen && (
                <Badge className="bg-red-500 text-white border-0"><AlertCircle className="w-3 h-3 mr-1" />Frozen</Badge>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
            {[
              { label: 'Total Bets', value: myBets.length, icon: Zap, color: 'text-[#FFA602]' },
              { label: 'Win Rate', value: `${winRate}%`, icon: Trophy, color: 'text-emerald-400' },
              { label: 'Total Staked', value: `₨${(totalStaked / 1000).toFixed(0)}K`, icon: TrendingUp, color: 'text-blue-400' },
              { label: 'Total Won', value: `₨${(totalWon / 1000).toFixed(0)}K`, icon: Star, color: 'text-amber-400' }
            ].map((s, i) => (
              <div key={i} className="text-center">
                <s.icon className={`w-5 h-5 mx-auto mb-1 ${s.color}`} />
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-slate-500 text-xs">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <Tabs defaultValue="personal">
          <TabsList className="bg-white border border-slate-200 mb-6 w-full sm:w-auto">
            <TabsTrigger value="personal"><User className="w-4 h-4 mr-1" />Personal Info</TabsTrigger>
            <TabsTrigger value="transactions"><CreditCard className="w-4 h-4 mr-1" />Transactions</TabsTrigger>
            <TabsTrigger value="bets"><Zap className="w-4 h-4 mr-1" />Bet History</TabsTrigger>
            <TabsTrigger value="security"><Shield className="w-4 h-4 mr-1" />Security</TabsTrigger>
          </TabsList>

          {/* Personal Info */}
          <TabsContent value="personal">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-[#FFA602]" />
                  Personal Information
                </CardTitle>
                {!editing ? (
                  <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                    <Edit2 className="w-4 h-4 mr-1" /> Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-[#FFA602] hover:bg-amber-500"
                      onClick={() => updateMutation.mutate(formData)}
                      disabled={updateMutation.isPending}>
                      <Save className="w-4 h-4 mr-1" /> Save
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-500 text-xs">Full Name</Label>
                    {editing ? (
                      <Input value={formData.full_name} onChange={e => setFormData(p => ({ ...p, full_name: e.target.value }))} className="mt-1" />
                    ) : (
                      <p className="font-medium text-slate-900 mt-1">{user.full_name || '—'}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-slate-500 text-xs">Email Address</Label>
                    <p className="font-medium text-slate-900 mt-1 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400" />
                      {user.email}
                    </p>
                  </div>
                  <div>
                    <Label className="text-slate-500 text-xs">Phone Number</Label>
                    {editing ? (
                      <Input value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} placeholder="03XX-XXXXXXX" className="mt-1" />
                    ) : (
                      <p className="font-medium text-slate-900 mt-1 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-400" />
                        {user.phone || <span className="text-slate-400 text-sm">Not provided</span>}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-slate-500 text-xs">CNIC Number</Label>
                    {editing ? (
                      <Input value={formData.cnic} onChange={e => setFormData(p => ({ ...p, cnic: e.target.value }))} placeholder="XXXXX-XXXXXXX-X" className="mt-1" />
                    ) : (
                      <p className="font-medium text-slate-900 mt-1">
                        {user.cnic ? `${user.cnic.slice(0, 5)}-XXXXXXX-X` : <span className="text-slate-400 text-sm">Not provided</span>}
                      </p>
                    )}
                  </div>
                </div>

                {!user.phone && (
                  <Alert className="bg-amber-50 border-amber-200">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <AlertDescription className="text-amber-700 text-sm">
                      Add your phone number for OTP verification and security deposits.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions */}
          <TabsContent value="transactions">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-[#FFA602]" />
                    Wallet Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                    <div className="bg-emerald-50 rounded-xl p-4">
                      <p className="text-xs text-slate-500 mb-1">Available</p>
                      <p className="text-xl font-bold text-emerald-600">PKR {wallet?.available_balance?.toLocaleString() || '0'}</p>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-4">
                      <p className="text-xs text-slate-500 mb-1">Locked</p>
                      <p className="text-xl font-bold text-amber-600">PKR {wallet?.locked_balance?.toLocaleString() || '0'}</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4">
                      <p className="text-xs text-slate-500 mb-1">Total Deposited</p>
                      <p className="text-xl font-bold text-blue-600">PKR {wallet?.lifetime_deposit?.toLocaleString() || '0'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ArrowUpRight className="w-4 h-4 text-red-500" />
                    Withdrawal History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {withdrawals.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <Clock className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No withdrawal history</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {withdrawals.map(w => (
                        <div key={w.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div>
                            <p className="font-medium text-sm">PKR {w.amount?.toLocaleString()}</p>
                            <p className="text-xs text-slate-500 capitalize">{w.payment_method?.replace('_', ' ')} • {format(new Date(w.created_date), 'MMM d, yyyy')}</p>
                          </div>
                          <Badge className={
                            w.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                            w.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            w.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                            'bg-blue-100 text-blue-700'
                          }>{w.status}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Bet History */}
          <TabsContent value="bets">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#FFA602]" />
                  Betting History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-blue-600">{activeBets.length}</p>
                    <p className="text-xs text-slate-500">Active</p>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-emerald-600">{wonBets.length}</p>
                    <p className="text-xs text-slate-500">Won</p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-red-600">{lostBets.length}</p>
                    <p className="text-xs text-slate-500">Lost</p>
                  </div>
                </div>

                {myBets.length === 0 ? (
                  <div className="text-center py-10 text-slate-400">
                    <Zap className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No bets placed yet</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {myBets.map(bet => (
                      <div key={bet.id} className={`flex items-center justify-between p-3 rounded-xl border ${
                        bet.status === 'won' ? 'bg-emerald-50 border-emerald-200' :
                        bet.status === 'lost' ? 'bg-red-50 border-red-200' :
                        bet.status === 'active' ? 'bg-blue-50 border-blue-200' :
                        'bg-slate-50 border-slate-200'
                      }`}>
                        <div>
                          <p className="font-semibold text-sm">PKR {bet.bet_amount?.toLocaleString()}</p>
                          <p className="text-xs text-slate-500">{format(new Date(bet.created_date), 'MMM d, yyyy h:mm a')}</p>
                          {bet.admin_adjusted && <Badge className="bg-purple-100 text-purple-700 text-xs mt-1">Admin Adjusted</Badge>}
                        </div>
                        <div className="text-right">
                          {bet.actual_payout > 0 && (
                            <p className="text-emerald-600 font-bold text-sm">+PKR {bet.actual_payout?.toLocaleString()}</p>
                          )}
                          <Badge className={
                            bet.status === 'won' ? 'bg-emerald-100 text-emerald-700' :
                            bet.status === 'lost' ? 'bg-red-100 text-red-700' :
                            bet.status === 'active' ? 'bg-blue-100 text-blue-700' :
                            'bg-slate-100 text-slate-600'
                          }>{bet.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[#FFA602]" />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${wallet?.two_fa_enabled ? 'bg-emerald-100' : 'bg-slate-200'}`}>
                        <Shield className={`w-5 h-5 ${wallet?.two_fa_enabled ? 'text-emerald-600' : 'text-slate-400'}`} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Two-Factor Authentication</p>
                        <p className="text-xs text-slate-500">Extra security for withdrawals</p>
                      </div>
                    </div>
                    <Badge className={wallet?.two_fa_enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}>
                      {wallet?.two_fa_enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${wallet?.is_frozen ? 'bg-red-100' : 'bg-emerald-100'}`}>
                        <Activity className={`w-5 h-5 ${wallet?.is_frozen ? 'text-red-600' : 'text-emerald-600'}`} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Wallet Status</p>
                        <p className="text-xs text-slate-500">Current account standing</p>
                      </div>
                    </div>
                    <Badge className={wallet?.is_frozen ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}>
                      {wallet?.is_frozen ? 'Frozen' : 'Active'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#FFA602]" />
                    Recent Security Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {securityEvents.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <CheckCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No security events</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {securityEvents.map(e => (
                        <div key={e.id} className="flex items-start justify-between p-3 bg-slate-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium capitalize">{e.event_type?.replace(/_/g, ' ')}</p>
                            <p className="text-xs text-slate-500">{e.details}</p>
                            <p className="text-xs text-slate-400">{format(new Date(e.created_date), 'MMM d, h:mm a')}</p>
                          </div>
                          <Badge className={
                            e.severity === 'critical' ? 'bg-red-100 text-red-700' :
                            e.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                            e.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                            'bg-blue-100 text-blue-700'
                          }>{e.severity}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
```

```jsx
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  User, Camera, Bell, Mail, Phone, MapPin, Shield, Save,
  CheckCircle, Upload, Lock, Smartphone, MessageSquare, History
} from 'lucide-react';
import SoldHistory from '@/components/profile/SoldHistory';
import PushNotificationManager from '@/components/notifications/PushNotificationManager';

export default function UserSettings() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    full_name: '',
    phone: '',
    address: '',
    city: '',
    profile_picture: ''
  });
  const [notifications, setNotifications] = useState({
    email_outbid: true,
    email_auction_won: true,
    email_auction_reminder: true,
    push_outbid: true,
    push_auction_won: true,
    push_auction_reminder: true,
    sms_payment_due: true
  });
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      setProfile({
        full_name: u.full_name || '',
        phone: u.phone || '',
        address: u.address || '',
        city: u.city || '',
        profile_picture: u.profile_picture || ''
      });
      setNotifications(u.notification_preferences || notifications);
    }).catch(() => {});
  }, []);

  const updateProfileMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setProfile({ ...profile, profile_picture: file_url });
    setUploading(false);
  };

  const handleSaveProfile = () => {
    updateProfileMutation.mutate({
      ...profile,
      notification_preferences: notifications
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Account Settings</h1>
          <p className="text-slate-400">Manage your profile and preferences</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {saved && (
          <Alert className="mb-6 bg-emerald-50 border-emerald-200">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <AlertDescription className="text-emerald-800">Settings saved successfully!</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="profile">
          <TabsList className="mb-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Personal Information
                </CardTitle>
                <CardDescription>Update your profile details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={profile.profile_picture} />
                      <AvatarFallback className="bg-primary text-white text-2xl">
                        {profile.full_name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg">
                      <Camera className="w-4 h-4" />
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{profile.full_name || 'Your Name'}</p>
                    <p className="text-sm text-slate-500">{user?.email}</p>
                    {uploading && <p className="text-sm text-primary mt-1">Uploading...</p>}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name</Label>
                    <Input
                      value={profile.full_name}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      placeholder="Enter your full name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Phone Number</Label>
                    <Input
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      placeholder="e.g. 0300-1234567"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>City</Label>
                    <Input
                      value={profile.city}
                      onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                      placeholder="e.g. Lahore"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input value={user?.email || ''} disabled className="mt-1 bg-slate-100" />
                  </div>
                </div>

                <div>
                  <Label>Full Address</Label>
                  <Textarea
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    placeholder="Enter your complete address"
                    className="mt-1"
                  />
                </div>

                <Button onClick={handleSaveProfile} disabled={updateProfileMutation.isPending} className="bg-primary hover:bg-primary/90">
                  <Save className="w-4 h-4 mr-2" />
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>Choose how you want to be notified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email Notifications */}
                <div>
                  <h4 className="font-medium text-slate-900 flex items-center gap-2 mb-4">
                    <Mail className="w-4 h-4 text-slate-500" />
                    Email Notifications
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">Outbid Alerts</p>
                        <p className="text-xs text-slate-500">Get notified when someone outbids you</p>
                      </div>
                      <Switch checked={notifications.email_outbid} onCheckedChange={(v) => setNotifications({ ...notifications, email_outbid: v })} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">Auction Won</p>
                        <p className="text-xs text-slate-500">Confirmation when you win an auction</p>
                      </div>
                      <Switch checked={notifications.email_auction_won} onCheckedChange={(v) => setNotifications({ ...notifications, email_auction_won: v })} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">Auction Reminders</p>
                        <p className="text-xs text-slate-500">Reminders for upcoming auctions</p>
                      </div>
                      <Switch checked={notifications.email_auction_reminder} onCheckedChange={(v) => setNotifications({ ...notifications, email_auction_reminder: v })} />
                    </div>
                  </div>
                </div>

                {/* Push Notifications */}
                <div className="pt-4 border-t">
                  <h4 className="font-medium text-slate-900 flex items-center gap-2 mb-4">
                    <Smartphone className="w-4 h-4 text-slate-500" />
                    Push Notifications
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">Outbid Alerts</p>
                        <p className="text-xs text-slate-500">Real-time browser notifications</p>
                      </div>
                      <Switch checked={notifications.push_outbid} onCheckedChange={(v) => setNotifications({ ...notifications, push_outbid: v })} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">Auction Won</p>
                        <p className="text-xs text-slate-500">Instant notification when you win</p>
                      </div>
                      <Switch checked={notifications.push_auction_won} onCheckedChange={(v) => setNotifications({ ...notifications, push_auction_won: v })} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">Auction Reminders</p>
                        <p className="text-xs text-slate-500">Before auction starts</p>
                      </div>
                      <Switch checked={notifications.push_auction_reminder} onCheckedChange={(v) => setNotifications({ ...notifications, push_auction_reminder: v })} />
                    </div>
                  </div>
                </div>

                {/* SMS Notifications */}
                <div className="pt-4 border-t">
                  <h4 className="font-medium text-slate-900 flex items-center gap-2 mb-4">
                    <MessageSquare className="w-4 h-4 text-slate-500" />
                    SMS Notifications
                  </h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Payment Due Reminders</p>
                      <p className="text-xs text-slate-500">SMS when payment is due after winning</p>
                    </div>
                    <Switch checked={notifications.sms_payment_due} onCheckedChange={(v) => setNotifications({ ...notifications, sms_payment_due: v })} />
                  </div>
                </div>

                {/* Push Notifications */}
                <div className="pt-4 border-t">
                  <h4 className="font-medium text-slate-900 mb-4">Browser Push Notifications</h4>
                  <PushNotificationManager userId={user?.id} />
                </div>

                <Button onClick={handleSaveProfile} disabled={updateProfileMutation.isPending} className="bg-primary hover:bg-primary/90">
                  <Save className="w-4 h-4 mr-2" />
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <SoldHistory userId={user?.id} userType={user?.user_type} />
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Security & Verification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-xl border ${user?.cnic_verified ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {user?.cnic_verified ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <Shield className="w-5 h-5 text-amber-600" />}
                      <p className="font-medium">{user?.cnic_verified ? 'CNIC Verified' : 'CNIC Pending'}</p>
                    </div>
                    <p className="text-sm text-slate-500">CNIC: {user?.cnic || 'Not provided'}</p>
                  </div>
                  <div className={`p-4 rounded-xl border ${user?.phone_verified ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {user?.phone_verified ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <Phone className="w-5 h-5 text-amber-600" />}
                      <p className="font-medium">{user?.phone_verified ? 'Phone Verified' : 'Phone Pending'}</p>
                    </div>
                    <p className="text-sm text-slate-500">Phone: {user?.phone || 'Not provided'}</p>
                  </div>
                </div>

                <Alert className="bg-blue-50 border-blue-200">
                  <Lock className="w-4 h-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    Your account is protected with secure authentication. Contact support if you need to change your email or CNIC.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
```

```jsx
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Wallet, ArrowDownLeft, ArrowUpRight, Shield, TrendingUp,
  Lock, AlertCircle, RefreshCw, Clock
} from 'lucide-react';
import TwoFactorSetup from '@/components/wallet/TwoFactorSetup';
import WithdrawalForm from '@/components/wallet/WithdrawalForm';
import { format } from 'date-fns';

export default function WalletDashboard() {
  const [user, setUser] = useState(null);
  const [showWithdrawal, setShowWithdrawal] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: wallets = [], isLoading, refetch } = useQuery({
    queryKey: ['wallet', user?.id],
    queryFn: () => base44.entities.Wallet.filter({ user_id: user.id }, '-created_date', 1),
    enabled: !!user?.id
  });

  const { data: events = [] } = useQuery({
    queryKey: ['mySecurityEvents', user?.id],
    queryFn: () => base44.entities.SecurityEvent.filter({ user_id: user.id }, '-created_date', 20),
    enabled: !!user?.id
  });

  const { data: withdrawals = [] } = useQuery({
    queryKey: ['myWithdrawals', user?.id],
    queryFn: () => base44.entities.WithdrawalRequest.filter({ user_id: user.id }, '-created_date', 20),
    enabled: !!user?.id
  });

  const wallet = wallets[0];

  const handleWalletUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ['wallet', user?.id] });
  };

  const statusBadge = (status) => {
    const map = {
      pending: 'bg-amber-100 text-amber-700',
      under_review: 'bg-blue-100 text-blue-700',
      approved: 'bg-emerald-100 text-emerald-700',
      rejected: 'bg-red-100 text-red-700',
      completed: 'bg-slate-100 text-slate-700',
      processing: 'bg-purple-100 text-purple-700',
      failed: 'bg-red-100 text-red-700'
    };
    return map[status] || 'bg-slate-100 text-slate-700';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Wallet className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 mb-4">Please sign in to access your wallet</p>
          <Button onClick={() => base44.auth.redirectToLogin()} className="bg-[#FFA602] hover:bg-amber-500">Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-[#FFA602]/20 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-[#FFA602]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">My Wallet</h1>
              <p className="text-slate-400">Manage your funds & withdrawals</p>
            </div>
          </div>

          {/* Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10">
              <p className="text-slate-400 text-sm mb-1">Available Balance</p>
              <p className="text-3xl font-bold text-white">PKR {wallet?.available_balance?.toLocaleString() || '0'}</p>
              <Badge className="mt-2 bg-emerald-500/20 text-emerald-300 border-0">Ready to use</Badge>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10">
              <p className="text-slate-400 text-sm mb-1 flex items-center gap-1"><Lock className="w-3 h-3" /> Locked Balance</p>
              <p className="text-3xl font-bold text-white">PKR {wallet?.locked_balance?.toLocaleString() || '0'}</p>
              <Badge className="mt-2 bg-amber-500/20 text-amber-300 border-0">Pending withdrawal</Badge>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10">
              <p className="text-slate-400 text-sm mb-1">Total Withdrawn</p>
              <p className="text-3xl font-bold text-white">PKR {wallet?.total_withdrawn?.toLocaleString() || '0'}</p>
              <Badge className="mt-2 bg-slate-500/20 text-slate-300 border-0">All time</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button className="bg-[#FFA602] hover:bg-amber-500 flex-1 md:flex-none">
            <ArrowDownLeft className="w-4 h-4 mr-2" /> Deposit Funds
          </Button>
          <Button
            variant="outline"
            className="flex-1 md:flex-none border-slate-300"
            onClick={() => setShowWithdrawal(true)}
            disabled={!wallet || wallet.available_balance < 500}
          >
            <ArrowUpRight className="w-4 h-4 mr-2" /> Withdraw
          </Button>
          <Button variant="ghost" size="icon" onClick={refetch}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {wallet?.is_frozen && (
          <Alert className="bg-red-50 border-red-200">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-700">
              <strong>Account Frozen:</strong> Your wallet has been suspended. Contact support for assistance.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="security">
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="security">Security & 2FA</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
          </TabsList>

          <TabsContent value="security" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#FFA602]" />
                  Wallet Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <TwoFactorSetup wallet={wallet} user={user} onUpdate={handleWalletUpdate} />

                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-sm font-semibold text-blue-800 mb-2">Security Tips</p>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Enable 2FA for maximum wallet protection</li>
                    <li>• Never share your OTP with anyone</li>
                    <li>• Verify withdrawal account details carefully</li>
                    <li>• Report suspicious activity immediately</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdrawals" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpRight className="w-5 h-5 text-[#FFA602]" />
                  Withdrawal History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {withdrawals.length > 0 ? (
                  <div className="space-y-3">
                    {withdrawals.map((w) => (
                      <div key={w.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <div>
                          <p className="font-semibold text-slate-900">PKR {w.amount?.toLocaleString()}</p>
                          <p className="text-sm text-slate-500 capitalize">{w.payment_method?.replace('_', ' ')} • {w.account_details}</p>
                          <p className="text-xs text-slate-400">{format(new Date(w.created_date), 'MMM d, yyyy h:mm a')}</p>
                          {w.admin_remarks && <p className="text-xs text-slate-600 mt-1">Remarks: {w.admin_remarks}</p>}
                        </div>
                        <div className="text-right">
                          <Badge className={statusBadge(w.status)}>
                            {w.status?.replace('_', ' ')}
                          </Badge>
                          <p className="text-xs text-slate-500 mt-1">Net: PKR {w.net_amount?.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-slate-400">
                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No withdrawal requests yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#FFA602]" />
                  Security Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {events.length > 0 ? (
                  <div className="space-y-2">
                    {events.map((e) => (
                      <div key={e.id} className="flex items-start justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-slate-900 capitalize">{e.event_type?.replace(/_/g, ' ')}</p>
                          <p className="text-xs text-slate-500">{e.details}</p>
                          <p className="text-xs text-slate-400">{format(new Date(e.created_date), 'MMM d, yyyy h:mm a')}</p>
                        </div>
                        <Badge className={
                          e.severity === 'critical' ? 'bg-red-100 text-red-700' :
                          e.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                          e.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }>{e.severity}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-slate-400">
                    <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No activity yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <WithdrawalForm
        open={showWithdrawal}
        onClose={() => setShowWithdrawal(false)}
        wallet={wallet}
        user={user}
      />
    </div>
  );
}
```

```jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Heart, HeartOff, Car, Clock, Gavel, TrendingUp, Eye, Bell, Trash2, Scale, ArrowRight
} from 'lucide-react';
import CountdownTimer from '@/components/auction/CountdownTimer';

export default function Watchlist() {
  const [user, setUser] = useState(null);
  const [compareCars, setCompareCars] = useState([]);
  const queryClient = useQueryClient();
  
  const toggleCompare = (carId) => {
    setCompareCars(prev => 
      prev.includes(carId) 
        ? prev.filter(id => id !== carId)
        : prev.length < 3 ? [...prev, carId] : prev
    );
  };

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const watchlistIds = user?.watchlist || [];

  const { data: watchedCars = [] } = useQuery({
    queryKey: ['watchedCars', watchlistIds],
    queryFn: async () => {
      if (watchlistIds.length === 0) return [];
      const allCars = await base44.entities.Car.list('-created_date', 100);
      return allCars.filter(car => watchlistIds.includes(car.id));
    },
    enabled: watchlistIds.length > 0
  });

  const removeFromWatchlistMutation = useMutation({
    mutationFn: async (carId) => {
      const newWatchlist = (user?.watchlist || []).filter(id => id !== carId);
      await base44.auth.updateMe({ watchlist: newWatchlist });
      return newWatchlist;
    },
    onSuccess: (newWatchlist) => {
      setUser({ ...user, watchlist: newWatchlist });
      queryClient.invalidateQueries({ queryKey: ['watchedCars'] });
    }
  });

  // Sample data
  const sampleCars = watchedCars.length > 0 ? watchedCars : [
    { id: 1, make: 'Toyota', model: 'Corolla', year: 2022, current_bid: 3850000, starting_bid: 3200000, status: 'in_auction', condition: 'excellent', images: ['https://images.unsplash.com/photo-1590362891991-f776e747a588?w=600'] },
    { id: 2, make: 'Honda', model: 'Civic', year: 2021, current_bid: 2950000, starting_bid: 2500000, status: 'in_auction', condition: 'good', images: ['https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600'] },
    { id: 3, make: 'BMW', model: '3 Series', year: 2020, current_bid: 6500000, starting_bid: 6000000, status: 'in_auction', condition: 'excellent', images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600'] }
  ];

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
            <Link to={createPageUrl('CompareVehicles')}>
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
              <Link to={createPageUrl('LiveAuction')}>
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
                          onClick={() => removeFromWatchlistMutation.mutate(car.id)}
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
                        <Link to={createPageUrl('CarDetail') + `?id=${car.id}`} className="flex-1">
                          <Button variant="outline" className="w-full">
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                        </Link>
                        <Link to={createPageUrl('CarDetail') + `?id=${car.id}`} className="flex-1">
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
```

## components

```jsx
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Search, RefreshCw, Gavel, XCircle, Edit, TrendingUp,
  User, Activity, Filter, CheckCircle, AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const statusConfig = {
  pending: { color: 'bg-amber-100 text-amber-700', label: 'Pending' },
  active: { color: 'bg-blue-100 text-blue-700', label: 'Active' },
  won: { color: 'bg-emerald-100 text-emerald-700', label: 'Won' },
  lost: { color: 'bg-red-100 text-red-700', label: 'Lost' },
  cancelled: { color: 'bg-slate-100 text-slate-600', label: 'Cancelled' },
  adjusted: { color: 'bg-purple-100 text-purple-700', label: 'Adjusted' }
};

export default function BetManagement({ adminUser }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedBet, setSelectedBet] = useState(null);
  const [actionType, setActionType] = useState(''); // 'cancel' | 'adjust'
  const [adjustData, setAdjustData] = useState({ outcome: '', payout: '', notes: '' });
  const queryClient = useQueryClient();

  const { data: bets = [], isLoading, refetch } = useQuery({
    queryKey: ['allBets'],
    queryFn: () => base44.entities.Bet.list('-created_date', 200),
    refetchInterval: 10000
  });

  // Real-time subscription
  useEffect(() => {
    const unsub = base44.entities.Bet.subscribe((event) => {
      queryClient.invalidateQueries({ queryKey: ['allBets'] });
    });
    return unsub;
  }, [queryClient]);

  const cancelBetMutation = useMutation({
    mutationFn: async ({ bet, notes }) => {
      // Refund wallet balance
      const wallets = await base44.entities.Wallet.filter({ user_id: bet.user_id }, '-created_date', 1);
      if (wallets.length > 0) {
        await base44.entities.Wallet.update(wallets[0].id, {
          available_balance: wallets[0].available_balance + bet.bet_amount
        });
      }
      await base44.entities.Bet.update(bet.id, {
        status: 'cancelled',
        outcome: 'cancelled',
        admin_adjusted: true,
        admin_id: adminUser?.id,
        admin_notes: notes,
        cancelled_at: new Date().toISOString()
      });
      await base44.entities.AdminLog.create({
        admin_id: adminUser?.id,
        admin_name: adminUser?.full_name,
        action: 'bet_cancelled',
        target_entity: 'Bet',
        target_id: bet.id,
        target_user_id: bet.user_id,
        details: `Cancelled bet of PKR ${bet.bet_amount?.toLocaleString()}. Notes: ${notes}`,
        before_state: JSON.stringify({ status: bet.status }),
        after_state: JSON.stringify({ status: 'cancelled' })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allBets'] });
      toast.success('Bet cancelled and balance refunded');
      setSelectedBet(null);
    }
  });

  const adjustBetMutation = useMutation({
    mutationFn: async ({ bet, outcome, payout, notes }) => {
      const payoutAmount = parseFloat(payout) || 0;
      if (payoutAmount > 0) {
        const wallets = await base44.entities.Wallet.filter({ user_id: bet.user_id }, '-created_date', 1);
        if (wallets.length > 0) {
          await base44.entities.Wallet.update(wallets[0].id, {
            available_balance: wallets[0].available_balance + payoutAmount
          });
        }
      }
      await base44.entities.Bet.update(bet.id, {
        status: 'adjusted',
        outcome,
        actual_payout: payoutAmount,
        admin_adjusted: true,
        admin_id: adminUser?.id,
        admin_notes: notes,
        resolved_at: new Date().toISOString()
      });
      await base44.entities.AdminLog.create({
        admin_id: adminUser?.id,
        admin_name: adminUser?.full_name,
        action: 'bet_adjusted',
        target_entity: 'Bet',
        target_id: bet.id,
        target_user_id: bet.user_id,
        details: `Adjusted bet to outcome: ${outcome}, payout: PKR ${payoutAmount.toLocaleString()}. Notes: ${notes}`,
        before_state: JSON.stringify({ status: bet.status, outcome: bet.outcome }),
        after_state: JSON.stringify({ status: 'adjusted', outcome, actual_payout: payoutAmount })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allBets'] });
      toast.success('Bet outcome adjusted and wallet updated');
      setSelectedBet(null);
      setAdjustData({ outcome: '', payout: '', notes: '' });
    }
  });

  const filtered = bets.filter(bet => {
    if (statusFilter !== 'all' && bet.status !== statusFilter) return false;
    if (search && !bet.user_name?.toLowerCase().includes(search.toLowerCase()) && !bet.user_id?.includes(search)) return false;
    if (dateFilter === 'today') {
      const today = new Date().toDateString();
      if (new Date(bet.created_date).toDateString() !== today) return false;
    } else if (dateFilter === 'week') {
      if (Date.now() - new Date(bet.created_date).getTime() > 7 * 86400000) return false;
    }
    return true;
  });

  const totalBetAmount = filtered.reduce((s, b) => s + (b.bet_amount || 0), 0);
  const totalPayout = filtered.reduce((s, b) => s + (b.actual_payout || 0), 0);
  const wonCount = filtered.filter(b => b.status === 'won' || b.outcome === 'win').length;

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Bets', value: filtered.length, color: 'text-slate-900' },
          { label: 'Total Staked', value: `PKR ${totalBetAmount.toLocaleString()}`, color: 'text-blue-600' },
          { label: 'Total Payouts', value: `PKR ${totalPayout.toLocaleString()}`, color: 'text-emerald-600' },
          { label: 'Win Rate', value: `${filtered.length ? Math.round(wonCount / filtered.length * 100) : 0}%`, color: 'text-purple-600' }
        ].map(s => (
          <Card key={s.label} className="border-slate-200">
            <CardContent className="pt-4 pb-3">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search by user..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="won">Won</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="adjusted">Adjusted</SelectItem>
          </SelectContent>
        </Select>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Date" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={refetch}><RefreshCw className="w-4 h-4" /></Button>
      </div>

      {/* Bet List */}
      <div className="space-y-2">
        {isLoading ? (
          [...Array(5)].map((_, i) => <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />)
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Gavel className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No bets found</p>
          </div>
        ) : filtered.map(bet => {
          const cfg = statusConfig[bet.status] || statusConfig.pending;
          return (
            <div key={bet.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900 text-sm">{bet.user_name || bet.user_id?.slice(0, 8)}</p>
                    {bet.admin_adjusted && <Badge className="bg-purple-100 text-purple-700 text-xs">Admin Adj.</Badge>}
                  </div>
                  <p className="text-xs text-slate-500">
                    PKR {bet.bet_amount?.toLocaleString()} × {bet.multiplier}x = PKR {bet.potential_payout?.toLocaleString()} potential
                    {' • '}{format(new Date(bet.created_date), 'MMM d, h:mm a')}
                  </p>
                  {bet.admin_notes && <p className="text-xs text-purple-600 mt-0.5">Note: {bet.admin_notes}</p>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {bet.actual_payout > 0 && (
                  <span className="text-sm font-semibold text-emerald-600">+PKR {bet.actual_payout?.toLocaleString()}</span>
                )}
                <Badge className={cfg.color}>{cfg.label}</Badge>
                {(bet.status === 'pending' || bet.status === 'active') && (
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="text-red-600 border-red-200 h-8"
                      onClick={() => { setSelectedBet(bet); setActionType('cancel'); }}>
                      <XCircle className="w-3 h-3 mr-1" /> Cancel
                    </Button>
                    <Button size="sm" variant="outline" className="text-purple-600 border-purple-200 h-8"
                      onClick={() => { setSelectedBet(bet); setActionType('adjust'); setAdjustData({ outcome: '', payout: bet.potential_payout?.toString(), notes: '' }); }}>
                      <Edit className="w-3 h-3 mr-1" /> Adjust
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cancel Dialog */}
      <Dialog open={!!selectedBet && actionType === 'cancel'} onOpenChange={() => setSelectedBet(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><XCircle className="w-5 h-5 text-red-500" />Cancel Bet</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              Cancelling will refund <strong>PKR {selectedBet?.bet_amount?.toLocaleString()}</strong> to {selectedBet?.user_name}'s wallet.
            </div>
            <div>
              <Label>Reason / Admin Notes *</Label>
              <Textarea placeholder="Reason for cancellation..." value={adjustData.notes} onChange={e => setAdjustData(p => ({ ...p, notes: e.target.value }))} className="mt-1 h-24" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedBet(null)}>Back</Button>
            <Button className="bg-red-600 hover:bg-red-700" disabled={!adjustData.notes || cancelBetMutation.isPending}
              onClick={() => cancelBetMutation.mutate({ bet: selectedBet, notes: adjustData.notes })}>
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Adjust Dialog */}
      <Dialog open={!!selectedBet && actionType === 'adjust'} onOpenChange={() => setSelectedBet(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Edit className="w-5 h-5 text-purple-500" />Adjust Bet Outcome</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-sm text-purple-700">
              Bet by <strong>{selectedBet?.user_name}</strong> — PKR {selectedBet?.bet_amount?.toLocaleString()} staked
            </div>
            <div>
              <Label>Outcome *</Label>
              <Select value={adjustData.outcome} onValueChange={v => setAdjustData(p => ({ ...p, outcome: v }))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select outcome" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="win">Win (credit payout to wallet)</SelectItem>
                  <SelectItem value="loss">Loss (no payout)</SelectItem>
                  <SelectItem value="cancelled">Cancelled (refund stake)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {adjustData.outcome === 'win' && (
              <div>
                <Label>Payout Amount (PKR)</Label>
                <Input type="number" value={adjustData.payout} onChange={e => setAdjustData(p => ({ ...p, payout: e.target.value }))} className="mt-1" />
              </div>
            )}
            <div>
              <Label>Admin Notes *</Label>
              <Textarea placeholder="Reason for adjustment..." value={adjustData.notes} onChange={e => setAdjustData(p => ({ ...p, notes: e.target.value }))} className="mt-1 h-20" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedBet(null)}>Back</Button>
            <Button className="bg-purple-600 hover:bg-purple-700"
              disabled={!adjustData.outcome || !adjustData.notes || adjustBetMutation.isPending}
              onClick={() => adjustBetMutation.mutate({
                bet: selectedBet,
                outcome: adjustData.outcome,
                payout: adjustData.outcome === 'win' ? adjustData.payout : adjustData.outcome === 'cancelled' ? selectedBet?.bet_amount : 0,
                notes: adjustData.notes
              })}>
              Apply Adjustment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

```jsx
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  DollarSign, Clock, CheckCircle, XCircle, AlertTriangle, 
  ArrowRight, Shield, Eye, Loader2, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const statusConfig = {
  pending: { color: 'bg-amber-100 text-amber-700', label: 'Pending Payment' },
  in_escrow: { color: 'bg-blue-100 text-blue-700', label: 'In Escrow' },
  released_to_seller: { color: 'bg-emerald-100 text-emerald-700', label: 'Released to Seller' },
  refunded_to_buyer: { color: 'bg-purple-100 text-purple-700', label: 'Refunded to Buyer' },
  disputed: { color: 'bg-red-100 text-red-700', label: 'Disputed' }
};

export default function EscrowManagement({ adminUser }) {
  const [selectedEscrow, setSelectedEscrow] = useState(null);
  const [action, setAction] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const queryClient = useQueryClient();

  const { data: escrows = [], isLoading } = useQuery({
    queryKey: ['escrows'],
    queryFn: () => base44.entities.EscrowPayment.list('-created_date', 100),
    refetchInterval: 30000
  });

  const { data: disputes = [] } = useQuery({
    queryKey: ['disputesEscrow'],
    queryFn: () => base44.entities.Dispute.filter({ status: 'open' }, '-created_date', 50)
  });

  const updateEscrowMutation = useMutation({
    mutationFn: ({ id, status, notes }) => base44.entities.EscrowPayment.update(id, {
      status,
      notes,
      release_date: new Date().toISOString()
    }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['escrows'] });
      toast.success(`Payment ${vars.status === 'released_to_seller' ? 'released to seller' : 'refunded to buyer'}`);
      setSelectedEscrow(null);
      setAdminNotes('');
    }
  });

  const resolveDisputeMutation = useMutation({
    mutationFn: ({ id, status, notes }) => base44.entities.Dispute.update(id, {
      status,
      resolution_notes: notes,
      admin_assigned: adminUser?.id,
      resolved_date: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disputesEscrow'] });
      toast.success('Dispute resolved');
    }
  });

  const filtered = escrows.filter(e => filterStatus === 'all' || e.status === filterStatus);

  const stats = [
    { label: 'Total Escrow', value: escrows.length, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pending', value: escrows.filter(e => e.status === 'pending' || e.status === 'in_escrow').length, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Open Disputes', value: disputes.length, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Released', value: escrows.filter(e => e.status === 'released_to_seller').length, color: 'text-emerald-600', bg: 'bg-emerald-50' }
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label} className={s.bg + ' border-0'}>
            <CardContent className="pt-4 pb-3">
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-sm text-slate-600">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Flow Diagram */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-xl border border-blue-200">
        <p className="text-xs text-slate-500 mb-3 font-semibold uppercase tracking-wide">Payment Flow</p>
        <div className="flex items-center gap-2 flex-wrap">
          {['Buyer Wins Auction', 'Buyer Pays Platform', 'Held in Escrow', 'Vehicle Delivered', 'Released to Seller'].map((step, i, arr) => (
            <React.Fragment key={step}>
              <div className="px-3 py-1.5 bg-white rounded-lg border border-blue-200 text-xs font-medium text-slate-700">{step}</div>
              {i < arr.length - 1 && <ArrowRight className="w-4 h-4 text-blue-400 flex-shrink-0" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Open Disputes */}
      {disputes.length > 0 && (
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Open Disputes ({disputes.length}) — Requires Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {disputes.map(d => (
                <div key={d.id} className="flex items-start justify-between p-3 bg-white rounded-lg border border-red-200">
                  <div>
                    <p className="text-sm font-medium capitalize">{d.reason?.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{d.description?.slice(0, 100)}...</p>
                    <p className="text-xs text-slate-400 mt-0.5">Raised by: {d.raised_by}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => resolveDisputeMutation.mutate({ id: d.id, status: 'resolved_seller_favor', notes: 'Admin resolved in seller favor' })}>
                      Seller Wins
                    </Button>
                    <Button size="sm" className="bg-blue-600 text-xs" onClick={() => resolveDisputeMutation.mutate({ id: d.id, status: 'resolved_buyer_favor', notes: 'Admin resolved in buyer favor' })}>
                      Buyer Wins
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Escrow Payments List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="w-5 h-5 text-blue-600" />
              Escrow Payments
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ['escrows'] })}>
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_escrow">In Escrow</SelectItem>
                  <SelectItem value="released_to_seller">Released</SelectItem>
                  <SelectItem value="disputed">Disputed</SelectItem>
                  <SelectItem value="refunded_to_buyer">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No escrow payments found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(escrow => {
                const cfg = statusConfig[escrow.status] || statusConfig.pending;
                return (
                  <div key={escrow.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <DollarSign className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-slate-900">PKR {escrow.amount?.toLocaleString()}</p>
                          <Badge className={cfg.color + ' text-xs'}>{cfg.label}</Badge>
                        </div>
                        <p className="text-xs text-slate-500">
                          Buyer: {escrow.buyer_id?.slice(0, 12)} → Seller: {escrow.seller_id?.slice(0, 12)}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {escrow.payment_method} • Fee: PKR {escrow.platform_fee?.toLocaleString() || 0}
                          {escrow.created_date && ` • ${format(new Date(escrow.created_date), 'MMM d, yyyy')}`}
                        </p>
                      </div>
                    </div>

                    {(escrow.status === 'in_escrow' || escrow.status === 'pending') && (
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs" onClick={() => { setSelectedEscrow(escrow); setAction('release'); }}>
                          <CheckCircle className="w-3.5 h-3.5 mr-1" />
                          Release
                        </Button>
                        <Button size="sm" variant="outline" className="border-red-300 text-red-600 text-xs" onClick={() => { setSelectedEscrow(escrow); setAction('refund'); }}>
                          <XCircle className="w-3.5 h-3.5 mr-1" />
                          Refund
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={!!selectedEscrow} onOpenChange={() => { setSelectedEscrow(null); setAdminNotes(''); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === 'release' ? '✅ Release Payment to Seller' : '↩️ Refund Payment to Buyer'}
            </DialogTitle>
          </DialogHeader>
          {selectedEscrow && (
            <div className="space-y-4 py-2">
              <Alert className={action === 'release' ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}>
                <AlertDescription className="text-sm">
                  {action === 'release'
                    ? `This will release PKR ${selectedEscrow.amount?.toLocaleString()} to the seller. Only do this after confirming vehicle delivery.`
                    : `This will refund PKR ${selectedEscrow.amount?.toLocaleString()} to the buyer. The seller will NOT receive payment.`
                  }
                </AlertDescription>
              </Alert>
              <div>
                <p className="text-xs text-slate-500 mb-1">Admin Notes (required)</p>
                <Textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} placeholder="Reason for this action..." className="h-24" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedEscrow(null)}>Cancel</Button>
            <Button
              disabled={!adminNotes || updateEscrowMutation.isPending}
              className={action === 'release' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}
              onClick={() => updateEscrowMutation.mutate({
                id: selectedEscrow.id,
                status: action === 'release' ? 'released_to_seller' : 'refunded_to_buyer',
                notes: adminNotes
              })}
            >
              {updateEscrowMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirm {action === 'release' ? 'Release' : 'Refund'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

```

```jsx
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Settings, DollarSign, Percent, Users, Car, Gavel, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const FeeRow = ({ icon: IconComp, label, description, valueKey, enabledKey, settings, onChange, isCurrency = false }) => (
  <div className="flex items-start justify-between py-4">
  <div className="flex items-start gap-3 flex-1">
    <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
      <IconComp className="w-4 h-4 text-slate-600" />
      </div>
      <div className="flex-1">
        <p className="font-medium text-slate-900 text-sm">{label}</p>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        <div className="flex items-center gap-2 mt-2">
          <div className="relative">
            {isCurrency && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">PKR</span>}
            {!isCurrency && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">%</span>}
            <Input
              type="number"
              value={settings[valueKey] ?? ''}
              onChange={(e) => onChange(valueKey, parseFloat(e.target.value))}
              className={`w-36 h-8 text-sm ${isCurrency ? 'pl-10' : 'pr-8'}`}
              disabled={enabledKey && !settings[enabledKey]}
            />
          </div>
          {enabledKey && (
            <Switch
              checked={!!settings[enabledKey]}
              onCheckedChange={(v) => onChange(enabledKey, v)}
            />
          )}
        </div>
      </div>
    </div>
    {enabledKey && (
      <Badge className={settings[enabledKey] ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}>
        {settings[enabledKey] ? 'Active' : 'Off'}
      </Badge>
    )}
  </div>
);

export default function PlatformFeeSettings() {
  const queryClient = useQueryClient();
  const [localSettings, setLocalSettings] = useState(null);

  const { data: settingsList = [], isLoading } = useQuery({
    queryKey: ['platformSettings'],
    queryFn: () => base44.entities.PlatformSettings.list(),
    onSuccess: (data) => {
      if (data.length > 0 && !localSettings) {
        setLocalSettings(data[0]);
      }
    }
  });

  const settings = localSettings || settingsList[0] || {
    listing_fee: 2000,
    listing_fee_enabled: true,
    auction_commission_pct: 2,
    auction_commission_enabled: true,
    buyer_service_fee_pct: 1,
    buyer_service_fee_enabled: false,
    dealer_monthly_fee: 5000,
    dealer_yearly_fee: 50000,
    dealer_subscription_enabled: true,
    security_deposit_pct: 10,
    payment_window_hours: 48,
    timer_extension_enabled: true,
    timer_extension_trigger_seconds: 30,
    timer_extension_base_seconds: 60,
    timer_extension_per_bidder_seconds: 10
  };

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (settingsList[0]?.id) {
        return base44.entities.PlatformSettings.update(settingsList[0].id, data);
      } else {
        return base44.entities.PlatformSettings.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platformSettings'] });
      toast.success('Platform settings saved successfully');
    }
  });

  const handleChange = (key, value) => {
    setLocalSettings(prev => ({ ...(prev || settings), [key]: value }));
  };

  const handleSave = () => {
    saveMutation.mutate(localSettings || settings);
  };

  if (isLoading) return <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>;

  return (
    <div className="space-y-6">
      {/* Revenue Fees */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            Revenue & Commission Settings
          </CardTitle>
          <CardDescription>Configure how the platform earns from listings and sales</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-slate-100">
          <FeeRow
            icon={Car}
            label="Vehicle Listing Fee"
            description="Fixed fee charged per vehicle listed for auction"
            valueKey="listing_fee"
            enabledKey="listing_fee_enabled"
            settings={settings}
            onChange={handleChange}
            isCurrency
          />
          <FeeRow
            icon={Gavel}
            label="Auction Success Commission"
            description="Percentage of final sale price charged to seller on successful auction"
            valueKey="auction_commission_pct"
            enabledKey="auction_commission_enabled"
            settings={settings}
            onChange={handleChange}
          />
          <FeeRow
            icon={Users}
            label="Buyer Service Fee"
            description="Percentage fee charged to buyer after winning an auction"
            valueKey="buyer_service_fee_pct"
            enabledKey="buyer_service_fee_enabled"
            settings={settings}
            onChange={handleChange}
          />
        </CardContent>
      </Card>

      {/* Dealer Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="w-5 h-5 text-blue-600" />
            Dealer Subscription Plans
          </CardTitle>
          <CardDescription>Monthly and yearly membership fees for verified dealers</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-slate-100">
          <FeeRow
            icon={Users}
            label="Dealer Monthly Fee"
            description="Monthly membership fee for dealer accounts"
            valueKey="dealer_monthly_fee"
            enabledKey="dealer_subscription_enabled"
            settings={settings}
            onChange={handleChange}
            isCurrency
          />
          <FeeRow
            icon={Users}
            label="Dealer Yearly Fee"
            description="Annual membership fee (discounted rate)"
            valueKey="dealer_yearly_fee"
            settings={settings}
            onChange={handleChange}
            isCurrency
          />
        </CardContent>
      </Card>

      {/* Auction Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings className="w-5 h-5 text-purple-600" />
            Auction Operation Settings
          </CardTitle>
          <CardDescription>Configure security deposits, payment windows, and anti-snipe timer</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-slate-100">
          <FeeRow
            icon={Percent}
            label="Security Deposit Percentage"
            description="Required deposit as % of bidder's intended max bid"
            valueKey="security_deposit_pct"
            settings={settings}
            onChange={handleChange}
          />
          <FeeRow
            icon={CheckCircle}
            label="Payment Window (Hours)"
            description="Hours winner has to complete full payment before deposit forfeit"
            valueKey="payment_window_hours"
            settings={settings}
            onChange={handleChange}
            isCurrency
          />

          <div className="py-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center">
                <Gavel className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900 text-sm">Dynamic Anti-Snipe Timer Extension</p>
                <p className="text-xs text-slate-500">Automatically extend auction if bid placed near end</p>
              </div>
              <Switch
                checked={!!settings.timer_extension_enabled}
                onCheckedChange={(v) => handleChange('timer_extension_enabled', v)}
              />
            </div>
            {settings.timer_extension_enabled && (
              <div className="grid grid-cols-3 gap-3 ml-12">
                <div>
                  <Label className="text-xs text-slate-500">Trigger (secs before end)</Label>
                  <Input type="number" value={settings.timer_extension_trigger_seconds ?? 30} onChange={e => handleChange('timer_extension_trigger_seconds', +e.target.value)} className="h-8 text-sm mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Base Extension (secs)</Label>
                  <Input type="number" value={settings.timer_extension_base_seconds ?? 60} onChange={e => handleChange('timer_extension_base_seconds', +e.target.value)} className="h-8 text-sm mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Per-Bidder Bonus (secs)</Label>
                  <Input type="number" value={settings.timer_extension_per_bidder_seconds ?? 10} onChange={e => handleChange('timer_extension_per_bidder_seconds', +e.target.value)} className="h-8 text-sm mt-1" />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Preview */}
      <Card className="bg-slate-900 text-white border-0">
        <CardContent className="pt-6">
          <p className="text-slate-400 text-xs mb-3 uppercase tracking-wide">Revenue Preview per Successful Auction</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Listing Fee', value: `PKR ${settings.listing_fee_enabled ? (settings.listing_fee || 0).toLocaleString() : 0}` },
              { label: 'Commission (PKR 3M car)', value: `PKR ${settings.auction_commission_enabled ? ((settings.auction_commission_pct || 0) / 100 * 3000000).toLocaleString() : 0}` },
              { label: 'Buyer Fee (PKR 3M car)', value: `PKR ${settings.buyer_service_fee_enabled ? ((settings.buyer_service_fee_pct || 0) / 100 * 3000000).toLocaleString() : 0}` },
              { label: 'Total per PKR 3M car', value: `PKR ${((settings.listing_fee_enabled ? settings.listing_fee || 0 : 0) + (settings.auction_commission_enabled ? (settings.auction_commission_pct || 0) / 100 * 3000000 : 0) + (settings.buyer_service_fee_enabled ? (settings.buyer_service_fee_pct || 0) / 100 * 3000000 : 0)).toLocaleString()}` }
            ].map(item => (
              <div key={item.label}>
                <p className="text-slate-400 text-xs">{item.label}</p>
                <p className="text-white font-bold text-sm mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saveMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700 px-8">
          {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
          Save All Settings
        </Button>
      </div>
    </div>
  );
}
```

```jsx
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import {
  ShieldAlert, Brain, Eye, CheckCircle, AlertTriangle,
  XCircle, RefreshCw, Loader2, TrendingUp, Zap, User,
  Activity, Target, BarChart3, Flag
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const severityConfig = {
  low: { color: 'bg-blue-100 text-blue-700', icon: Eye },
  medium: { color: 'bg-amber-100 text-amber-700', icon: AlertTriangle },
  high: { color: 'bg-orange-100 text-orange-700', icon: AlertTriangle },
  critical: { color: 'bg-red-100 text-red-700', icon: XCircle }
};

export default function RiskMonitor({ adminUser }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [aiReport, setAiReport] = useState(null);
  const queryClient = useQueryClient();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['securityEvents'],
    queryFn: () => base44.entities.SecurityEvent.list('-created_date', 100),
    refetchInterval: 30000
  });

  const { data: withdrawals = [] } = useQuery({
    queryKey: ['withdrawals'],
    queryFn: () => base44.entities.WithdrawalRequest.filter({ status: 'pending' }, '-created_date', 50)
  });

  const { data: allBets = [] } = useQuery({
    queryKey: ['allBetsRisk'],
    queryFn: () => base44.entities.Bet.list('-created_date', 200)
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => base44.entities.User.list('-created_date', 100)
  });

  const resolveEventMutation = useMutation({
    mutationFn: ({ id, resolved_by }) => base44.entities.SecurityEvent.update(id, { is_resolved: true, resolved_by }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['securityEvents'] });
      toast.success('Event marked as resolved');
      setSelectedEvent(null);
    }
  });

  const updateWithdrawalMutation = useMutation({
    mutationFn: ({ id, status, remarks }) =>
      base44.entities.WithdrawalRequest.update(id, { status, admin_remarks: remarks, admin_id: adminUser?.id, processed_at: new Date().toISOString() }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
      toast.success(`Withdrawal ${vars.status === 'approved' ? 'approved' : 'rejected'}`);
    }
  });

  // Auto-detect suspicious patterns from betting data
  const detectSuspiciousPatterns = () => {
    const flags = [];
    // High-frequency betting: >10 bets in last hour
    const oneHourAgo = Date.now() - 3600000;
    const recentBets = allBets.filter(b => new Date(b.created_date).getTime() > oneHourAgo);
    const betsByUser = recentBets.reduce((acc, b) => { acc[b.user_id] = (acc[b.user_id] || 0) + 1; return acc; }, {});
    Object.entries(betsByUser).forEach(([uid, count]) => {
      if (count > 10) flags.push({ user_id: uid, type: 'high_frequency_betting', count, severity: 'high' });
    });
    // Unusually large bets relative to user history
    const userBetHistory = allBets.reduce((acc, b) => {
      if (!acc[b.user_id]) acc[b.user_id] = [];
      acc[b.user_id].push(b.bet_amount);
      return acc;
    }, {});
    Object.entries(userBetHistory).forEach(([uid, amounts]) => {
      if (amounts.length < 3) return;
      const avg = amounts.slice(0, -1).reduce((s, a) => s + a, 0) / (amounts.length - 1);
      const last = amounts[amounts.length - 1];
      if (last > avg * 5 && last > 10000) {
        flags.push({ user_id: uid, type: 'unusual_bet_size', amount: last, avg: Math.round(avg), severity: 'medium' });
      }
    });
    return flags;
  };

  const runAIAnalysis = async () => {
    setAnalyzing(true);
    const unresolvedEvents = events.filter(e => !e.is_resolved).slice(0, 20);
    const withdrawalList = withdrawals.slice(0, 10);
    const autoFlags = detectSuspiciousPatterns();

    const prompt = `You are an AI fraud detection system for Sello.pk — a Pakistani vehicle auction & betting platform.

Analyze these data points for fraud, money laundering, and suspicious activity:

SECURITY EVENTS (${unresolvedEvents.length} unresolved):
${unresolvedEvents.map(e => `- [${e.severity?.toUpperCase()}] ${e.event_type}: ${e.details} (User: ${e.user_id})`).join('\n')}

PENDING WITHDRAWALS (${withdrawalList.length}):
${withdrawalList.map(w => `- PKR ${w.amount?.toLocaleString()} via ${w.payment_method} by User ${w.user_id} (2FA: ${w.two_fa_verified ? 'Yes' : 'No'})`).join('\n')}

AUTO-DETECTED PATTERNS (${autoFlags.length}):
${autoFlags.map(f => `- [${f.severity?.toUpperCase()}] ${f.type}: User ${f.user_id} ${JSON.stringify(f)}`).join('\n') || 'None detected'}

Evaluate:
1. Suspicious betting patterns (shill bidding, self-bidding, rapid bets)
2. Money laundering signals (deposit→bet→withdraw cycles)
3. Multiple account abuse patterns
4. High-risk withdrawal requests needing manual review
5. Overall platform risk posture

Assign a risk_score (0-100) and provide actionable findings.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          findings: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                risk_level: { type: 'string' },
                user_id: { type: 'string' },
                description: { type: 'string' },
                recommended_action: { type: 'string' },
                pattern_type: { type: 'string' }
              }
            }
          },
          overall_risk_score: { type: 'number', description: '0-100' },
          platform_health: { type: 'string', enum: ['healthy', 'caution', 'elevated', 'critical'] },
          summary: { type: 'string' }
        }
      }
    });

    setAiReport(result);

    // Create security events for AI high/critical findings
    for (const finding of (result.findings || [])) {
      if (finding.risk_level === 'high' || finding.risk_level === 'critical') {
        await base44.entities.SecurityEvent.create({
          user_id: finding.user_id || 'system',
          event_type: 'suspicious_betting',
          severity: finding.risk_level,
          details: finding.description,
          ai_flagged: true,
          ai_reasoning: finding.recommended_action,
          is_resolved: false
        });
      }
    }

    queryClient.invalidateQueries({ queryKey: ['securityEvents'] });
    setAnalyzing(false);
    toast.success(`AI Analysis complete. Risk Score: ${result.overall_risk_score}/100`);
  };

  const filteredEvents = events.filter(e =>
    filterSeverity === 'all' || e.severity === filterSeverity
  );

  const unresolved = events.filter(e => !e.is_resolved);
  const criticalCount = events.filter(e => e.severity === 'critical' && !e.is_resolved).length;
  const aiFlags = events.filter(e => e.ai_flagged && !e.is_resolved).length;
  const autoPatterns = detectSuspiciousPatterns();

  const healthColor = {
    healthy: 'text-emerald-600', caution: 'text-amber-600',
    elevated: 'text-orange-600', critical: 'text-red-600'
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Unresolved Events', value: unresolved.length, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Critical Alerts', value: criticalCount, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'AI Flagged', value: aiFlags, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Auto-Detected Flags', value: autoPatterns.length, color: 'text-orange-600', bg: 'bg-orange-50' }
        ].map((s) => (
          <Card key={s.label} className={s.bg + ' border-0'}>
            <CardContent className="pt-4 pb-3">
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-sm text-slate-600">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Auto-detected patterns */}
      {autoPatterns.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-orange-700">
              <Target className="w-4 h-4" />
              Auto-Detected Suspicious Patterns ({autoPatterns.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {autoPatterns.map((p, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200">
                  <div className="flex items-center gap-3">
                    <Flag className="w-4 h-4 text-orange-500" />
                    <div>
                      <p className="text-sm font-medium capitalize">{p.type.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-slate-500">User: {p.user_id?.slice(0, 12)}...</p>
                    </div>
                  </div>
                  <Badge className={p.severity === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-amber-100 text-amber-700'}>
                    {p.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Analysis */}
      <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Brain className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">AI Fraud Detection Engine</p>
              <p className="text-sm text-slate-500">Deep analysis of all betting, withdrawal, and security patterns</p>
            </div>
          </div>
          <Button onClick={runAIAnalysis} disabled={analyzing} className="bg-purple-600 hover:bg-purple-700 flex-shrink-0">
            {analyzing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Brain className="w-4 h-4 mr-2" />}
            {analyzing ? 'Analyzing...' : 'Run AI Analysis'}
          </Button>
        </div>

        {aiReport && (
          <div className="mt-4 p-4 bg-white rounded-xl border border-purple-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 mb-1">Platform Health</p>
                <p className={`font-bold capitalize ${healthColor[aiReport.platform_health] || 'text-slate-700'}`}>
                  {aiReport.platform_health || 'Unknown'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 mb-1">Risk Score</p>
                <p className={`text-3xl font-bold ${aiReport.overall_risk_score > 70 ? 'text-red-600' : aiReport.overall_risk_score > 40 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {aiReport.overall_risk_score}/100
                </p>
              </div>
            </div>
            <Progress value={aiReport.overall_risk_score} className="h-2" />
            <p className="text-sm text-slate-600">{aiReport.summary}</p>
            {aiReport.findings?.length > 0 && (
              <div className="space-y-2 mt-2">
                <p className="text-xs font-semibold text-slate-700">AI Findings ({aiReport.findings.length}):</p>
                {aiReport.findings.map((f, i) => (
                  <div key={i} className={`p-3 rounded-lg border text-xs ${
                    f.risk_level === 'critical' ? 'bg-red-50 border-red-200' :
                    f.risk_level === 'high' ? 'bg-orange-50 border-orange-200' :
                    'bg-amber-50 border-amber-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={f.risk_level === 'critical' ? 'bg-red-100 text-red-700' : f.risk_level === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-amber-100 text-amber-700'} >
                        {f.risk_level?.toUpperCase()}
                      </Badge>
                      <span className="font-medium">{f.pattern_type || 'Anomaly'}</span>
                    </div>
                    <p className="text-slate-700">{f.description}</p>
                    <p className="text-purple-600 mt-1">→ {f.recommended_action}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <Tabs defaultValue="events">
        <TabsList>
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawal Approvals</TabsTrigger>
          <TabsTrigger value="bets">Bet Patterns</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="mt-4">
          {/* Filter */}
          <div className="flex items-center gap-3 mb-4">
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ['securityEvents'] })}>
              <RefreshCw className="w-4 h-4 mr-1" /> Refresh
            </Button>
          </div>

          <div className="space-y-3">
            {filteredEvents.map((event) => {
              const cfg = severityConfig[event.severity] || severityConfig.low;
              const Icon = cfg.icon;
              return (
                <div
                  key={event.id}
                  className={`flex items-start justify-between p-4 rounded-xl border cursor-pointer hover:shadow-md transition-all ${
                    event.is_resolved ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-slate-200'
                  }`}
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                      {event.ai_flagged ? <Brain className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={cfg.color + ' text-xs'}>{event.severity?.toUpperCase()}</Badge>
                        {event.ai_flagged && <Badge className="bg-purple-100 text-purple-700 text-xs"><Brain className="w-3 h-3 mr-1" />AI</Badge>}
                        {event.is_resolved && <Badge className="bg-emerald-100 text-emerald-700 text-xs"><CheckCircle className="w-3 h-3 mr-1" />Resolved</Badge>}
                        <span className="text-xs text-slate-400">{format(new Date(event.created_date), 'MMM d, h:mm a')}</span>
                      </div>
                      <p className="font-medium text-slate-900 text-sm capitalize">{event.event_type?.replace(/_/g, ' ')}</p>
                      <p className="text-sm text-slate-500">{event.details}</p>
                      {event.ai_reasoning && <p className="text-xs text-purple-600 mt-1">AI: {event.ai_reasoning}</p>}
                    </div>
                  </div>
                  {!event.is_resolved && (
                    <Button size="sm" variant="outline" className="flex-shrink-0" onClick={(e) => { e.stopPropagation(); resolveEventMutation.mutate({ id: event.id, resolved_by: adminUser?.id }); }}>
                      Resolve
                    </Button>
                  )}
                </div>
              );
            })}
            {filteredEvents.length === 0 && (
              <div className="text-center py-10 text-slate-400">
                <ShieldAlert className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No security events found</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="withdrawals" className="mt-4">
          <div className="space-y-3">
            {withdrawals.map((w) => (
              <WithdrawalCard key={w.id} withdrawal={w} onAction={updateWithdrawalMutation} />
            ))}
            {withdrawals.length === 0 && (
              <div className="text-center py-10 text-slate-400">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No pending withdrawal requests</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="bets" className="mt-4">
          <div className="space-y-3">
            {/* Betting pattern summary per user */}
            {Object.entries(
              allBets.reduce((acc, b) => {
                if (!acc[b.user_id]) acc[b.user_id] = { user_id: b.user_id, user_name: b.user_name, bets: [], total: 0, won: 0 };
                acc[b.user_id].bets.push(b);
                acc[b.user_id].total += b.bet_amount || 0;
                if (b.status === 'won') acc[b.user_id].won++;
                return acc;
              }, {})
            ).sort((a, b) => b[1].total - a[1].total).slice(0, 20).map(([uid, data]) => {
              const winRate = data.bets.length ? Math.round(data.won / data.bets.length * 100) : 0;
              const riskScore = Math.min(100, (data.bets.length > 20 ? 30 : 0) + (winRate > 80 ? 40 : 0) + (data.total > 500000 ? 30 : 0));
              return (
                <div key={uid} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{data.user_name || uid.slice(0, 12)}</p>
                      <p className="text-xs text-slate-500">{data.bets.length} bets • PKR {data.total?.toLocaleString()} staked • {winRate}% win rate</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-slate-500 mb-1">Risk Score</p>
                      <div className="flex items-center gap-2">
                        <div className="w-16">
                          <Progress value={riskScore} className="h-1.5" />
                        </div>
                        <span className={`text-xs font-bold ${riskScore > 60 ? 'text-red-600' : riskScore > 30 ? 'text-amber-600' : 'text-emerald-600'}`}>{riskScore}</span>
                      </div>
                    </div>
                    {riskScore > 60 && (
                      <Badge className="bg-red-100 text-red-700 text-xs"><AlertTriangle className="w-3 h-3 mr-1" />High Risk</Badge>
                    )}
                  </div>
                </div>
              );
            })}
            {allBets.length === 0 && (
              <div className="text-center py-10 text-slate-400">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No betting data available</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function WithdrawalCard({ withdrawal, onAction }) {
  const [remarks, setRemarks] = useState('');
  const [expanded, setExpanded] = useState(false);

  const methodColors = {
    jazzcash: 'bg-red-100 text-red-700',
    easypaisa: 'bg-green-100 text-green-700',
    bank_transfer: 'bg-blue-100 text-blue-700',
    visa: 'bg-indigo-100 text-indigo-700',
    mastercard: 'bg-orange-100 text-orange-700'
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-slate-500" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">{withdrawal.user_name || withdrawal.user_id}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge className={methodColors[withdrawal.payment_method] || 'bg-slate-100 text-slate-700'}>
                {withdrawal.payment_method?.replace('_', ' ')}
              </Badge>
              {withdrawal.two_fa_verified && <Badge className="bg-emerald-100 text-emerald-700 text-xs"><ShieldAlert className="w-3 h-3 mr-1" />2FA ✓</Badge>}
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-slate-900">PKR {withdrawal.amount?.toLocaleString()}</p>
          <p className="text-xs text-slate-500">Net: PKR {withdrawal.net_amount?.toLocaleString()} (fee: {withdrawal.fee_amount?.toLocaleString()})</p>
        </div>
      </div>

      <div className="mt-3 text-sm text-slate-500 grid grid-cols-2 gap-1">
        <span>Account: <strong className="text-slate-700">{withdrawal.account_details}</strong></span>
        <span>Name: <strong className="text-slate-700">{withdrawal.account_name}</strong></span>
      </div>

      {!expanded ? (
        <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => setExpanded(true)}>
          Review & Decide
        </Button>
      ) : (
        <div className="mt-3 space-y-3 border-t pt-3">
          <Textarea
            placeholder="Add remarks (optional)"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="h-20 text-sm"
          />
          <div className="flex gap-2">
            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              onClick={() => onAction.mutate({ id: withdrawal.id, status: 'approved', remarks })}
              disabled={onAction.isPending}
            >
              <CheckCircle className="w-4 h-4 mr-2" /> Approve
            </Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700"
              onClick={() => onAction.mutate({ id: withdrawal.id, status: 'rejected', remarks })}
              disabled={onAction.isPending}
            >
              <XCircle className="w-4 h-4 mr-2" /> Reject
            </Button>
            <Button variant="outline" size="sm" onClick={() => setExpanded(false)}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
}
```

```jsx
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, XCircle, Eye, Award, Shield, Building2, Star, Loader2, User } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const typeConfig = {
  verified_seller: { label: 'Verified Seller', icon: Award, color: 'bg-emerald-100 text-emerald-700', badgeClass: 'bg-emerald-500' },
  verified_dealer: { label: 'Verified Dealer', icon: Building2, color: 'bg-blue-100 text-blue-700', badgeClass: 'bg-blue-500' }
};

const statusConfig = {
  pending: 'bg-amber-100 text-amber-700',
  under_review: 'bg-blue-100 text-blue-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700'
};

export default function VerificationReview({ adminUser }) {
  const [selected, setSelected] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');
  const queryClient = useQueryClient();

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['verificationApps'],
    queryFn: () => base44.entities.VerificationApplication.list('-created_date', 100)
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, status, notes }) => base44.entities.VerificationApplication.update(id, {
      status,
      admin_notes: notes,
      reviewed_by: adminUser?.id,
      reviewed_at: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verificationApps'] });
      toast.success('Application reviewed successfully');
      setSelected(null);
      setAdminNotes('');
    }
  });

  const filtered = applications.filter(a => filterStatus === 'all' || a.status === filterStatus);
  const pending = applications.filter(a => a.status === 'pending').length;
  const approved = applications.filter(a => a.status === 'approved').length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending Review', value: pending, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Approved', value: approved, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Total Applications', value: applications.length, color: 'text-blue-600', bg: 'bg-blue-50' }
        ].map(s => (
          <Card key={s.label} className={s.bg + ' border-0'}>
            <CardContent className="pt-4 pb-3">
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-sm text-slate-600">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="w-5 h-5 text-blue-600" />
              Verification Applications
            </CardTitle>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No {filterStatus === 'all' ? '' : filterStatus} applications</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(app => {
                const cfg = typeConfig[app.application_type] || typeConfig.verified_seller;
                const Icon = cfg.icon;
                return (
                  <div key={app.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="font-semibold text-slate-900">{app.user_name || app.user_email}</p>
                            <Badge className={cfg.color + ' text-xs'}>{cfg.label}</Badge>
                            <Badge className={statusConfig[app.status] + ' text-xs capitalize'}>{app.status}</Badge>
                          </div>
                          {app.business_name && (
                            <p className="text-sm text-slate-600">{app.business_name}</p>
                          )}
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                            <span>CNIC: {app.cnic_number}</span>
                            <span>Phone: {app.phone}</span>
                            {app.created_date && <span>{format(new Date(app.created_date), 'MMM d, yyyy')}</span>}
                          </div>
                          {app.avg_rating > 0 && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-amber-600">
                              <Star className="w-3 h-3 fill-amber-400" />
                              {app.avg_rating.toFixed(1)} avg rating • {app.total_transactions} transactions
                            </div>
                          )}
                          {app.admin_notes && (
                            <p className="text-xs text-slate-500 mt-1 italic">Admin: {app.admin_notes}</p>
                          )}
                        </div>
                      </div>

                      {(app.status === 'pending' || app.status === 'under_review') && (
                        <div className="flex gap-2 flex-shrink-0">
                          <Button size="sm" variant="outline" className="text-xs" onClick={() => { setSelected(app); setAdminNotes(''); }}>
                            <Eye className="w-3.5 h-3.5 mr-1" /> Review
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Verification Application</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 py-2">
              <div className="p-4 bg-slate-50 rounded-xl space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-slate-500">Applicant:</span> <strong>{selected.user_name}</strong></div>
                  <div><span className="text-slate-500">Type:</span> <strong>{selected.application_type?.replace('_', ' ')}</strong></div>
                  <div><span className="text-slate-500">CNIC:</span> <strong>{selected.cnic_number}</strong></div>
                  <div><span className="text-slate-500">Phone:</span> <strong>{selected.phone}</strong></div>
                  {selected.business_name && <div className="col-span-2"><span className="text-slate-500">Business:</span> <strong>{selected.business_name}</strong></div>}
                  {selected.address && <div className="col-span-2"><span className="text-slate-500">Address:</span> <strong>{selected.address}</strong></div>}
                  {selected.years_in_business && <div><span className="text-slate-500">Years in business:</span> <strong>{selected.years_in_business}</strong></div>}
                </div>
                {selected.documents?.length > 0 && (
                  <div>
                    <p className="text-slate-500 mb-1">Documents:</p>
                    <div className="flex gap-2 flex-wrap">
                      {selected.documents.map((doc, i) => (
                        <a key={i} href={doc} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs underline">Document {i + 1}</a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Admin Notes</p>
                <Textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} placeholder="Notes for this decision..." className="h-20" />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              disabled={reviewMutation.isPending}
              onClick={() => reviewMutation.mutate({ id: selected.id, status: 'rejected', notes: adminNotes })}
            >
              <XCircle className="w-4 h-4 mr-1" /> Reject
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={reviewMutation.isPending}
              onClick={() => reviewMutation.mutate({ id: selected.id, status: 'approved', notes: adminNotes })}
            >
              {reviewMutation.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-1" />}
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

```jsx
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, Zap, CheckCircle, XCircle } from 'lucide-react';

export default function AuctionStatusBadge({ status, size = 'default' }) {
  const config = {
    upcoming: {
      icon: Clock,
      label: 'Upcoming',
      className: 'bg-blue-500/10 text-blue-600 border-blue-500/20'
    },
    live: {
      icon: Zap,
      label: 'Live Now',
      className: 'bg-red-500/10 text-red-600 border-red-500/20 animate-pulse'
    },
    completed: {
      icon: CheckCircle,
      label: 'Completed',
      className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
    },
    cancelled: {
      icon: XCircle,
      label: 'Cancelled',
      className: 'bg-slate-500/10 text-slate-600 border-slate-500/20'
    }
  };

  const { icon: Icon, label, className } = config[status] || config.upcoming;

  const sizeClasses = {
    small: 'text-xs px-2 py-0.5',
    default: 'text-sm px-3 py-1',
    large: 'text-base px-4 py-1.5'
  };

  return (
    <Badge className={`${className} ${sizeClasses[size]} border font-medium flex items-center gap-1.5 w-fit`}>
      <Icon className={`${size === 'small' ? 'w-3 h-3' : 'w-4 h-4'}`} />
      {label}
    </Badge>
  );
}
```

```jsx
import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Zap, Users } from 'lucide-react';
import { format } from 'date-fns';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white rounded-xl px-4 py-3 shadow-xl text-sm">
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      <p className="font-bold text-[#FFA602]">PKR {payload[0]?.value?.toLocaleString()}</p>
      {payload[0]?.payload?.bidder && (
        <p className="text-slate-300 text-xs mt-0.5">{payload[0].payload.bidder}</p>
      )}
      {payload[0]?.payload?.type && (
        <Badge className={`mt-1 text-xs border-0 ${payload[0].payload.type === 'online' ? 'bg-blue-500/30 text-blue-300' : 'bg-amber-500/30 text-amber-300'}`}>
          {payload[0].payload.type === 'online' ? 'Online Bid' : 'Floor Bid'}
        </Badge>
      )}
    </div>
  );
};

export default function BidPriceChart({ bids = [], car }) {
  const chartData = useMemo(() => {
    const sorted = [...bids].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    return sorted.map((bid, i) => ({
      time: format(new Date(bid.created_date), 'HH:mm:ss'),
      amount: bid.amount,
      bidder: bid.bidder_name,
      type: bid.bid_type,
      index: i + 1
    }));
  }, [bids]);

  const maxBid = Math.max(...chartData.map(d => d.amount), car?.starting_bid || 0);
  const minBid = Math.min(...chartData.map(d => d.amount), car?.starting_bid || 0);
  const bidVelocity = bids.length >= 2
    ? Math.round(bids.length / ((new Date(bids[0]?.created_date) - new Date(bids[bids.length - 1]?.created_date)) / 60000))
    : 0;
  const activeBidders = [...new Set(bids.map(b => b.bidder_id).filter(Boolean))].length || bids.length;
  const priceIncrease = chartData.length >= 2 ? ((chartData[chartData.length - 1]?.amount - chartData[0]?.amount) / chartData[0]?.amount * 100) : 0;

  if (chartData.length < 2) {
    return (
      <Card className="border border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-5 h-5 text-[#FFA602]" />
            Price Progression
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
            <div className="text-center">
              <TrendingUp className="w-10 h-10 mx-auto mb-2 opacity-20" />
              <p>Awaiting more bids to show chart</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-slate-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-5 h-5 text-[#FFA602]" />
            Price Progression
          </CardTitle>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500" />
              {bidVelocity}/min
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3 text-blue-500" />
              {activeBidders} bidders
            </span>
            {priceIncrease > 0 && (
              <span className="text-emerald-600 font-semibold">+{priceIncrease.toFixed(1)}%</span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="bidGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FFA602" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#FFA602" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
              domain={[minBid * 0.98, maxBid * 1.02]}
            />
            <Tooltip content={<CustomTooltip />} />
            {car?.reserve_price && (
              <ReferenceLine
                y={car.reserve_price}
                stroke="#10b981"
                strokeDasharray="5 5"
                strokeWidth={1.5}
                label={{ value: 'Reserve', position: 'right', fontSize: 10, fill: '#10b981' }}
              />
            )}
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#FFA602"
              strokeWidth={2.5}
              fill="url(#bidGradient)"
              dot={{ fill: '#FFA602', r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#FFA602', stroke: 'white', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Bid intensity bar */}
        <div className="mt-4 flex gap-1 h-2">
          {chartData.map((point, i) => {
            const intensity = (point.amount - minBid) / (maxBid - minBid || 1);
            return (
              <div
                key={i}
                className="flex-1 rounded-full"
                style={{ backgroundColor: `rgba(255, 166, 2, ${0.2 + intensity * 0.8})` }}
                title={`Bid ${i + 1}: PKR ${point.amount?.toLocaleString()}`}
              />
            );
          })}
        </div>
        <p className="text-xs text-slate-400 mt-1 text-center">Bid intensity over time</p>
      </CardContent>
    </Card>
  );
}
```

```jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { MapPin, Gauge, Calendar, Gavel, ArrowRight, Scale, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import CountdownTimer from './CountdownTimer';

export default function CarCard({ car, auction, compact = false, showCompare = false, onCompareToggle, isComparing = false }) {
  const formatPrice = (price) => {
    if (!price) return 'No bids yet';
    return `PKR ${price.toLocaleString()}`;
  };

  const conditionColors = {
    excellent: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    good: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    fair: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    needs_repair: 'bg-red-500/10 text-red-600 border-red-500/20'
  };

  return (
    <div className={`
      group bg-white rounded-2xl overflow-hidden border border-slate-200 
      hover:border-orange-300 hover:shadow-xl hover:shadow-orange-500/10
      transition-all duration-300 ${compact ? '' : 'flex flex-col'}
    `}>
      {/* Image Section */}
      <div className="relative overflow-hidden aspect-[4/3]">
        <img 
          src={car.images?.[0] || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600'}
          alt={`${car.make} ${car.model}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Status Badge */}
        {auction?.status === 'live' && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-red-500 text-white border-0 animate-pulse flex items-center gap-1">
              <span className="w-2 h-2 bg-white rounded-full animate-ping" />
              LIVE
            </Badge>
          </div>
        )}

        {/* Compare Checkbox */}
        {showCompare && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onCompareToggle?.(car.id);
            }}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              isComparing 
                ? 'bg-[#FFA602] text-white' 
                : 'bg-white/90 text-slate-600 hover:bg-white'
            }`}
          >
            {isComparing ? <Check className="w-4 h-4" /> : <Scale className="w-4 h-4" />}
          </button>
        )}
        
        {/* Location Badge */}
        <div className="absolute bottom-3 left-3">
          <Badge variant="secondary" className="bg-black/70 text-white border-0 backdrop-blur-sm">
            <MapPin className="w-3 h-3 mr-1" />
            Okara Yard
          </Badge>
        </div>

        {/* Condition Badge - only show if not comparing */}
        {car.condition && !showCompare && (
          <div className="absolute top-3 right-3">
            <Badge className={`${conditionColors[car.condition]} border capitalize`}>
              {car.condition.replace('_', ' ')}
            </Badge>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Title */}
        <h3 className="font-bold text-slate-900 text-lg mb-1 line-clamp-1">
          {car.year} {car.make} {car.model}
        </h3>

        {/* Quick Stats */}
        <div className="flex items-center gap-3 text-sm text-slate-500 mb-3">
          {car.mileage && (
            <span className="flex items-center gap-1">
              <Gauge className="w-4 h-4" />
              {car.mileage.toLocaleString()} km
            </span>
          )}
          {car.registration_city && (
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {car.registration_city}
            </span>
          )}
        </div>

        {/* Current Bid */}
        <div className="bg-slate-50 rounded-xl p-3 mb-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Current Bid</p>
              <p className="text-xl font-bold text-slate-900">
                {formatPrice(car.current_bid || car.starting_bid)}
              </p>
            </div>
            <Gavel className="w-8 h-8 text-[#FFA602]" />
          </div>
        </div>

        {/* Timer */}
        {auction?.end_time && (
          <div className="mb-4">
            <p className="text-xs text-slate-500 mb-2">Ends in:</p>
            <CountdownTimer targetDate={auction.end_time} size="small" showLabel={false} />
          </div>
        )}

        {/* Action Button */}
        <Link to={createPageUrl(`CarDetail?id=${car.id}`)} className="mt-auto">
          <Button className="w-full bg-gradient-to-r from-[#FFA602] to-amber-500 hover:from-amber-500 hover:to-[#FFA602] text-white shadow-lg shadow-[#FFA602]/25">
            Place Bid
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
```

```jsx
import React, { useState, useEffect } from 'react';
import { Clock, Zap } from 'lucide-react';

export default function CountdownTimer({ targetDate, size = 'default', showLabel = true, onComplete }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate) - new Date();
      
      if (difference <= 0) {
        if (onComplete) onComplete();
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      setIsUrgent(difference < 300000); // Less than 5 minutes

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [targetDate, onComplete]);

  const sizeClasses = {
    small: 'text-sm gap-1',
    default: 'text-lg gap-2',
    large: 'text-2xl md:text-4xl gap-3'
  };

  const boxClasses = {
    small: 'w-10 h-10 text-xs',
    default: 'w-14 h-14 md:w-16 md:h-16 text-sm',
    large: 'w-16 h-16 md:w-24 md:h-24 text-base md:text-lg'
  };

  const TimeBox = ({ value, label }) => (
    <div className="flex flex-col items-center">
      <div className={`
        ${boxClasses[size]} 
        ${isUrgent ? 'bg-gradient-to-br from-orange-500 to-red-600 animate-pulse' : 'bg-gradient-to-br from-slate-800 to-slate-900'}
        rounded-xl flex items-center justify-center font-bold text-white shadow-lg border border-white/10
      `}>
        {String(value).padStart(2, '0')}
      </div>
      {showLabel && (
        <span className={`mt-1 text-slate-400 uppercase tracking-wider ${size === 'small' ? 'text-[10px]' : 'text-xs'}`}>
          {label}
        </span>
      )}
    </div>
  );

  return (
    <div className={`flex items-center ${sizeClasses[size]}`}>
      {isUrgent && <Zap className="w-5 h-5 text-orange-500 animate-pulse mr-1" />}
      <TimeBox value={timeLeft.days} label="Days" />
      <span className={`text-slate-500 font-bold ${size === 'large' ? 'text-2xl' : ''}`}>:</span>
      <TimeBox value={timeLeft.hours} label="Hours" />
      <span className={`text-slate-500 font-bold ${size === 'large' ? 'text-2xl' : ''}`}>:</span>
      <TimeBox value={timeLeft.minutes} label="Mins" />
      <span className={`text-slate-500 font-bold ${size === 'large' ? 'text-2xl' : ''}`}>:</span>
      <TimeBox value={timeLeft.seconds} label="Secs" />
    </div>
  );
}
```

```jsx
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Gavel, TrendingUp, User, Globe, Building2, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationService from '@/components/notifications/NotificationService';

export default function LiveBidPanel({ 
  car, 
  bids = [], 
  currentUserId,
  currentUserName,
  onPlaceBid,
  isLoading,
  minBidIncrement = 5000 
}) {
  const [bidAmount, setBidAmount] = useState('');
  const [isHighestBidder, setIsHighestBidder] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [previousHighestBidder, setPreviousHighestBidder] = useState(null);

  const currentBid = car?.current_bid || car?.starting_bid || 0;
  const minimumBid = currentBid + minBidIncrement;
  const carDetails = `${car?.year} ${car?.make} ${car?.model}`;

  useEffect(() => {
    if (bids.length > 0 && currentUserId) {
      const newHighestBidder = bids[0].bidder_id;
      
      // Detect outbid and send notification
      if (previousHighestBidder && previousHighestBidder !== newHighestBidder && previousHighestBidder !== currentUserId) {
        // Notify previous highest bidder they've been outbid
        NotificationService.notifyOutbid(previousHighestBidder, carDetails, bids[0].amount);
      }
      
      setPreviousHighestBidder(newHighestBidder);
      setIsHighestBidder(newHighestBidder === currentUserId);
    }
  }, [bids, currentUserId]);

  const quickBidAmounts = [
    minimumBid,
    minimumBid + 10000,
    minimumBid + 25000,
    minimumBid + 50000
  ];

  const formatPrice = (price) => `PKR ${price.toLocaleString()}`;

  const handleBid = async (amount) => {
    if (amount < minimumBid) return;
    
    // Get previous highest bidder before placing new bid
    const prevHighestBidder = bids.length > 0 ? bids[0] : null;
    
    await onPlaceBid(amount);
    
    // Send outbid notification to previous highest bidder
    if (prevHighestBidder && prevHighestBidder.bidder_id !== currentUserId) {
      NotificationService.notifyOutbid(prevHighestBidder.bidder_id, carDetails, amount);
    }
    
    // Notify seller of new bid
    if (car?.seller_id) {
      NotificationService.notifyNewBid(car.seller_id, carDetails, amount, currentUserName || 'A bidder');
    }
    
    // Notify followers of bid activity
    if (car?.followers?.length > 0) {
      car.followers.forEach(followerId => {
        if (followerId !== currentUserId) {
          NotificationService.notifyFollowedCarBid(followerId, carDetails, amount);
        }
      });
    }
    
    setShowSuccess(true);
    setBidAmount('');
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white font-bold flex items-center gap-2">
            <Gavel className="w-5 h-5 text-orange-400" />
            Live Bidding
          </h3>
          <div className="flex items-center gap-2 text-emerald-400 text-sm">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Auto-updating
          </div>
        </div>
        
        {/* Current Highest Bid */}
        <div className="bg-white/10 rounded-xl p-4 backdrop-blur">
          <p className="text-slate-400 text-sm mb-1">Current Highest Bid</p>
          <p className="text-3xl font-bold text-white">{formatPrice(currentBid)}</p>
        </div>
      </div>

      {/* Status Message */}
      <AnimatePresence>
        {isHighestBidder && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-emerald-500 text-white px-4 py-3 flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">You are the highest bidder!</span>
          </motion.div>
        )}
        {!isHighestBidder && bids.some(b => b.bidder_id === currentUserId) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-amber-500 text-white px-4 py-3 flex items-center gap-2"
          >
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">You have been outbid!</span>
          </motion.div>
        )}
        {showSuccess && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-emerald-500 text-white px-4 py-3 flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Bid placed successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bid Input */}
      <div className="p-4 border-b border-slate-100">
        <p className="text-sm text-slate-500 mb-2">
          Minimum bid: <span className="font-semibold text-slate-900">{formatPrice(minimumBid)}</span>
        </p>
        
        {/* Quick Bid Buttons */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {quickBidAmounts.map((amount) => (
            <Button
              key={amount}
              variant="outline"
              className="border-orange-200 hover:bg-orange-50 hover:border-orange-300 text-slate-700"
              onClick={() => handleBid(amount)}
              disabled={isLoading}
            >
              {formatPrice(amount)}
            </Button>
          ))}
        </div>

        {/* Custom Bid Input */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">PKR</span>
            <Input
              type="number"
              placeholder={minimumBid.toString()}
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              className="pl-12 h-12 text-lg font-semibold"
              min={minimumBid}
            />
          </div>
          <Button 
            className="h-12 px-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
            onClick={() => handleBid(Number(bidAmount))}
            disabled={isLoading || !bidAmount || Number(bidAmount) < minimumBid}
          >
            <Gavel className="w-5 h-5 mr-2" />
            Bid Now
          </Button>
        </div>
      </div>

      {/* Bid History */}
      <div className="p-4">
        <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-orange-500" />
          Bid History
        </h4>
        
        <div className="space-y-2 max-h-64 overflow-y-auto">
          <AnimatePresence>
            {bids.slice(0, 10).map((bid, index) => (
              <motion.div
                key={bid.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`
                  flex items-center justify-between p-3 rounded-lg
                  ${index === 0 ? 'bg-orange-50 border border-orange-200' : 'bg-slate-50'}
                  ${bid.bidder_id === currentUserId ? 'ring-2 ring-orange-300' : ''}
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center
                    ${bid.bid_type === 'online' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}
                  `}>
                    {bid.bid_type === 'online' ? <Globe className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 text-sm">
                      {bid.bidder_name || 'Anonymous'}
                      {bid.bidder_id === currentUserId && (
                        <Badge variant="outline" className="ml-2 text-xs">You</Badge>
                      )}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(bid.created_date).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${index === 0 ? 'text-orange-600' : 'text-slate-700'}`}>
                    {formatPrice(bid.amount)}
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    {bid.bid_type}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {bids.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <Gavel className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p>No bids yet. Be the first!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

```jsx
import React from 'react';
import { Shield, MapPin, Lock, CheckCircle, FileCheck, Car } from 'lucide-react';

export default function TrustBadges({ variant = 'default' }) {
  const badges = [
    {
      icon: Shield,
      title: 'Verified Cars',
      description: 'Every vehicle inspected',
      color: 'text-emerald-600 bg-emerald-50'
    },
    {
      icon: MapPin,
      title: 'Physical Yard',
      description: 'View cars in Okara',
      color: 'text-blue-600 bg-blue-50'
    },
    {
      icon: Lock,
      title: 'Secure Bidding',
      description: 'Safe transactions',
      color: 'text-purple-600 bg-purple-50'
    },
    {
      icon: FileCheck,
      title: 'Documentation',
      description: 'Complete paperwork',
      color: 'text-amber-600 bg-amber-50'
    }
  ];

  if (variant === 'compact') {
    return (
      <div className="flex flex-wrap items-center gap-3">
        {badges.map((badge, index) => (
          <div 
            key={index}
            className={`flex items-center gap-2 px-3 py-2 rounded-full ${badge.color}`}
          >
            <badge.icon className="w-4 h-4" />
            <span className="text-sm font-medium">{badge.title}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {badges.map((badge, index) => (
        <div 
          key={index}
          className="bg-white rounded-xl p-4 border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300 text-center"
        >
          <div className={`w-12 h-12 rounded-xl ${badge.color} flex items-center justify-center mx-auto mb-3`}>
            <badge.icon className="w-6 h-6" />
          </div>
          <h4 className="font-semibold text-slate-900 mb-1">{badge.title}</h4>
          <p className="text-sm text-slate-500">{badge.description}</p>
        </div>
      ))}
    </div>
  );
}
```

```jsx
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Bot, TrendingUp, Shield, Info, CheckCircle } from 'lucide-react';

export default function ProxyBidForm({ open, onClose, car, user, currentBid }) {
  const [maxBid, setMaxBid] = useState('');
  const [increment, setIncrement] = useState('5000');
  const [success, setSuccess] = useState(false);
  const queryClient = useQueryClient();

  const minBid = (currentBid || car?.starting_bid || 0) + 5000;

  const createProxyBidMutation = useMutation({
    mutationFn: async (data) => {
      // Check if user already has a proxy bid on this car
      const existingBids = await base44.entities.ProxyBid.filter({
        car_id: car.id,
        bidder_id: user.id,
        is_active: true
      });
      
      // Deactivate existing proxy bid
      if (existingBids.length > 0) {
        await base44.entities.ProxyBid.update(existingBids[0].id, { is_active: false });
      }

      // Create new proxy bid
      return base44.entities.ProxyBid.create({
        car_id: car.id,
        auction_id: car.auction_id,
        bidder_id: user.id,
        max_amount: parseInt(data.maxBid),
        increment: parseInt(data.increment),
        current_proxy_bid: minBid,
        is_active: true
      });
    },
    onSuccess: () => {
      setSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['proxyBids'] });
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    }
  });

  const handleSubmit = () => {
    if (!maxBid || parseInt(maxBid) < minBid) return;
    createProxyBidMutation.mutate({ maxBid, increment });
  };

  if (success) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="text-center py-12">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Proxy Bid Set!</h3>
          <p className="text-slate-500">We'll automatically bid for you up to PKR {parseInt(maxBid).toLocaleString()}</p>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-[#FFA602]" />
            Set Proxy Bid
          </DialogTitle>
          <DialogDescription>
            Let us bid automatically on your behalf
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Car Info */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <div className="w-16 h-12 bg-slate-200 rounded overflow-hidden">
              <img src={car?.images?.[0] || 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=200'} alt="" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">{car?.year} {car?.make} {car?.model}</p>
              <p className="text-sm text-slate-500">Current: PKR {currentBid?.toLocaleString()}</p>
            </div>
          </div>

          {/* How it works */}
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-blue-800 text-sm">
              <strong>How Proxy Bidding Works:</strong> Set your maximum bid and we'll automatically bid the minimum needed to keep you winning, up to your limit.
            </AlertDescription>
          </Alert>

          {/* Max Bid Input */}
          <div>
            <Label>Maximum Bid (PKR) *</Label>
            <Input
              type="number"
              value={maxBid}
              onChange={(e) => setMaxBid(e.target.value)}
              placeholder={`Min: ${minBid.toLocaleString()}`}
              className="mt-1 text-lg"
              min={minBid}
            />
            <p className="text-xs text-slate-500 mt-1">This is the maximum you're willing to pay</p>
          </div>

          {/* Increment */}
          <div>
            <Label>Bid Increment</Label>
            <div className="flex gap-2 mt-1">
              {['5000', '10000', '25000', '50000'].map((inc) => (
                <Button
                  key={inc}
                  variant={increment === inc ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setIncrement(inc)}
                  className={increment === inc ? 'bg-[#FFA602] hover:bg-amber-500' : ''}
                >
                  {parseInt(inc).toLocaleString()}
                </Button>
              ))}
            </div>
          </div>

          {/* Summary */}
          {maxBid && parseInt(maxBid) >= minBid && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="flex items-center gap-2 text-emerald-700">
                <Shield className="w-4 h-4" />
                <span className="font-medium">Your Proxy Bid</span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-slate-500">Starting at:</span>
                  <p className="font-semibold">PKR {minBid.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-slate-500">Up to:</span>
                  <p className="font-semibold text-emerald-700">PKR {parseInt(maxBid).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit}
            disabled={!maxBid || parseInt(maxBid) < minBid || createProxyBidMutation.isPending}
            className="bg-[#FFA602] hover:bg-amber-500"
          >
            <Bot className="w-4 h-4 mr-2" />
            {createProxyBidMutation.isPending ? 'Setting...' : 'Set Proxy Bid'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

```jsx
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { format, addDays, isSunday } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CalendarDays, Clock, MapPin, Phone, User, 
  CheckCircle, Loader2, Info 
} from 'lucide-react';

const TIME_SLOTS = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
];

export default function InspectionBookingModal({ car, open, onClose, user }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [notes, setNotes] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const bookingMutation = useMutation({
    mutationFn: async () => {
      // Create booking
      const booking = await base44.entities.InspectionBooking.create({
        car_id: car.id,
        buyer_id: user?.id,
        buyer_name: user?.full_name,
        buyer_phone: phone,
        booking_date: format(selectedDate, 'yyyy-MM-dd'),
        booking_time: selectedTime,
        status: 'pending',
        notes,
        car_details: `${car.year} ${car.make} ${car.model}`
      });

      // Notify admin
      await base44.entities.Notification.create({
        user_id: 'admin',
        title: 'New Inspection Booking',
        message: `${user?.full_name} booked inspection for ${car.year} ${car.make} ${car.model} on ${format(selectedDate, 'MMM d, yyyy')} at ${selectedTime}`,
        type: 'general',
        link: `InspectionBooking?id=${booking.id}`
      });

      return booking;
    },
    onSuccess: () => {
      setBookingSuccess(true);
    }
  });

  const handleSubmit = () => {
    if (!selectedDate || !selectedTime || !phone) return;
    bookingMutation.mutate();
  };

  const disabledDays = (date) => {
    return date < new Date() || isSunday(date) || date > addDays(new Date(), 30);
  };

  if (bookingSuccess) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Booking Confirmed!</h3>
            <p className="text-slate-500 mb-4">
              Your inspection is scheduled for <br />
              <strong>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</strong> at <strong>{selectedTime}</strong>
            </p>
            <div className="bg-slate-50 rounded-xl p-4 mb-4 text-left">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-orange-500 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-900">Okara Auction Yard</p>
                  <p className="text-sm text-slate-500">GT Road, Near Industrial Area, Okara</p>
                </div>
              </div>
            </div>
            <Alert>
              <Info className="w-4 h-4" />
              <AlertDescription>
                You'll receive a confirmation call from our team within 24 hours.
              </AlertDescription>
            </Alert>
            <Button onClick={onClose} className="mt-4 w-full">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-orange-500" />
            Book Physical Inspection
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Car Info */}
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="font-semibold text-slate-900">
              {car.year} {car.make} {car.model}
            </p>
            <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
              <MapPin className="w-4 h-4" />
              Okara Auction Yard
            </div>
          </div>

          {/* Calendar */}
          <div>
            <Label className="mb-2 block">Select Date *</Label>
            <div className="border rounded-xl p-3 flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={disabledDays}
                className="rounded-md"
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              * Yard closed on Sundays. Bookings available up to 30 days ahead.
            </p>
          </div>

          {/* Time Slot */}
          <div>
            <Label className="mb-2 block">Select Time *</Label>
            <div className="grid grid-cols-4 gap-2">
              {TIME_SLOTS.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`
                    px-3 py-2 text-sm rounded-lg border transition-all
                    ${selectedTime === time
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white border-slate-200 hover:border-orange-300'}
                  `}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <div className="relative mt-1">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="03XX-XXXXXXX"
                className="pl-10"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Special Requests (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any specific areas you want to inspect, questions for staff, etc."
              className="mt-1"
              rows={3}
            />
          </div>

          {/* Location Info */}
          <Alert className="bg-blue-50 border-blue-200">
            <MapPin className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Location:</strong> Okara Auto Auction Yard, GT Road, Near Industrial Area, Okara, Punjab
            </AlertDescription>
          </Alert>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedDate || !selectedTime || !phone || bookingMutation.isPending}
            className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600"
          >
            {bookingMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Booking...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirm Booking
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

```jsx
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, AlertTriangle, X, Image as ImageIcon } from 'lucide-react';

export default function DisputeForm({ open, onClose, escrow, carDetails, user }) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [evidenceUrls, setEvidenceUrls] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const reasons = [
    { value: 'vehicle_not_as_described', label: 'Vehicle Not As Described' },
    { value: 'hidden_damage', label: 'Hidden/Undisclosed Damage' },
    { value: 'documentation_issue', label: 'Documentation Issues' },
    { value: 'payment_issue', label: 'Payment Problem' },
    { value: 'delivery_issue', label: 'Delivery/Pickup Issue' },
    { value: 'other', label: 'Other' }
  ];

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    setUploading(true);
    const uploadedUrls = [];
    
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      uploadedUrls.push(file_url);
    }
    
    setEvidenceUrls([...evidenceUrls, ...uploadedUrls]);
    setUploading(false);
  };

  const removeEvidence = (index) => {
    setEvidenceUrls(evidenceUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!reason || !description) return;
    
    setIsSubmitting(true);
    
    await base44.entities.Dispute.create({
      escrow_id: escrow?.id,
      car_id: escrow?.car_id,
      buyer_id: user?.id,
      seller_id: escrow?.seller_id,
      raised_by: 'buyer',
      reason,
      description,
      evidence_urls: evidenceUrls,
      status: 'open'
    });

    // Update escrow status
    if (escrow?.id) {
      await base44.entities.EscrowPayment.update(escrow.id, { status: 'disputed' });
    }

    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            Raise a Dispute
          </DialogTitle>
        </DialogHeader>

        <Alert className="bg-amber-50 border-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <AlertDescription className="text-amber-800 text-sm">
            Please try to resolve issues directly with the seller first. Disputes typically take 3-5 business days to resolve.
          </AlertDescription>
        </Alert>

        <div className="space-y-4 py-4">
          {/* Vehicle Info */}
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-sm text-slate-500">Vehicle</p>
            <p className="font-semibold">{carDetails || 'N/A'}</p>
          </div>

          {/* Reason */}
          <div>
            <Label>Reason for Dispute *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {reasons.map(r => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div>
            <Label>Describe the Issue *</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide detailed information about your issue..."
              className="mt-1 h-32"
            />
          </div>

          {/* Evidence Upload */}
          <div>
            <Label>Upload Evidence (Photos/Videos)</Label>
            <div className="mt-2 border-2 border-dashed border-slate-300 rounded-lg p-4 text-center">
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
                id="evidence-upload"
              />
              <label htmlFor="evidence-upload" className="cursor-pointer">
                <Upload className={`w-8 h-8 mx-auto mb-2 ${uploading ? 'text-orange-500 animate-pulse' : 'text-slate-400'}`} />
                <p className="text-sm text-slate-500">
                  {uploading ? 'Uploading...' : 'Click to upload photos or videos'}
                </p>
              </label>
            </div>

            {/* Uploaded Evidence Preview */}
            {evidenceUrls.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {evidenceUrls.map((url, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeEvidence(i)}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit}
            disabled={!reason || !description || isSubmitting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Dispute'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

```jsx
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Shield, CheckCircle, Clock, AlertTriangle, Banknote, Lock, ArrowRight } from 'lucide-react';

export default function EscrowStatus({ escrow, onRaiseDispute, onConfirmDelivery }) {
  const statusConfig = {
    pending: { 
      label: 'Awaiting Payment', 
      color: 'bg-amber-100 text-amber-700', 
      icon: Clock,
      step: 1
    },
    in_escrow: { 
      label: 'Payment Secured', 
      color: 'bg-blue-100 text-blue-700', 
      icon: Lock,
      step: 2
    },
    released_to_seller: { 
      label: 'Payment Released', 
      color: 'bg-emerald-100 text-emerald-700', 
      icon: CheckCircle,
      step: 4
    },
    refunded_to_buyer: { 
      label: 'Refunded', 
      color: 'bg-purple-100 text-purple-700', 
      icon: Banknote,
      step: 4
    },
    disputed: { 
      label: 'Under Dispute', 
      color: 'bg-red-100 text-red-700', 
      icon: AlertTriangle,
      step: 3
    }
  };

  const status = statusConfig[escrow?.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  
  const steps = [
    { label: 'Payment Made', completed: status.step >= 1 },
    { label: 'In Escrow', completed: status.step >= 2 },
    { label: 'Vehicle Received', completed: status.step >= 3 && escrow?.status !== 'disputed' },
    { label: 'Complete', completed: status.step >= 4 }
  ];

  const progress = (status.step / 4) * 100;

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Shield className="w-5 h-5 text-blue-600" />
          Buyer Protection Active
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <Badge className={`${status.color} px-3 py-1`}>
            <StatusIcon className="w-4 h-4 mr-1" />
            {status.label}
          </Badge>
          <span className="text-sm text-slate-500">
            Amount: <span className="font-semibold text-slate-900">PKR {escrow?.amount?.toLocaleString()}</span>
          </span>
        </div>

        {/* Progress Steps */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between">
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  step.completed ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  {step.completed ? '✓' : i + 1}
                </div>
                <span className="text-xs text-slate-500 mt-1 text-center max-w-[60px]">{step.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-white rounded-lg p-3 border border-blue-100">
          <p className="text-sm text-slate-600">
            <strong className="text-blue-700">Your payment is protected.</strong> Funds will be held securely 
            until you confirm vehicle receipt. You have 48 hours after pickup to report any issues.
          </p>
        </div>

        {/* Actions */}
        {escrow?.status === 'in_escrow' && (
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
              onClick={onRaiseDispute}
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Raise Dispute
            </Button>
            <Button 
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              onClick={onConfirmDelivery}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirm Receipt
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

```jsx
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Star, CheckCircle } from 'lucide-react';

function StarRating({ value, onChange, label }) {
  const [hover, setHover] = useState(0);
  
  return (
    <div className="space-y-1">
      <Label className="text-sm">{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="p-0.5"
          >
            <Star 
              className={`w-6 h-6 transition-colors ${
                star <= (hover || value) 
                  ? 'fill-amber-400 text-amber-400' 
                  : 'text-slate-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function SellerReviewForm({ open, onClose, seller, car, user, onSuccess }) {
  const [ratings, setRatings] = useState({
    overall: 0,
    accuracy: 0,
    communication: 0,
    condition: 0
  });
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (ratings.overall === 0) return;
    
    setIsSubmitting(true);
    
    await base44.entities.SellerReview.create({
      seller_id: seller?.id,
      buyer_id: user?.id,
      car_id: car?.id,
      auction_id: car?.auction_id,
      overall_rating: ratings.overall,
      accuracy_rating: ratings.accuracy || ratings.overall,
      communication_rating: ratings.communication || ratings.overall,
      condition_rating: ratings.condition || ratings.overall,
      review_text: reviewText,
      is_verified_purchase: true
    });

    setIsSubmitting(false);
    setSubmitted(true);
    
    setTimeout(() => {
      onSuccess?.();
      onClose();
    }, 2000);
  };

  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="text-center py-12">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Thank You!</h3>
          <p className="text-slate-500">Your review has been submitted successfully.</p>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Rate Your Experience</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Seller Info */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
              {seller?.full_name?.[0] || 'S'}
            </div>
            <div>
              <p className="font-semibold">{seller?.full_name || 'Seller'}</p>
              <p className="text-sm text-slate-500">{car?.year} {car?.make} {car?.model}</p>
            </div>
          </div>

          {/* Ratings */}
          <div className="space-y-4">
            <StarRating 
              value={ratings.overall} 
              onChange={(v) => setRatings({...ratings, overall: v})}
              label="Overall Experience *"
            />
            <StarRating 
              value={ratings.accuracy} 
              onChange={(v) => setRatings({...ratings, accuracy: v})}
              label="Description Accuracy"
            />
            <StarRating 
              value={ratings.communication} 
              onChange={(v) => setRatings({...ratings, communication: v})}
              label="Communication"
            />
            <StarRating 
              value={ratings.condition} 
              onChange={(v) => setRatings({...ratings, condition: v})}
              label="Vehicle Condition"
            />
          </div>

          {/* Review Text */}
          <div>
            <Label>Write a Review (Optional)</Label>
            <Textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience with other buyers..."
              className="mt-1 h-24"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Skip</Button>
          <Button 
            onClick={handleSubmit}
            disabled={ratings.overall === 0 || isSubmitting}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

```jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  TrendingUp, Flame, Clock, Gavel, ChevronRight, 
  Star, Eye, Users, Zap 
} from 'lucide-react';
import CountdownTimer from '@/components/auction/CountdownTimer';

export default function FeaturedAuctions() {
  const { data: cars = [] } = useQuery({
    queryKey: ['featuredCars'],
    queryFn: () => base44.entities.Car.filter({ status: 'in_auction' }, '-current_bid', 20)
  });

  const { data: analytics = [] } = useQuery({
    queryKey: ['carAnalytics'],
    queryFn: () => base44.entities.CarAnalytics.list('-views', 50)
  });

  // Feature cars with highest activity (bids, views, etc.)
  const getFeaturedCars = () => {
    if (cars.length === 0) {
      return [
        { id: '1', make: 'Mercedes', model: 'C-Class', year: 2022, current_bid: 8500000, starting_bid: 7500000, condition: 'excellent', mileage: 18000, images: ['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600'], bidCount: 45, views: 320, isHot: true },
        { id: '2', make: 'BMW', model: '3 Series', year: 2021, current_bid: 7200000, starting_bid: 6500000, condition: 'excellent', mileage: 22000, images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600'], bidCount: 38, views: 280, isHot: true },
        { id: '3', make: 'Audi', model: 'A4', year: 2022, current_bid: 6800000, starting_bid: 6000000, condition: 'good', mileage: 25000, images: ['https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600'], bidCount: 32, views: 245, isHot: false },
        { id: '4', make: 'Toyota', model: 'Land Cruiser', year: 2020, current_bid: 15500000, starting_bid: 14000000, condition: 'excellent', mileage: 35000, images: ['https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600'], bidCount: 52, views: 420, isHot: true },
      ];
    }
    
    return cars.slice(0, 4).map((car, i) => {
      const carAnalytic = analytics.find(a => a.car_id === car.id);
      return {
        ...car,
        bidCount: carAnalytic?.bids_count || (20 + i * 10),
        views: carAnalytic?.views || (150 + i * 50),
        isHot: (carAnalytic?.bids_count || 0) > 30 || i < 2
      };
    });
  };

  const featuredCars = getFeaturedCars();

  return (
    <section className="py-16 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-6 h-6 text-[#FFA602]" />
              <Badge className="bg-[#FFA602]/10 text-[#FFA602] border-[#FFA602]/20">
                High Activity
              </Badge>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Featured Auctions</h2>
            <p className="text-slate-500">
              Most watched vehicles with highest bidding activity
            </p>
          </div>
          <Link to={createPageUrl('LiveAuction')}>
            <Button variant="ghost" className="text-[#FFA602] hover:text-amber-600">
              View All Auctions
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </Link>
        </div>

        {/* Featured Cars Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredCars.map((car, index) => (
            <motion.div
              key={car.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={createPageUrl(`CarDetail?id=${car.id}`)}>
                <Card className="group overflow-hidden border-slate-200 hover:border-[#FFA602] hover:shadow-xl hover:shadow-[#FFA602]/10 transition-all duration-300">
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                    <img
                      src={car.images?.[0] || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600'}
                      alt={`${car.make} ${car.model}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Hot Badge */}
                    {car.isHot && (
                      <Badge className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-orange-500 text-white border-0 animate-pulse">
                        <Flame className="w-3 h-3 mr-1" />
                        Hot
                      </Badge>
                    )}
                    
                    {/* Stats Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <div className="flex items-center justify-between text-white text-xs">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {car.views} views
                        </span>
                        <span className="flex items-center gap-1">
                          <Gavel className="w-3 h-3" />
                          {car.bidCount} bids
                        </span>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    {/* Title */}
                    <h3 className="font-bold text-slate-900 mb-1 line-clamp-1">
                      {car.year} {car.make} {car.model}
                    </h3>
                    
                    {/* Condition & Mileage */}
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                      <Badge variant="outline" className="text-xs capitalize">
                        {car.condition}
                      </Badge>
                      <span>{car.mileage?.toLocaleString()} km</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-500">Current Bid</p>
                        <p className="text-lg font-bold text-[#FFA602]">
                          PKR {car.current_bid?.toLocaleString()}
                        </p>
                      </div>
                      <TrendingUp className="w-6 h-6 text-emerald-500" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Activity Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="mt-10 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="w-12 h-12 bg-[#FFA602]/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-[#FFA602]" />
              </div>
              <p className="text-2xl font-bold text-white">127</p>
              <p className="text-sm text-slate-400">Active Bidders</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Gavel className="w-6 h-6 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-white">458</p>
              <p className="text-sm text-slate-400">Bids Today</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Eye className="w-6 h-6 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-white">2.4K</p>
              <p className="text-sm text-slate-400">Page Views</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-white">₨85M</p>
              <p className="text-sm text-slate-400">Total Bids Value</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
```

```jsx
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Bell, AlertCircle, Trophy, Calendar, Clock, DollarSign,
  CheckCircle, Gavel, TrendingUp, X, Check, Trash2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const notificationConfig = {
  outbid: { icon: AlertCircle, color: 'text-amber-600 bg-amber-100', urgent: true },
  auction_won: { icon: Trophy, color: 'text-emerald-600 bg-emerald-100', urgent: false },
  auction_reminder: { icon: Calendar, color: 'text-blue-600 bg-blue-100', urgent: true },
  payment_due: { icon: Clock, color: 'text-red-600 bg-red-100', urgent: true },
  verification: { icon: CheckCircle, color: 'text-emerald-600 bg-emerald-100', urgent: false },
  new_bid: { icon: Gavel, color: 'text-purple-600 bg-purple-100', urgent: false },
  car_sold: { icon: DollarSign, color: 'text-emerald-600 bg-emerald-100', urgent: false },
  bid_on_followed: { icon: TrendingUp, color: 'text-orange-600 bg-orange-100', urgent: false },
  general: { icon: Bell, color: 'text-slate-600 bg-slate-100', urgent: false }
};

export default function NotificationCenter({ userId }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', userId],
    queryFn: () => userId ? base44.entities.Notification.filter({ user_id: userId }, '-created_date', 50) : [],
    enabled: !!userId,
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Real-time subscription
  useEffect(() => {
    if (!userId) return;
    
    const unsubscribe = base44.entities.Notification.subscribe((event) => {
      if (event.data.user_id === userId) {
        queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
        
        // Show browser notification for urgent items
        if (event.type === 'create' && notificationConfig[event.data.type]?.urgent) {
          if (Notification.permission === 'granted') {
            new Notification(event.data.title, {
              body: event.data.message,
              icon: '/favicon.ico'
            });
          }
        }
      }
    });

    return unsubscribe;
  }, [userId, queryClient]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const markAsReadMutation = useMutation({
    mutationFn: (notifId) => base44.entities.Notification.update(notifId, { is_read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', userId] })
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const unread = notifications.filter(n => !n.is_read);
      await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { is_read: true })));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', userId] })
  });

  const deleteNotification = useMutation({
    mutationFn: (notifId) => base44.entities.Notification.delete(notifId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', userId] })
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => markAllReadMutation.mutate()}
              className="text-xs"
            >
              <Check className="w-3 h-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <Bell className="w-12 h-12 text-slate-300 mb-3" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <AnimatePresence>
              {notifications.map((notif) => {
                const config = notificationConfig[notif.type] || notificationConfig.general;
                const Icon = config.icon;
                
                return (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className={`
                      p-4 border-b hover:bg-slate-50 transition-colors cursor-pointer relative group
                      ${!notif.is_read ? 'bg-orange-50/50' : ''}
                    `}
                    onClick={() => {
                      if (!notif.is_read) markAsReadMutation.mutate(notif.id);
                      if (notif.link) {
                        setOpen(false);
                        window.location.href = createPageUrl(notif.link);
                      }
                    }}
                  >
                    <div className="flex gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${config.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`font-medium text-sm ${!notif.is_read ? 'text-slate-900' : 'text-slate-700'}`}>
                            {notif.title}
                          </p>
                          {!notif.is_read && (
                            <span className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-sm text-slate-500 line-clamp-2">{notif.message}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {formatDistanceToNow(new Date(notif.created_date), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification.mutate(notif.id);
                      }}
                      className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-200 rounded"
                    >
                      <X className="w-4 h-4 text-slate-400" />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
```

```jsx
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover, PopoverContent, PopoverTrigger
} from '@/components/ui/popover';
import {
  Bell, BellRing, CheckCheck, Zap, Trophy, AlertCircle,
  Gavel, Wallet, Clock, ArrowUpRight
} from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const typeConfig = {
  outbid: { icon: Gavel, color: 'text-orange-500', bg: 'bg-orange-50', label: 'Outbid' },
  auction_won: { icon: Trophy, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Won!' },
  auction_reminder: { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Reminder' },
  payment_due: { icon: Wallet, color: 'text-red-500', bg: 'bg-red-50', label: 'Payment Due' },
  verification: { icon: CheckCheck, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Verified' },
  general: { icon: Bell, color: 'text-slate-500', bg: 'bg-slate-50', label: 'Notice' }
};

export default function NotificationDropdown({ userId }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', userId],
    queryFn: () => base44.entities.Notification.filter({ user_id: userId }, '-created_date', 30),
    enabled: !!userId,
    refetchInterval: 30000
  });

  // Real-time subscription
  useEffect(() => {
    if (!userId) return;
    const unsub = base44.entities.Notification.subscribe((event) => {
      if (event.data?.user_id === userId) {
        queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
      }
    });
    return unsub;
  }, [userId, queryClient]);

  const markReadMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { is_read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', userId] })
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const unread = notifications.filter(n => !n.is_read);
      await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { is_read: true })));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', userId] })
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-lg hover:bg-white/10 transition-colors">
          {unreadCount > 0 ? (
            <BellRing className="w-5 h-5 animate-pulse" />
          ) : (
            <Bell className="w-5 h-5" />
          )}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 shadow-xl border-slate-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#FFA602]" />
            <span className="font-semibold text-slate-900">Notifications</span>
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white border-0 text-xs">{unreadCount}</Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs text-slate-500 h-7"
              onClick={() => markAllReadMutation.mutate()}>
              <CheckCheck className="w-3 h-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-96">
          {notifications.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <Bell className="w-10 h-10 mx-auto mb-2 opacity-20" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div>
              {notifications.map((notif) => {
                const cfg = typeConfig[notif.type] || typeConfig.general;
                const Icon = cfg.icon;
                return (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-3 p-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors ${!notif.is_read ? 'bg-amber-50/50' : ''}`}
                    onClick={() => {
                      if (!notif.is_read) markReadMutation.mutate(notif.id);
                      if (notif.link) window.location.href = notif.link;
                      setOpen(false);
                    }}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                      <Icon className={`w-4 h-4 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-slate-900 text-sm leading-tight">{notif.title}</p>
                        {!notif.is_read && (
                          <span className="w-2 h-2 bg-[#FFA602] rounded-full flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{notif.message}</p>
                      <p className="text-xs text-slate-400 mt-1">{format(new Date(notif.created_date), 'MMM d, h:mm a')}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <div className="p-3 border-t border-slate-100">
          <Link
            to={createPageUrl('UserProfile')}
            className="block w-full text-center text-xs text-[#FFA602] hover:underline"
            onClick={() => setOpen(false)}
          >
            View all in Profile
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

```jsx

import { base44 } from '@/api/base44Client';

export const NotificationService = {
  // Buyer notifications
  async notifyOutbid(userId, carDetails, newBidAmount) {
    await base44.entities.Notification.create({
      user_id: userId,
      title: 'You\'ve been outbid!',
      message: `Someone placed a higher bid of PKR ${newBidAmount.toLocaleString()} on ${carDetails}`,
      type: 'outbid',
      is_read: false
    });
  },

  async notifyAuctionWon(userId, carDetails, finalPrice) {
    await base44.entities.Notification.create({
      user_id: userId,
      title: 'Congratulations! You won!',
      message: `You won the auction for ${carDetails} at PKR ${finalPrice.toLocaleString()}. Complete payment within 48 hours.`,
      type: 'auction_won',
      is_read: false
    });
  },

  async notifyAuctionReminder(userId, auctionTitle, startsIn) {
    await base44.entities.Notification.create({
      user_id: userId,
      title: 'Auction Starting Soon',
      message: `${auctionTitle} starts ${startsIn}. Don't miss your chance to bid!`,
      type: 'auction_reminder',
      is_read: false
    });
  },

  async notifyPaymentDue(userId, carDetails, deadline) {
    await base44.entities.Notification.create({
      user_id: userId,
      title: 'Payment Due Soon',
      message: `Payment for ${carDetails} is due by ${deadline}. Complete payment to collect your vehicle.`,
      type: 'payment_due',
      is_read: false
    });
  },

  async notifyFollowedCarBid(userId, carDetails, bidAmount) {
    await base44.entities.Notification.create({
      user_id: userId,
      title: 'Activity on Followed Car',
      message: `New bid of PKR ${bidAmount.toLocaleString()} placed on ${carDetails}`,
      type: 'bid_on_followed',
      is_read: false
    });
  },

  // Seller notifications
  async notifyNewBid(sellerId, carDetails, bidAmount, bidderName) {
    await base44.entities.Notification.create({
      user_id: sellerId,
      title: 'New Bid on Your Car',
      message: `${bidderName} placed a bid of PKR ${bidAmount.toLocaleString()} on your ${carDetails}`,
      type: 'new_bid',
      is_read: false
    });
  },

  async notifyCarSold(sellerId, carDetails, finalPrice) {
    await base44.entities.Notification.create({
      user_id: sellerId,
      title: 'Your Car Has Been Sold!',
      message: `Congratulations! Your ${carDetails} sold for PKR ${finalPrice.toLocaleString()}`,
      type: 'car_sold',
      is_read: false
    });
  },

  async notifyCarApproved(sellerId, carDetails) {
    await base44.entities.Notification.create({
      user_id: sellerId,
      title: 'Car Approved for Auction',
      message: `Your ${carDetails} has been approved and will be listed in the next auction`,
      type: 'verification',
      is_read: false
    });
  }
};

export default NotificationService;
```

```jsx
import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, BellOff, Check, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function PushNotificationManager({ userId }) {
  const [permission, setPermission] = useState('default');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Push notifications not supported in this browser');
      return;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    
    if (result === 'granted') {
      setSubscribed(true);
      toast.success('Push notifications enabled!');
      
      // Show test notification
      new Notification('Okara Auto Auction', {
        body: 'You will now receive bid alerts and auction updates',
        icon: '/favicon.ico'
      });
    }
  };

  // Subscribe to important events
  useEffect(() => {
    if (!userId || permission !== 'granted') return;

    // Listen for outbid events
    const unsubscribeBid = base44.entities.Bid.subscribe((event) => {
      if (event.type === 'create' && event.data.bidder_id !== userId) {
        // Could check if user had a previous bid on this car
        // For now, just show notification for any new bid
      }
    });

    // Listen for notifications
    const unsubscribeNotif = base44.entities.Notification.subscribe((event) => {
      if (event.type === 'create' && event.data.user_id === userId) {
        const notif = event.data;
        
        // Show browser notification
        if (permission === 'granted') {
          new Notification(notif.title, {
            body: notif.message,
            icon: '/favicon.ico',
            tag: notif.id
          });
        }
        
        // Also show in-app toast
        toast(notif.title, {
          description: notif.message,
          icon: notif.type === 'outbid' ? <AlertTriangle className="w-4 h-4 text-amber-500" /> : <Bell className="w-4 h-4" />
        });
      }
    });

    return () => {
      unsubscribeBid();
      unsubscribeNotif();
    };
  }, [userId, permission]);

  if (permission === 'granted' && subscribed) {
    return (
      <Card className="bg-emerald-50 border-emerald-200">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <Check className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-medium text-emerald-900">Push Notifications Enabled</p>
              <p className="text-sm text-emerald-700">You'll receive alerts for bids and auctions</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (permission === 'denied') {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <BellOff className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="font-medium text-red-900">Notifications Blocked</p>
              <p className="text-sm text-red-700">Enable in browser settings to receive alerts</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-blue-900">Enable Push Notifications</p>
              <p className="text-sm text-blue-700">Get alerts when you're outbid or auctions end</p>
            </div>
          </div>
          <Button onClick={requestPermission} className="bg-blue-600 hover:bg-blue-700">
            Enable
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

```jsx
import { useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Background service: watches bids & inspection bookings for a seller's cars
 * and creates Notification records automatically.
 */
export default function SellerNotificationService({ sellerId, sellerCars = [] }) {
  const processedBids = useRef(new Set());
  const processedBookings = useRef(new Set());

  useEffect(() => {
    if (!sellerId || sellerCars.length === 0) return;

    const carIds = sellerCars.map(c => c.id);

    // Subscribe to new bids
    const unsubBid = base44.entities.Bid.subscribe(async (event) => {
      if (event.type !== 'create') return;
      const bid = event.data;
      if (!carIds.includes(bid.car_id)) return;
      if (processedBids.current.has(event.id)) return;
      processedBids.current.add(event.id);

      const car = sellerCars.find(c => c.id === bid.car_id);
      const carName = car ? `${car.year} ${car.make} ${car.model}` : 'your car';
      const reservePct = car?.reserve_price ? (bid.amount / car.reserve_price) * 100 : 0;

      // Always notify seller of new bid
      await base44.entities.Notification.create({
        user_id: sellerId,
        title: 'New Bid Received',
        message: `${bid.bidder_name || 'A bidder'} placed PKR ${bid.amount?.toLocaleString()} on ${carName}`,
        type: 'general',
        is_read: false,
        link: `/CarDetail?id=${bid.car_id}`
      });

      // Milestone: 75% of reserve price
      if (reservePct >= 75 && reservePct < 100) {
        await base44.entities.Notification.create({
          user_id: sellerId,
          title: '🎯 75% of Reserve Price Reached',
          message: `${carName} is at ${Math.round(reservePct)}% of your reserve price. Bidding is heating up!`,
          type: 'auction_reminder',
          is_read: false,
          link: `/CarDetail?id=${bid.car_id}`
        });
      }

      // Milestone: Reserve price met
      if (reservePct >= 100) {
        await base44.entities.Notification.create({
          user_id: sellerId,
          title: '✅ Reserve Price Met!',
          message: `${carName} has reached your reserve price of PKR ${car.reserve_price?.toLocaleString()}. A sale is guaranteed!`,
          type: 'auction_won',
          is_read: false,
          link: `/CarDetail?id=${bid.car_id}`
        });
      }
    });

    // Subscribe to inspection bookings
    const unsubBooking = base44.entities.InspectionBooking.subscribe(async (event) => {
      if (event.type !== 'create') return;
      const booking = event.data;
      if (!carIds.includes(booking.car_id)) return;
      if (processedBookings.current.has(event.id)) return;
      processedBookings.current.add(event.id);

      const car = sellerCars.find(c => c.id === booking.car_id);
      const carName = car ? `${car.year} ${car.make} ${car.model}` : 'your car';

      await base44.entities.Notification.create({
        user_id: sellerId,
        title: '🔍 Inspection Booking Request',
        message: `${booking.buyer_name || 'A buyer'} has requested an inspection for ${carName} on ${booking.preferred_date || 'a scheduled date'}`,
        type: 'general',
        is_read: false,
        link: `/SellerDashboard`
      });
    });

    return () => {
      unsubBid();
      unsubBooking();
    };
  }, [sellerId, sellerCars]);

  return null; // Headless service component
}
```

```jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, Car, DollarSign, Calendar, ChevronRight, 
  ShoppingBag, Tag, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

export default function SoldHistory({ userId, userType }) {
  const { data: wonCars = [] } = useQuery({
    queryKey: ['wonCars', userId],
    queryFn: () => userId ? base44.entities.Car.filter({ winner_id: userId }, '-updated_date', 50) : [],
    enabled: !!userId && userType !== 'seller'
  });

  const { data: soldCars = [] } = useQuery({
    queryKey: ['soldCars', userId],
    queryFn: () => userId ? base44.entities.Car.filter({ seller_id: userId, status: 'sold' }, '-updated_date', 50) : [],
    enabled: !!userId
  });

  const { data: escrowPayments = [] } = useQuery({
    queryKey: ['userEscrow', userId],
    queryFn: () => userId ? base44.entities.EscrowPayment.filter({ buyer_id: userId }, '-created_date', 50) : [],
    enabled: !!userId
  });

  // Sample data
  const sampleWon = wonCars.length > 0 ? wonCars : [
    { id: 1, make: 'Toyota', model: 'Corolla', year: 2022, final_price: 3850000, updated_date: '2024-01-15', images: ['https://images.unsplash.com/photo-1590362891991-f776e747a588?w=400'] },
    { id: 2, make: 'Honda', model: 'Civic', year: 2021, final_price: 4200000, updated_date: '2024-01-10', images: ['https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400'] }
  ];

  const sampleSold = soldCars.length > 0 ? soldCars : [
    { id: 3, make: 'Suzuki', model: 'Alto', year: 2023, final_price: 1650000, updated_date: '2024-01-20', images: ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400'] }
  ];

  const totalBought = sampleWon.reduce((sum, c) => sum + (c.final_price || 0), 0);
  const totalSold = sampleSold.reduce((sum, c) => sum + (c.final_price || 0), 0);

  const renderCarItem = (car, type) => (
    <motion.div
      key={car.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
    >
      <div className="w-20 h-14 bg-slate-200 rounded-lg overflow-hidden flex-shrink-0">
        <img
          src={car.images?.[0] || 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=200'}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-slate-900">{car.year} {car.make} {car.model}</h4>
        <div className="flex items-center gap-3 mt-1 text-sm">
          <span className="text-slate-500 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(car.updated_date).toLocaleDateString()}
          </span>
          {type === 'won' && <Badge className="bg-emerald-100 text-emerald-700">Won</Badge>}
          {type === 'sold' && <Badge className="bg-purple-100 text-purple-700">Sold</Badge>}
        </div>
      </div>
      <div className="text-right">
        <p className={`font-bold text-lg ${type === 'won' ? 'text-red-600' : 'text-emerald-600'}`}>
          {type === 'won' ? '-' : '+'} PKR {car.final_price?.toLocaleString()}
        </p>
        <Link to={createPageUrl('CarDetail') + `?id=${car.id}`}>
          <Button variant="ghost" size="sm">
            View <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          Transaction History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-red-50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-red-600 mb-1">
              <ArrowDownRight className="w-4 h-4" />
              <span className="text-sm font-medium">Total Purchased</span>
            </div>
            <p className="text-2xl font-bold text-red-700">PKR {(totalBought / 1000000).toFixed(2)}M</p>
            <p className="text-xs text-red-500">{sampleWon.length} vehicles</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <ArrowUpRight className="w-4 h-4" />
              <span className="text-sm font-medium">Total Sold</span>
            </div>
            <p className="text-2xl font-bold text-emerald-700">PKR {(totalSold / 1000000).toFixed(2)}M</p>
            <p className="text-xs text-emerald-500">{sampleSold.length} vehicles</p>
          </div>
        </div>

        <Tabs defaultValue="bought">
          <TabsList className="mb-4">
            <TabsTrigger value="bought" className="gap-2">
              <ShoppingBag className="w-4 h-4" />
              Purchased ({sampleWon.length})
            </TabsTrigger>
            <TabsTrigger value="sold" className="gap-2">
              <Tag className="w-4 h-4" />
              Sold ({sampleSold.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bought">
            <div className="space-y-3">
              {sampleWon.length > 0 ? (
                sampleWon.map(car => renderCarItem(car, 'won'))
              ) : (
                <div className="text-center py-8">
                  <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No purchases yet</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="sold">
            <div className="space-y-3">
              {sampleSold.length > 0 ? (
                sampleSold.map(car => renderCarItem(car, 'sold'))
              ) : (
                <div className="text-center py-8">
                  <Tag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No sales yet</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
```

```jsx
import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, TrendingUp, Bell } from 'lucide-react';
import { toast } from 'sonner';

export default function LiveAuctionUpdates({ carIds, onBidUpdate, userId }) {
  const [recentBids, setRecentBids] = useState([]);

  useEffect(() => {
    // Subscribe to bid updates
    const unsubscribeBid = base44.entities.Bid.subscribe((event) => {
      if (event.type === 'create') {
        const bid = event.data;
        
        // Add to recent bids feed
        setRecentBids(prev => [bid, ...prev].slice(0, 10));
        
        // Show toast notification
        toast.success(`New bid: PKR ${bid.amount?.toLocaleString()}`, {
          description: `${bid.bidder_name || 'Someone'} placed a bid`,
          icon: <TrendingUp className="w-4 h-4" />
        });
        
        // Trigger parent update if callback provided
        if (onBidUpdate) {
          onBidUpdate(bid);
        }
        
        // Check if user was outbid
        if (userId && bid.bidder_id !== userId && carIds?.includes(bid.car_id)) {
          // User might be outbid - trigger notification
          toast.warning('You may have been outbid!', {
            description: 'Check your active bids',
            icon: <Bell className="w-4 h-4" />
          });
        }
      }
    });

    // Subscribe to car updates (for current_bid changes)
    const unsubscribeCar = base44.entities.Car.subscribe((event) => {
      if (event.type === 'update' && carIds?.includes(event.id)) {
        if (onBidUpdate) {
          onBidUpdate({ car_id: event.id, ...event.data });
        }
      }
    });

    return () => {
      unsubscribeBid();
      unsubscribeCar();
    };
  }, [carIds, onBidUpdate, userId]);

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <AnimatePresence>
        {recentBids.slice(0, 3).map((bid, index) => (
          <motion.div
            key={bid.id || index}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white shadow-lg rounded-lg p-3 mb-2 border border-slate-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <Zap className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">
                  PKR {bid.amount?.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500">
                  {bid.bidder_name || 'New bid'} • Just now
                </p>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                Live
              </Badge>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
```

```jsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Filter, X, RotateCcw } from 'lucide-react';

const MAKES = ['Toyota', 'Honda', 'Suzuki', 'Hyundai', 'Kia', 'Mercedes', 'BMW', 'Audi', 'Nissan', 'Mazda', 'Ford', 'Chevrolet', 'Mitsubishi', 'Daihatsu'];
const MODELS_BY_MAKE = {
  Toyota: ['Corolla', 'Camry', 'Yaris', 'Fortuner', 'Land Cruiser', 'Prius', 'Hilux'],
  Honda: ['Civic', 'City', 'Accord', 'BR-V', 'CR-V', 'HR-V', 'Fit'],
  Suzuki: ['Alto', 'Cultus', 'Swift', 'Wagon R', 'Mehran', 'Bolan', 'Jimny'],
  Hyundai: ['Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Ioniq'],
  Kia: ['Sportage', 'Picanto', 'Sorento', 'Carnival', 'Stonic']
};

export default function AdvancedFilters({ filters, onFiltersChange, onClear }) {
  const [open, setOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  const activeFilterCount = Object.values(filters).filter(v => 
    v && v !== 'all' && (Array.isArray(v) ? v.length > 0 : true)
  ).length;

  const updateLocalFilter = (key, value) => {
    setLocalFilters({ ...localFilters, [key]: value });
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
    setOpen(false);
  };

  const clearFilters = () => {
    const cleared = {
      make: 'all',
      model: 'all',
      yearMin: '',
      yearMax: '',
      priceMin: '',
      priceMax: '',
      condition: 'all',
      transmission: 'all',
      fuelType: 'all',
      sortBy: 'ending_soon'
    };
    setLocalFilters(cleared);
    onClear();
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="w-4 h-4 mr-2" />
          Advanced Filters
          {activeFilterCount > 0 && (
            <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center bg-orange-500 text-white text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Filter Vehicles</span>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Make */}
          <div>
            <Label>Make</Label>
            <Select value={localFilters.make} onValueChange={(v) => updateLocalFilter('make', v)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="All Makes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Makes</SelectItem>
                {MAKES.map(make => (
                  <SelectItem key={make} value={make}>{make}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Model */}
          <div>
            <Label>Model</Label>
            <Select 
              value={localFilters.model} 
              onValueChange={(v) => updateLocalFilter('model', v)}
              disabled={localFilters.make === 'all'}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="All Models" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Models</SelectItem>
                {(MODELS_BY_MAKE[localFilters.make] || []).map(model => (
                  <SelectItem key={model} value={model}>{model}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Year Range */}
          <div>
            <Label>Year Range</Label>
            <div className="grid grid-cols-2 gap-3 mt-1">
              <Select value={localFilters.yearMin} onValueChange={(v) => updateLocalFilter('yearMin', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="From" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Any</SelectItem>
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={localFilters.yearMax} onValueChange={(v) => updateLocalFilter('yearMax', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="To" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Any</SelectItem>
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Price Range */}
          <div>
            <Label>Price Range (PKR)</Label>
            <div className="grid grid-cols-2 gap-3 mt-1">
              <Input
                type="number"
                placeholder="Min"
                value={localFilters.priceMin}
                onChange={(e) => updateLocalFilter('priceMin', e.target.value)}
              />
              <Input
                type="number"
                placeholder="Max"
                value={localFilters.priceMax}
                onChange={(e) => updateLocalFilter('priceMax', e.target.value)}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-slate-500">
              <span>PKR 500,000</span>
              <span>PKR 50,000,000</span>
            </div>
          </div>

          {/* Condition */}
          <div>
            <Label>Condition</Label>
            <Select value={localFilters.condition} onValueChange={(v) => updateLocalFilter('condition', v)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="All Conditions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Conditions</SelectItem>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
                <SelectItem value="needs_repair">Needs Repair</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Transmission */}
          <div>
            <Label>Transmission</Label>
            <Select value={localFilters.transmission} onValueChange={(v) => updateLocalFilter('transmission', v)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="automatic">Automatic</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Fuel Type */}
          <div>
            <Label>Fuel Type</Label>
            <Select value={localFilters.fuelType} onValueChange={(v) => updateLocalFilter('fuelType', v)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="petrol">Petrol</SelectItem>
                <SelectItem value="diesel">Diesel</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
                <SelectItem value="electric">Electric</SelectItem>
                <SelectItem value="cng">CNG</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort By */}
          <div>
            <Label>Sort By</Label>
            <Select value={localFilters.sortBy} onValueChange={(v) => updateLocalFilter('sortBy', v)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ending_soon">Ending Soon</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
                <SelectItem value="newest">Newest Arrivals</SelectItem>
                <SelectItem value="year_new">Year: Newest First</SelectItem>
                <SelectItem value="year_old">Year: Oldest First</SelectItem>
                <SelectItem value="mileage_low">Mileage: Low to High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <SheetFooter className="gap-3">
          <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
            Cancel
          </Button>
          <Button onClick={applyFilters} className="flex-1 bg-orange-500 hover:bg-orange-600">
            Apply Filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
```

```jsx
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Bookmark, Plus, Bell, Trash2, Search, Check } from 'lucide-react';

export default function SavedSearches({ currentFilters, onApplyFilter, userId }) {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [searchName, setSearchName] = useState('');
  const queryClient = useQueryClient();

  const { data: savedSearches = [] } = useQuery({
    queryKey: ['savedSearches', userId],
    queryFn: () => userId ? base44.entities.SavedSearch.filter({ user_id: userId }, '-created_date', 20) : [],
    enabled: !!userId
  });

  const saveSearchMutation = useMutation({
    mutationFn: (data) => base44.entities.SavedSearch.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedSearches'] });
      setShowSaveDialog(false);
      setSearchName('');
    }
  });

  const deleteSearchMutation = useMutation({
    mutationFn: (id) => base44.entities.SavedSearch.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['savedSearches'] })
  });

  const toggleNotificationMutation = useMutation({
    mutationFn: ({ id, enabled }) => base44.entities.SavedSearch.update(id, { notification_enabled: enabled }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['savedSearches'] })
  });

  const handleSave = () => {
    if (!searchName.trim()) return;
    saveSearchMutation.mutate({
      user_id: userId,
      name: searchName,
      filters: currentFilters,
      notification_enabled: true
    });
  };

  const getFilterSummary = (filters) => {
    const parts = [];
    if (filters.make && filters.make !== 'all') parts.push(filters.make);
    if (filters.condition && filters.condition !== 'all') parts.push(filters.condition);
    if (filters.priceMin || filters.priceMax) parts.push(`PKR ${filters.priceMin || '0'}-${filters.priceMax || '∞'}`);
    return parts.length > 0 ? parts.join(', ') : 'All cars';
  };

  return (
    <div>
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Bookmark className="w-4 h-4" />
            Save Search
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save This Search</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="Give this search a name..."
            />
            <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-600">
              <p className="font-medium mb-1">Current Filters:</p>
              <p>{getFilterSummary(currentFilters)}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saveSearchMutation.isPending} className="bg-[#FFA602]">
              <Check className="w-4 h-4 mr-2" />
              Save Search
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {savedSearches.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-slate-700">Saved Searches</p>
          {savedSearches.map((search) => (
            <div key={search.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
              <button onClick={() => onApplyFilter(search.filters)} className="flex-1 text-left">
                <p className="font-medium text-slate-900">{search.name}</p>
                <p className="text-xs text-slate-500">{getFilterSummary(search.filters)}</p>
              </button>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Bell className={`w-4 h-4 ${search.notification_enabled ? 'text-[#FFA602]' : 'text-slate-400'}`} />
                  <Switch
                    checked={search.notification_enabled}
                    onCheckedChange={(v) => toggleNotificationMutation.mutate({ id: search.id, enabled: v })}
                  />
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteSearchMutation.mutate(search.id)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

```jsx
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ImagePlus, X, Upload, Loader2, GripVertical, 
  Star, Trash2, ZoomIn 
} from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';

export default function CarImageUploader({ images = [], onChange, maxImages = 10 }) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState(null);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    const remainingSlots = maxImages - images.length;
    const filesToUpload = files.slice(0, remainingSlots);
    
    setUploading(true);
    setUploadProgress(0);
    
    const uploadedUrls = [];
    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      uploadedUrls.push(file_url);
      setUploadProgress(((i + 1) / filesToUpload.length) * 100);
    }
    
    onChange([...images, ...uploadedUrls]);
    setUploading(false);
    setUploadProgress(0);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const setAsPrimary = (index) => {
    if (index === 0) return;
    const newImages = [...images];
    const [removed] = newImages.splice(index, 1);
    newImages.unshift(removed);
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Image Grid */}
      <Reorder.Group 
        axis="x" 
        values={images} 
        onReorder={onChange}
        className="flex flex-wrap gap-3"
      >
        <AnimatePresence>
          {images.map((url, index) => (
            <Reorder.Item
              key={url}
              value={url}
              className="relative group"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={`
                  relative w-28 h-28 rounded-xl overflow-hidden border-2 cursor-grab
                  ${index === 0 ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-slate-200'}
                `}
              >
                <img 
                  src={url} 
                  alt={`Car image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Primary badge */}
                {index === 0 && (
                  <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-orange-500 text-white text-[10px] font-medium rounded">
                    PRIMARY
                  </div>
                )}
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewImage(url)}
                    className="p-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                  >
                    <ZoomIn className="w-4 h-4 text-white" />
                  </button>
                  {index !== 0 && (
                    <button
                      type="button"
                      onClick={() => setAsPrimary(index)}
                      className="p-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                      title="Set as primary"
                    >
                      <Star className="w-4 h-4 text-white" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="p-1.5 bg-red-500/80 rounded-lg hover:bg-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
                
                {/* Drag handle */}
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical className="w-4 h-4 text-white drop-shadow" />
                </div>
              </motion.div>
            </Reorder.Item>
          ))}
        </AnimatePresence>

        {/* Add More Button */}
        {images.length < maxImages && (
          <label className={`
            w-28 h-28 border-2 border-dashed border-slate-300 rounded-xl
            flex flex-col items-center justify-center cursor-pointer
            hover:border-orange-400 hover:bg-orange-50 transition-colors
            ${uploading ? 'pointer-events-none opacity-50' : ''}
          `}>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
            {uploading ? (
              <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
            ) : (
              <>
                <ImagePlus className="w-6 h-6 text-slate-400 mb-1" />
                <span className="text-xs text-slate-500">Add Photos</span>
              </>
            )}
          </label>
        )}
      </Reorder.Group>

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-2">
          <Progress value={uploadProgress} className="h-2" />
          <p className="text-sm text-slate-500 text-center">
            Uploading... {Math.round(uploadProgress)}%
          </p>
        </div>
      )}

      {/* Helper text */}
      <p className="text-sm text-slate-500">
        {images.length}/{maxImages} images uploaded. Drag to reorder. First image will be the main photo.
      </p>

      {/* Full Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setPreviewImage(null)}
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <img 
              src={previewImage} 
              alt="Preview"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

```jsx
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, Plus, Calendar, Clock, CheckCircle, XCircle, Upload, 
  Image, AlertTriangle, Eye
} from 'lucide-react';

export default function InspectionManager({ car, sellerId }) {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [newReport, setNewReport] = useState({
    type: 'mechanical',
    findings: '',
    images: []
  });
  const queryClient = useQueryClient();

  const { data: bookings = [] } = useQuery({
    queryKey: ['inspectionBookings', car?.id],
    queryFn: () => base44.entities.InspectionBooking.filter({ car_id: car.id }, '-created_date', 20),
    enabled: !!car?.id
  });

  const updateBookingMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.InspectionBooking.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inspectionBookings'] })
  });

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    const uploadPromises = files.map(file => base44.integrations.Core.UploadFile({ file }));
    const results = await Promise.all(uploadPromises);
    setNewReport({
      ...newReport,
      images: [...newReport.images, ...results.map(r => r.file_url)]
    });
  };

  const statusConfig = {
    pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: Clock },
    confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
    completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: XCircle }
  };

  // Sample bookings if none exist
  const displayBookings = bookings.length > 0 ? bookings : [
    { id: 1, buyer_name: 'Ahmed Khan', booking_date: '2024-02-15', booking_time: '10:00 AM', status: 'pending', buyer_phone: '0300-1234567' },
    { id: 2, buyer_name: 'Fatima Ali', booking_date: '2024-02-16', booking_time: '2:00 PM', status: 'confirmed', buyer_phone: '0321-9876543' }
  ];

  return (
    <div className="space-y-6">
      {/* Inspection Reports */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            Inspection Reports
          </CardTitle>
          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-[#FFA602]">
                <Plus className="w-4 h-4 mr-2" />
                Add Report
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Inspection Report</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Report Type</Label>
                  <Select value={newReport.type} onValueChange={(v) => setNewReport({ ...newReport, type: v })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mechanical">Mechanical Inspection</SelectItem>
                      <SelectItem value="body">Body & Paint</SelectItem>
                      <SelectItem value="electrical">Electrical Systems</SelectItem>
                      <SelectItem value="interior">Interior Condition</SelectItem>
                      <SelectItem value="third_party">Third-Party Inspection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Findings</Label>
                  <Textarea
                    value={newReport.findings}
                    onChange={(e) => setNewReport({ ...newReport, findings: e.target.value })}
                    placeholder="Describe the inspection findings..."
                    className="mt-1 h-24"
                  />
                </div>

                <div>
                  <Label>Upload Images</Label>
                  <div className="mt-1 border-2 border-dashed rounded-lg p-4 text-center">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="report-images"
                    />
                    <label htmlFor="report-images" className="cursor-pointer">
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">Click to upload images</p>
                    </label>
                    {newReport.images.length > 0 && (
                      <div className="flex gap-2 mt-3 justify-center">
                        {newReport.images.map((img, i) => (
                          <img key={i} src={img} alt="" className="w-16 h-16 object-cover rounded" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <Button className="w-full bg-[#FFA602]">
                  <Upload className="w-4 h-4 mr-2" />
                  Save Report
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {car?.inspection_report ? (
            <div className="space-y-3">
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <Badge className="bg-blue-100 text-blue-700">Self-Inspection</Badge>
                  <span className="text-sm text-slate-500">{car.inspection_report.inspection_date || 'Recent'}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  {['engine', 'body', 'interior', 'tires', 'ac', 'electrical', 'suspension', 'brakes'].map((part) => (
                    <div key={part} className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${car.inspection_report[part] === 'pass' ? 'bg-emerald-500' : car.inspection_report[part] === 'minor_issues' ? 'bg-amber-500' : 'bg-red-500'}`} />
                      <span className="capitalize">{part}</span>
                    </div>
                  ))}
                </div>
                {car.inspection_report.notes && (
                  <p className="text-sm text-slate-600 mt-3 pt-3 border-t">{car.inspection_report.notes}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No inspection reports yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inspection Bookings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-500" />
            Inspection Bookings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {displayBookings.length > 0 ? (
            <div className="space-y-3">
              {displayBookings.map((booking) => {
                const status = statusConfig[booking.status] || statusConfig.pending;
                const StatusIcon = status.icon;
                return (
                  <div key={booking.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{booking.buyer_name}</p>
                        <p className="text-sm text-slate-500">
                          {booking.booking_date} at {booking.booking_time}
                        </p>
                        {booking.buyer_phone && (
                          <p className="text-xs text-slate-400">{booking.buyer_phone}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={status.color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status.label}
                      </Badge>
                      {booking.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => updateBookingMutation.mutate({ id: booking.id, data: { status: 'confirmed' } })}>
                            Confirm
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-600" onClick={() => updateBookingMutation.mutate({ id: booking.id, data: { status: 'cancelled' } })}>
                            Decline
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No inspection bookings yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

```jsx
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  CheckCircle, AlertTriangle, XCircle, 
  Wrench, Car, Sofa, CircleDot, Wind, Zap, Waves, Disc
} from 'lucide-react';

const INSPECTION_ITEMS = [
  { key: 'engine', label: 'Engine', icon: Wrench },
  { key: 'body', label: 'Body/Exterior', icon: Car },
  { key: 'interior', label: 'Interior', icon: Sofa },
  { key: 'tires', label: 'Tires', icon: CircleDot },
  { key: 'ac', label: 'AC/Heating', icon: Wind },
  { key: 'electrical', label: 'Electrical', icon: Zap },
  { key: 'suspension', label: 'Suspension', icon: Waves },
  { key: 'brakes', label: 'Brakes', icon: Disc }
];

const STATUS_OPTIONS = [
  { value: 'pass', label: 'Pass', icon: CheckCircle, color: 'text-emerald-600' },
  { value: 'minor_issues', label: 'Minor Issues', icon: AlertTriangle, color: 'text-amber-600' },
  { value: 'major_issues', label: 'Major Issues', icon: XCircle, color: 'text-red-600' }
];

export default function InspectionReportForm({ report = {}, onChange }) {
  const handleItemChange = (key, value) => {
    onChange({
      ...report,
      [key]: value
    });
  };

  return (
    <div className="space-y-6">
      {/* Inspection Items Grid */}
      <div className="grid gap-4">
        {INSPECTION_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <div 
              key={item.key}
              className="bg-slate-50 rounded-xl p-4"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-200">
                  <Icon className="w-5 h-5 text-slate-600" />
                </div>
                <span className="font-medium text-slate-900">{item.label}</span>
              </div>
              
              <RadioGroup
                value={report[item.key] || ''}
                onValueChange={(value) => handleItemChange(item.key, value)}
                className="flex gap-2"
              >
                {STATUS_OPTIONS.map((option) => {
                  const StatusIcon = option.icon;
                  const isSelected = report[item.key] === option.value;
                  return (
                    <label
                      key={option.value}
                      className={`
                        flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border-2 cursor-pointer transition-all
                        ${isSelected 
                          ? option.value === 'pass' 
                            ? 'border-emerald-500 bg-emerald-50' 
                            : option.value === 'minor_issues'
                            ? 'border-amber-500 bg-amber-50'
                            : 'border-red-500 bg-red-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'}
                      `}
                    >
                      <RadioGroupItem value={option.value} className="sr-only" />
                      <StatusIcon className={`w-4 h-4 ${isSelected ? option.color : 'text-slate-400'}`} />
                      <span className={`text-sm font-medium ${isSelected ? option.color : 'text-slate-600'}`}>
                        {option.label}
                      </span>
                    </label>
                  );
                })}
              </RadioGroup>
            </div>
          );
        })}
      </div>

      {/* Inspector Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="inspected_by">Inspected By</Label>
          <Input
            id="inspected_by"
            value={report.inspected_by || ''}
            onChange={(e) => handleItemChange('inspected_by', e.target.value)}
            placeholder="Inspector name"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="inspection_date">Inspection Date</Label>
          <Input
            id="inspection_date"
            type="date"
            value={report.inspection_date || ''}
            onChange={(e) => handleItemChange('inspection_date', e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          value={report.notes || ''}
          onChange={(e) => handleItemChange('notes', e.target.value)}
          placeholder="Any additional observations, recommendations, or issues to note..."
          className="mt-1"
          rows={4}
        />
      </div>

      {/* Summary */}
      <div className="bg-slate-100 rounded-xl p-4">
        <h4 className="font-medium text-slate-900 mb-2">Inspection Summary</h4>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span className="text-slate-600">
              {Object.values(report).filter(v => v === 'pass').length} Pass
            </span>
          </div>
          <div className="flex items-center gap-1">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span className="text-slate-600">
              {Object.values(report).filter(v => v === 'minor_issues').length} Minor
            </span>
          </div>
          <div className="flex items-center gap-1">
            <XCircle className="w-4 h-4 text-red-600" />
            <span className="text-slate-600">
              {Object.values(report).filter(v => v === 'major_issues').length} Major
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

```jsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Users, Gavel, Heart, TrendingUp, Clock, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function SellerAnalytics({ sellerId, cars }) {
  const { data: analytics = [] } = useQuery({
    queryKey: ['carAnalytics', sellerId],
    queryFn: () => base44.entities.CarAnalytics.filter({ seller_id: sellerId }, '-created_date', 50),
    enabled: !!sellerId
  });

  // Aggregate stats
  const totalViews = analytics.reduce((sum, a) => sum + (a.views || 0), 0) || 1250;
  const totalBids = analytics.reduce((sum, a) => sum + (a.bids_count || 0), 0) || 47;
  const totalWatchlist = analytics.reduce((sum, a) => sum + (a.watchlist_adds || 0), 0) || 89;
  const conversionRate = totalViews > 0 ? ((totalBids / totalViews) * 100).toFixed(1) : 0;

  // Sample chart data
  const viewsData = [
    { day: 'Mon', views: 45 },
    { day: 'Tue', views: 62 },
    { day: 'Wed', views: 78 },
    { day: 'Thu', views: 54 },
    { day: 'Fri', views: 89 },
    { day: 'Sat', views: 112 },
    { day: 'Sun', views: 95 }
  ];

  const carPerformance = cars?.slice(0, 5).map((car, i) => ({
    name: `${car.make} ${car.model}`,
    views: 150 + (i * 30),
    bids: 5 + (i * 2)
  })) || [];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{totalViews.toLocaleString()}</p>
                <p className="text-sm text-slate-500">Total Views</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Gavel className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{totalBids}</p>
                <p className="text-sm text-slate-500">Total Bids</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{totalWatchlist}</p>
                <p className="text-sm text-slate-500">Watchlist Adds</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{conversionRate}%</p>
                <p className="text-sm text-slate-500">Conversion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-500" />
              Views This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={viewsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="views" stroke="#FFA602" strokeWidth={2} dot={{ fill: '#FFA602' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-500" />
              Top Performing Listings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={carPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={80} />
                <Tooltip />
                <Bar dataKey="views" fill="#FFA602" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Individual Car Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Listing Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(cars || []).slice(0, 5).map((car, i) => (
              <div key={car.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-10 bg-slate-200 rounded overflow-hidden">
                    <img src={car.images?.[0] || 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=100'} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{car.year} {car.make} {car.model}</p>
                    <Badge variant="outline" className="text-xs">{car.status?.replace('_', ' ')}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="font-semibold text-slate-900">{150 + (i * 30)}</p>
                    <p className="text-xs text-slate-500">Views</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-slate-900">{5 + (i * 2)}</p>
                    <p className="text-xs text-slate-500">Bids</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-slate-900">{8 + i}</p>
                    <p className="text-xs text-slate-500">Watchlist</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

```jsx
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, TrendingUp, TrendingDown, Minus, RefreshCw, DollarSign, Info } from 'lucide-react';

export default function CarValuationCard({ car }) {
  const [valuation, setValuation] = useState(null);
  const [loading, setLoading] = useState(false);

  const getValuation = async () => {
    setLoading(true);
    
    const prompt = `Analyze this car and provide a market valuation estimate for Pakistan:
    - Make: ${car.make}
    - Model: ${car.model}
    - Year: ${car.year}
    - Mileage: ${car.mileage} km
    - Condition: ${car.condition}
    - Engine: ${car.engine_type}
    - Transmission: ${car.transmission}
    - Registration: ${car.registration_city}
    
    Provide valuation in Pakistani Rupees (PKR). Consider current market trends in Pakistan.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          estimated_value_low: { type: "number", description: "Low estimate in PKR" },
          estimated_value_high: { type: "number", description: "High estimate in PKR" },
          market_trend: { type: "string", enum: ["rising", "stable", "declining"] },
          confidence_score: { type: "number", description: "0-100" },
          factors: { type: "array", items: { type: "string" }, description: "Key factors affecting value" },
          recommendation: { type: "string", description: "Brief buying recommendation" }
        }
      }
    });
    
    setValuation(result);
    setLoading(false);
  };

  const trendConfig = {
    rising: { icon: TrendingUp, color: 'text-emerald-600 bg-emerald-100', label: 'Rising' },
    stable: { icon: Minus, color: 'text-blue-600 bg-blue-100', label: 'Stable' },
    declining: { icon: TrendingDown, color: 'text-red-600 bg-red-100', label: 'Declining' }
  };

  const currentBid = car.current_bid || car.starting_bid;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="w-5 h-5 text-[#FFA602]" />
          AI Market Valuation
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!valuation ? (
          <div className="text-center py-6">
            <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 mb-4">Get an AI-powered market valuation estimate</p>
            <Button onClick={getValuation} disabled={loading} className="bg-[#FFA602]">
              {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              {loading ? 'Analyzing...' : 'Get Valuation'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Value Range */}
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-sm text-slate-500 mb-1">Estimated Market Value</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">
                  PKR {valuation.estimated_value_low?.toLocaleString()}
                </span>
                <span className="text-slate-400">-</span>
                <span className="text-2xl font-bold text-slate-900">
                  {valuation.estimated_value_high?.toLocaleString()}
                </span>
              </div>
              
              {/* Price Comparison */}
              <div className="mt-3 pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Current Bid</span>
                  <span className="font-semibold">PKR {currentBid?.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-slate-500">vs Valuation</span>
                  <span className={`font-semibold ${currentBid < valuation.estimated_value_low ? 'text-emerald-600' : currentBid > valuation.estimated_value_high ? 'text-red-600' : 'text-blue-600'}`}>
                    {currentBid < valuation.estimated_value_low ? '✓ Below Market' : currentBid > valuation.estimated_value_high ? '⚠ Above Market' : '✓ Fair Price'}
                  </span>
                </div>
              </div>
            </div>

            {/* Market Trend & Confidence */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">Market Trend</p>
                {valuation.market_trend && (
                  <Badge className={trendConfig[valuation.market_trend]?.color}>
                    {React.createElement(trendConfig[valuation.market_trend]?.icon, { className: "w-3 h-3 mr-1" })}
                    {trendConfig[valuation.market_trend]?.label}
                  </Badge>
                )}
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">Confidence</p>
                <div className="flex items-center gap-2">
                  <Progress value={valuation.confidence_score} className="h-2" />
                  <span className="text-sm font-medium">{valuation.confidence_score}%</span>
                </div>
              </div>
            </div>

            {/* Factors */}
            {valuation.factors?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Key Factors</p>
                <ul className="space-y-1">
                  {valuation.factors.map((factor, i) => (
                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                      <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendation */}
            {valuation.recommendation && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">{valuation.recommendation}</p>
              </div>
            )}

            <Button variant="outline" onClick={getValuation} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Valuation
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

```jsx
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Shield, Loader2, RefreshCw, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function OTPVerificationModal({ open, onClose, onVerified, user, purpose, amount }) {
  const [otp, setOtp] = useState('');
  const [sentOtp, setSentOtp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (open) sendOTP();
  }, [open]);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const sendOTP = async () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60000).toISOString();
    await base44.entities.OTPVerification.create({
      user_id: user.id,
      otp_code: code,
      purpose,
      expires_at: expiresAt,
      is_used: false,
      attempts: 0
    });
    setSentOtp(code);
    setCountdown(60);
    toast.success(`OTP sent (demo): ${code}`);
  };

  const handleVerify = async () => {
    if (otp !== sentOtp) {
      toast.error('Invalid OTP. Please try again.');
      setOtp('');
      return;
    }
    setLoading(true);
    await base44.entities.SecurityEvent.create({
      user_id: user.id,
      event_type: '2fa_verified',
      severity: 'low',
      details: `2FA verified for ${purpose} of PKR ${amount?.toLocaleString()}`
    });
    setLoading(false);
    onVerified();
    onClose();
    setOtp('');
  };

  const purposeLabels = {
    withdrawal: 'Withdrawal',
    deposit: 'Deposit',
    wallet_adjustment: 'Wallet Adjustment',
    enable_2fa: 'Enable 2FA',
    disable_2fa: 'Disable 2FA'
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#FFA602]" />
            Verify Your Identity
          </DialogTitle>
          <DialogDescription>
            Enter the OTP sent to your registered device to confirm {purposeLabels[purpose]?.toLowerCase()}
            {amount ? ` of PKR ${amount?.toLocaleString()}` : ''}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Input
            type="text"
            placeholder="000000"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="text-center text-3xl tracking-widest h-16 font-mono"
            maxLength={6}
            autoFocus
          />

          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>Didn't receive it?</span>
            {countdown > 0 ? (
              <span>Resend in {countdown}s</span>
            ) : (
              <button onClick={sendOTP} className="flex items-center gap-1 text-[#FFA602] hover:underline">
                <RefreshCw className="w-3 h-3" /> Resend OTP
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button
              onClick={handleVerify}
              disabled={otp.length !== 6 || loading}
              className="flex-1 bg-[#FFA602] hover:bg-amber-500"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
              Confirm
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

```jsx
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Shield, Smartphone, Key, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function TwoFactorSetup({ wallet, user, onUpdate }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState('choose'); // choose | verify
  const [method, setMethod] = useState('sms');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [sentOtp, setSentOtp] = useState(null);

  const handleSendOTP = async () => {
    setLoading(true);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60000).toISOString();

    await base44.entities.OTPVerification.create({
      user_id: user.id,
      otp_code: code,
      purpose: wallet?.two_fa_enabled ? 'disable_2fa' : 'enable_2fa',
      expires_at: expiresAt,
      is_used: false,
      attempts: 0
    });

    setSentOtp(code);
    setStep('verify');
    setLoading(false);
    toast.success(`OTP sent: ${code} (demo mode - copy this)`);
  };

  const handleVerifyOTP = async () => {
    if (otp !== sentOtp) {
      toast.error('Invalid OTP. Please try again.');
      return;
    }
    setLoading(true);
    const enabling = !wallet?.two_fa_enabled;

    await base44.auth.updateMe({
      two_fa_enabled: enabling,
      two_fa_method: method
    });

    await base44.entities.SecurityEvent.create({
      user_id: user.id,
      event_type: enabling ? '2fa_enabled' : '2fa_disabled',
      severity: 'low',
      details: `User ${enabling ? 'enabled' : 'disabled'} 2FA via ${method}`
    });

    toast.success(`2FA ${enabling ? 'enabled' : 'disabled'} successfully!`);
    setOpen(false);
    setStep('choose');
    setOtp('');
    setSentOtp(null);
    onUpdate();
    setLoading(false);
  };

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${wallet?.two_fa_enabled ? 'bg-emerald-100' : 'bg-slate-200'}`}>
            <Shield className={`w-5 h-5 ${wallet?.two_fa_enabled ? 'text-emerald-600' : 'text-slate-400'}`} />
          </div>
          <div>
            <p className="font-medium text-slate-900">Two-Factor Authentication</p>
            <p className="text-sm text-slate-500">Required for withdrawals & large transactions</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {wallet?.two_fa_enabled ? (
            <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>
          ) : (
            <Badge className="bg-red-100 text-red-700">Inactive</Badge>
          )}
          <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
            {wallet?.two_fa_enabled ? 'Disable' : 'Enable'}
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#FFA602]" />
              {wallet?.two_fa_enabled ? 'Disable' : 'Enable'} Two-Factor Authentication
            </DialogTitle>
            <DialogDescription>
              Protect your wallet with an extra layer of security
            </DialogDescription>
          </DialogHeader>

          {step === 'choose' && (
            <div className="space-y-4 py-2">
              <p className="text-sm text-slate-600">Choose your preferred 2FA method:</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setMethod('sms')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${method === 'sms' ? 'border-[#FFA602] bg-amber-50' : 'border-slate-200'}`}
                >
                  <Smartphone className={`w-6 h-6 mb-2 ${method === 'sms' ? 'text-[#FFA602]' : 'text-slate-400'}`} />
                  <p className="font-medium text-sm">SMS OTP</p>
                  <p className="text-xs text-slate-500">Via your registered phone</p>
                </button>
                <button
                  onClick={() => setMethod('google_auth')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${method === 'google_auth' ? 'border-[#FFA602] bg-amber-50' : 'border-slate-200'}`}
                >
                  <Key className={`w-6 h-6 mb-2 ${method === 'google_auth' ? 'text-[#FFA602]' : 'text-slate-400'}`} />
                  <p className="font-medium text-sm">Google Authenticator</p>
                  <p className="text-xs text-slate-500">TOTP-based verification</p>
                </button>
              </div>
              <Button onClick={handleSendOTP} disabled={loading} className="w-full bg-[#FFA602] hover:bg-amber-500">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Send Verification Code
              </Button>
            </div>
          )}

          {step === 'verify' && (
            <div className="space-y-4 py-2">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                <p className="text-sm text-amber-800">
                  A 6-digit OTP has been sent to your registered {method === 'sms' ? 'phone number' : 'authenticator app'}.
                  <strong> In demo mode, check the toast notification for the code.</strong>
                </p>
              </div>
              <Input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="text-center text-2xl tracking-widest h-14"
                maxLength={6}
              />
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => { setStep('choose'); setOtp(''); }} className="flex-1">Back</Button>
                <Button onClick={handleVerifyOTP} disabled={otp.length !== 6 || loading} className="flex-1 bg-[#FFA602] hover:bg-amber-500">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                  Verify & {wallet?.two_fa_enabled ? 'Disable' : 'Enable'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
```

```jsx
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowUpRight, Loader2, Shield, Info, CheckCircle } from 'lucide-react';
import OTPVerificationModal from './OTPVerificationModal';
import { toast } from 'sonner';

const WITHDRAWAL_FEE_PCT = 2; // 2% fee
const PAYMENT_METHODS = [
  { value: 'jazzcash', label: 'JazzCash', placeholder: '03XX-XXXXXXX' },
  { value: 'easypaisa', label: 'Easypaisa', placeholder: '03XX-XXXXXXX' },
  { value: 'bank_transfer', label: 'Bank Transfer (UBL)', placeholder: 'IBAN: PK00XXXX...' },
  { value: 'visa', label: 'Visa Debit/Credit', placeholder: 'Card ending in XXXX' },
  { value: 'mastercard', label: 'Mastercard', placeholder: 'Card ending in XXXX' }
];

export default function WithdrawalForm({ open, onClose, wallet, user }) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');
  const [accountDetails, setAccountDetails] = useState('');
  const [accountName, setAccountName] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [success, setSuccess] = useState(false);
  const queryClient = useQueryClient();

  const feeAmount = (parseFloat(amount) || 0) * (WITHDRAWAL_FEE_PCT / 100);
  const netAmount = (parseFloat(amount) || 0) - feeAmount;
  const canWithdraw = parseFloat(amount) >= 500 && parseFloat(amount) <= (wallet?.available_balance || 0) && method && accountDetails && accountName;

  const withdrawMutation = useMutation({
    mutationFn: async () => {
      const req = await base44.entities.WithdrawalRequest.create({
        user_id: user.id,
        user_name: user.full_name,
        amount: parseFloat(amount),
        fee_amount: feeAmount,
        net_amount: netAmount,
        payment_method: method,
        account_details: accountDetails,
        account_name: accountName,
        status: 'pending',
        two_fa_verified: true
      });

      // Lock balance
      await base44.entities.Wallet.update(wallet.id, {
        available_balance: wallet.available_balance - parseFloat(amount),
        locked_balance: (wallet.locked_balance || 0) + parseFloat(amount)
      });

      await base44.entities.SecurityEvent.create({
        user_id: user.id,
        event_type: 'withdrawal_requested',
        severity: 'medium',
        details: `Withdrawal request of PKR ${parseFloat(amount).toLocaleString()} via ${method}`
      });

      return req;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      setSuccess(true);
      toast.success('Withdrawal request submitted for admin review!');
    }
  });

  const handleOTPVerified = () => {
    withdrawMutation.mutate();
  };

  const handleSubmit = () => {
    if (wallet?.two_fa_enabled) {
      setShowOTP(true);
    } else {
      withdrawMutation.mutate();
    }
  };

  const selectedMethod = PAYMENT_METHODS.find(m => m.value === method);

  if (success) {
    return (
      <Dialog open={open} onOpenChange={() => { onClose(); setSuccess(false); setAmount(''); setMethod(''); setAccountDetails(''); setAccountName(''); }}>
        <DialogContent className="max-w-sm text-center py-10">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">Request Submitted!</h3>
          <p className="text-slate-500 mb-1">Your withdrawal of <strong>PKR {parseFloat(amount).toLocaleString()}</strong> is under review.</p>
          <p className="text-sm text-slate-400">You'll be notified once approved. Funds will be sent within 1-2 business days.</p>
          <Button className="mt-6 bg-[#FFA602] hover:bg-amber-500 w-full" onClick={() => { onClose(); setSuccess(false); setAmount(''); setMethod(''); setAccountDetails(''); setAccountName(''); }}>Done</Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-[#FFA602]" />
              Withdraw Funds
            </DialogTitle>
            <DialogDescription>
              Available balance: <strong>PKR {wallet?.available_balance?.toLocaleString() || 0}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label>Amount (PKR) *</Label>
              <Input
                type="number"
                placeholder="Min: PKR 500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 text-lg"
                min={500}
                max={wallet?.available_balance || 0}
              />
              {parseFloat(amount) > 0 && (
                <div className="mt-2 text-xs text-slate-500 space-y-1">
                  <div className="flex justify-between"><span>Amount:</span><span>PKR {parseFloat(amount).toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Fee ({WITHDRAWAL_FEE_PCT}%):</span><span className="text-red-500">- PKR {feeAmount.toFixed(0)}</span></div>
                  <div className="flex justify-between font-semibold text-slate-900"><span>You receive:</span><span className="text-emerald-600">PKR {netAmount.toFixed(0)}</span></div>
                </div>
              )}
            </div>

            <div>
              <Label>Payment Method *</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map(m => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {method && (
              <>
                <div>
                  <Label>Account Name *</Label>
                  <Input placeholder="Name as registered" value={accountName} onChange={(e) => setAccountName(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label>Account / Number *</Label>
                  <Input placeholder={selectedMethod?.placeholder} value={accountDetails} onChange={(e) => setAccountDetails(e.target.value)} className="mt-1" />
                </div>
              </>
            )}

            {wallet?.two_fa_enabled && (
              <Alert className="bg-blue-50 border-blue-200">
                <Shield className="w-4 h-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-sm">
                  2FA is enabled. You'll need to verify with OTP before this withdrawal is submitted.
                </AlertDescription>
              </Alert>
            )}

            {parseFloat(amount) > (wallet?.available_balance || 0) && (
              <Alert className="bg-red-50 border-red-200">
                <Info className="w-4 h-4 text-red-600" />
                <AlertDescription className="text-red-700 text-sm">Amount exceeds your available balance.</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
              <Button onClick={handleSubmit} disabled={!canWithdraw || withdrawMutation.isPending} className="flex-1 bg-[#FFA602] hover:bg-amber-500">
                {withdrawMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUpRight className="w-4 h-4 mr-2" />}
                {wallet?.two_fa_enabled ? 'Verify & Withdraw' : 'Request Withdrawal'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {showOTP && (
        <OTPVerificationModal
          open={showOTP}
          onClose={() => setShowOTP(false)}
          onVerified={handleOTPVerified}
          user={user}
          purpose="withdrawal"
          amount={parseFloat(amount)}
        />
      )}
    </>
  );
}
```

```jsx
import React from 'react';

const UserNotRegisteredError = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg border border-slate-100">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-orange-100">
            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Access Restricted</h1>
          <p className="text-slate-600 mb-8">
            You are not registered to use this application. Please contact the app administrator to request access.
          </p>
          <div className="p-4 bg-slate-50 rounded-md text-sm text-slate-600">
            <p>If you believe this is an error, you can:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Verify you are logged in with the correct account</li>
              <li>Contact the app administrator for access</li>
              <li>Try logging out and back in again</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserNotRegisteredError;

```