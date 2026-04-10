import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/enhanced-button';
import { tenantAPI, ratingAPI } from '@/lib/api';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Star, 
  Home, 
  Building2, 
  MapPin, 
  Calendar, 
  IndianRupee,
  User,
  Mail,
  Phone,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Shield,
  Sparkles,
  Eye,
  X
} from 'lucide-react';

interface TenantCurrentProperty {
  historyId: number;
  propertyId: number;
  propertyName: string;
  propertyType: string;
  flatNumber?: string;
  bedNumber?: string;
  roomNumber?: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  monthlyRent: number;
  depositAmount: number;
  occupancyStartDate: string;
  nextRentDueDate: string;
  lastPaidDate?: string;
  status: string;
  propertyImage?: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
}

interface TenantRating {
  id: number;
  propertyId: number;
  propertyTitle: string;
  tenantId: number;
  tenantName: string;
  rating: number;
  review?: string;
  createdAt: string;
}

interface DashboardData {
  currentProperties: TenantCurrentProperty[];
  totalProperties: number;
  activeProperties: number;
  totalMonthlyRent: number;
  totalDepositPaid: number;
  pendingPayments: number;
  openComplaints: number;
  guestPasses: number;
  recentProperties: TenantCurrentProperty[];
}

export const TenantHistory: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [tenantRatings, setTenantRatings] = useState<TenantRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<TenantCurrentProperty | null>(null);
  const [existingRating, setExistingRating] = useState<TenantRating | null>(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchTenantRatings();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await tenantAPI.getDashboard();
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load property history');
    } finally {
      setLoading(false);
    }
  };

  const fetchTenantRatings = async () => {
    try {
      const response = await ratingAPI.getTenantRatings();
      setTenantRatings(response.data);
    } catch (error) {
      console.error('Error fetching tenant ratings:', error);
      // Don't show error toast here as ratings might not exist
    }
  };

  const handleRateAndReview = (property: TenantCurrentProperty) => {
    setSelectedProperty(property);
    
    // Check if rating already exists for this property
    const existingRatingForProperty = tenantRatings.find(r => r.propertyId === property.propertyId);
    
    if (existingRatingForProperty) {
      setExistingRating(existingRatingForProperty);
      setRating(existingRatingForProperty.rating);
      setReview(existingRatingForProperty.review || '');
    } else {
      setExistingRating(null);
      setRating(0);
      setReview('');
    }
    
    setShowRatingModal(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedProperty || rating === 0) {
      toast.error('Please provide a rating');
      return;
    }

    try {
      setSubmittingReview(true);
      
      if (existingRating) {
        // Update existing rating
        await ratingAPI.updateRating(existingRating.id.toString(), { rating, review });
        toast.success('Rating updated successfully!');
      } else {
        // Create new rating
        await ratingAPI.createRating(selectedProperty.propertyId.toString(), { rating, review });
        toast.success('Rating submitted successfully!');
      }
      
      // Refresh ratings
      await fetchTenantRatings();
      
      setShowRatingModal(false);
      setRating(0);
      setReview('');
      setSelectedProperty(null);
      setExistingRating(null);
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit rating. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleCloseModal = () => {
    setShowRatingModal(false);
    setRating(0);
    setReview('');
    setSelectedProperty(null);
    setExistingRating(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'ACTIVE':
        return 'bg-gradient-to-r from-emerald-500 to-teal-500';
      case 'RELEASED':
        return 'from-blue-500 to-indigo-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'ACTIVE':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'RELEASED':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Home className="w-6 h-6 text-indigo-600 animate-pulse" />
            </div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading your property journey...</p>
        </div>
      </div>
    );
  }

  const currentProperties = dashboardData?.currentProperties?.filter(p => p.status === 'ACTIVE') || [];
  const pastProperties = dashboardData?.recentProperties?.filter(p => p.status === 'RELEASED') || [];
  const hasNoProperties = currentProperties.length === 0 && pastProperties.length === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/tenant/dashboard')}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Property History
            </h1>
          </div>
          <p className="text-muted-foreground">
            View your current and previous rental properties
          </p>
        </div>

        {/* Stats Cards */}
        {!hasNoProperties && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <p className="text-sm text-gray-600 mb-1">Total Properties</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardData?.totalProperties || 0}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <p className="text-sm text-gray-600 mb-1">Active Rentals</p>
              <p className="text-3xl font-bold text-emerald-600">{dashboardData?.activeProperties || 0}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <p className="text-sm text-gray-600 mb-1">Past Properties</p>
              <p className="text-3xl font-bold text-purple-600">{pastProperties.length}</p>
            </div>
          </div>
        )}

        {/* Current Properties Section */}
        {currentProperties.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-emerald-500" />
                  Current Properties
                </h2>
                <p className="text-gray-600 mt-1">Your active rental properties</p>
              </div>
              <Link to="/properties">
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  Browse More
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {currentProperties.map((property, index) => (
                <div 
                  key={property.historyId}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300"
                >
                  {/* Status Badge */}
                  <div className={`inline-flex items-center gap-1 absolute top-4 right-4 bg-gradient-to-r ${getStatusColor(property.status)} text-white px-3 py-1 rounded-full text-xs font-medium shadow-sm`}>
                    {getStatusIcon(property.status)}
                    <span>{property.status}</span>
                  </div>

                  <div className="flex flex-col md:flex-row relative">
                    {/* Image Section */}
                    <div className="md:w-2/5 relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                      {property.propertyImage ? (
                        <img 
                          src={property.propertyImage} 
                          alt={property.propertyName}
                          className="w-full h-48 md:h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 md:h-full flex items-center justify-center">
                          <Building2 className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="md:w-3/5 p-6">
                      <div className="mb-4">
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">{property.propertyName}</h3>
                        <p className="text-sm text-gray-600">{property.propertyType}</p>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-start gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>{property.address}, {property.city}, {property.state} - {property.postalCode}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Building2 className="w-4 h-4" />
                          <span>
                            {property.propertyType === 'FLAT' 
                              ? `Flat ${property.flatNumber}` 
                              : `Room ${property.roomNumber}, Bed ${property.bedNumber}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <IndianRupee className="w-4 h-4" />
                          <span className="font-semibold text-gray-900">₹{property.monthlyRent.toLocaleString()}</span>
                          <span>/ month</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>Since {formatDate(property.occupancyStartDate)}</span>
                        </div>
                      </div>

                      {/* Owner Info */}
                      <div className="border-t border-gray-100 pt-3 mt-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User className="w-4 h-4" />
                          <span className="font-medium">Owner:</span>
                          <span>{property.ownerName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <Mail className="w-4 h-4" />
                          <span>{property.ownerEmail}</span>
                        </div>
                      </div>

                      {/* Next Rent Due */}
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-gray-700">Next Rent Due:</span>
                          </div>
                          <span className="text-sm font-semibold text-blue-600">
                            {formatDate(property.nextRentDueDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Past Properties Section */}
        {pastProperties.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Star className="w-6 h-6 text-purple-500" />
                  Past Properties
                </h2>
                <p className="text-gray-600 mt-1">Properties you've previously rented</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastProperties.map((property) => (
                <div 
                  key={property.historyId}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300"
                >
                  {/* Image Container */}
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                    {property.propertyImage ? (
                      <img 
                        src={property.propertyImage} 
                        alt={property.propertyName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-white bg-gradient-to-r ${getStatusColor(property.status)}`}>
                        {getStatusIcon(property.status)}
                        <span>{property.status}</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{property.propertyName}</h3>
                      <p className="text-xs text-gray-600">{property.propertyType}</p>
                    </div>

                    <div className="space-y-1.5 mb-4">
                      <div className="flex items-start gap-1.5 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{property.city}, {property.state}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <IndianRupee className="w-4 h-4" />
                        <span className="font-semibold text-gray-900">₹{property.monthlyRent.toLocaleString()}</span>
                        <span>/month</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Started: {formatDate(property.occupancyStartDate)}</span>
                      </div>
                      
                      {/* Display existing rating and review */}
                      {(() => {
                        const existingRatingForProperty = tenantRatings.find(r => r.propertyId === property.propertyId);
                        if (existingRatingForProperty) {
                          return (
                            <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex items-center">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`w-4 h-4 ${
                                        star <= existingRatingForProperty.rating
                                          ? 'fill-amber-400 text-amber-400'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm font-medium text-gray-700">
                                  {existingRatingForProperty.rating}/5
                                </span>
                              </div>
                              {existingRatingForProperty.review && (
                                <p className="text-sm text-gray-600 italic">
                                  "{existingRatingForProperty.review}"
                                </p>
                              )}
                              <p className="text-xs text-gray-500 mt-1">
                                Rated on {formatDate(existingRatingForProperty.createdAt)}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>

                    {/* Rate & Review Button */}
                    {tenantRatings.find(r => r.propertyId === property.propertyId) ? (
                      <Button 
                        onClick={() => handleRateAndReview(property)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Star className="w-4 h-4 mr-2" />
                        Update Your Rating
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => handleRateAndReview(property)}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        <Star className="w-4 h-4 mr-2" />
                        Rate & Review Your Stay
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Properties Message */}
        {hasNoProperties && (
          <div className="text-center py-12">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
              <div className="text-muted-foreground mb-4">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No Property History</h3>
              <p className="text-muted-foreground mb-6">
                You haven't rented any properties yet. Start by searching for available properties.
              </p>
              <Link to="/properties">
                <Button>Browse Properties</Button>
              </Link>
            </div>
          </div>
        )}

        {/* Tips Section */}
        {!hasNoProperties && (
          <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-gray-900 mb-1">Property History Tips</h4>
                <div className="text-sm text-gray-700">
                  Your rental history helps build trust with future landlords. Rate and review your past properties 
                  to share your experience and help other tenants make informed decisions.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rating Modal */}
        {showRatingModal && selectedProperty && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {existingRating ? 'Update Your Rating' : 'Rate & Review'}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{selectedProperty.propertyName}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {/* Rating Section */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    How would you rate your stay?
                  </label>
                  <div className="flex gap-2 justify-center mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 transition-colors"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300 hover:text-yellow-400'
                          } transition-colors`}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-center text-sm text-gray-600">
                    {rating === 0 ? 'Click to rate' : `${rating} out of 5 stars`}
                  </p>
                </div>

                {/* Review Section */}
                <div className="mb-6">
                  <label htmlFor="review" className="block text-sm font-medium text-gray-900 mb-2">
                    Share your experience (optional)
                  </label>
                  <textarea
                    id="review"
                    rows={4}
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Tell us about your experience at this property..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {review.length}/500 characters
                  </p>
                </div>

                {/* Property Info */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">{selectedProperty.propertyName}</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {selectedProperty.address}, {selectedProperty.city}
                      </p>
                      <p className="text-xs text-gray-600">
                        {selectedProperty.propertyType === 'FLAT' 
                          ? `Flat ${selectedProperty.flatNumber}` 
                          : `Room ${selectedProperty.roomNumber}, Bed ${selectedProperty.bedNumber}`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleCloseModal}
                    className="flex-1"
                    disabled={submittingReview}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitReview}
                    className="flex-1"
                    disabled={submittingReview || rating === 0}
                  >
                    {submittingReview ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {existingRating ? 'Updating...' : 'Submitting...'}
                      </>
                    ) : (
                      <>
                        <Star className="w-4 h-4 mr-2" />
                        {existingRating ? 'Update Rating' : 'Submit Review'}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TenantHistory;