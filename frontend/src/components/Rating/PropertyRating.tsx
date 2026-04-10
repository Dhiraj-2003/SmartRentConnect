import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ratingAPI } from '@/lib/api';
import { Star, MessageSquare, ThumbsUp } from 'lucide-react';

interface Rating {
  id: number;
  tenantName: string;
  rating: number;
  review: string;
  createdAt: string;
}

interface PropertyRatingProps {
  propertyId: number;
  propertyTitle: string;
  averageRating: number;
  totalRatings: number;
  canRate?: boolean;
  onRatingSubmitted?: () => void;
}

export const PropertyRating: React.FC<PropertyRatingProps> = ({
  propertyId,
  propertyTitle,
  averageRating,
  totalRatings,
  canRate = false,
  onRatingSubmitted
}) => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [newRating, setNewRating] = useState({
    rating: 0,
    review: ''
  });

  React.useEffect(() => {
    fetchRatings();
  }, [propertyId]);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const response = await ratingAPI.getPropertyRatings(propertyId.toString());
      setRatings(response.data);
    } catch (error) {
      console.error('Error fetching ratings:', error);
      toast.error('Failed to fetch ratings');
    } finally {
      setLoading(false);
    }
  };

  const handleStarClick = (rating: number) => {
    setNewRating(prev => ({ ...prev, rating }));
  };

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newRating.rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    try {
      await ratingAPI.createRating(propertyId.toString(), {
        rating: newRating.rating,
        review: newRating.review
      });
      
      toast.success('Rating submitted successfully!');
      setNewRating({ rating: 0, review: '' });
      setShowRatingForm(false);
      fetchRatings();
      
      if (onRatingSubmitted) {
        onRatingSubmitted();
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating');
    }
  };

  const renderStars = (rating: number, interactive = false) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < rating
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
        onClick={() => interactive && handleStarClick(i + 1)}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              Property Ratings
            </div>
            <Badge variant="outline">
              {totalRatings} {totalRatings === 1 ? 'Rating' : 'Ratings'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{averageRating.toFixed(1)}</div>
              <div className="flex items-center gap-1">
                {renderStars(Math.round(averageRating))}
              </div>
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-600">
                Average rating for {propertyTitle}
              </div>
              {totalRatings > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  Based on {totalRatings} {totalRatings === 1 ? 'review' : 'reviews'}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Rating Form */}
      {canRate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Rate This Property
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!showRatingForm ? (
              <Button onClick={() => setShowRatingForm(true)} className="w-full">
                <ThumbsUp className="w-4 h-4 mr-2" />
                Write a Review
              </Button>
            ) : (
              <form onSubmit={handleSubmitRating} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Your Rating *</label>
                  <div className="flex items-center gap-1">
                    {renderStars(newRating.rating, true)}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Your Review</label>
                  <Textarea
                    value={newRating.review}
                    onChange={(e) => setNewRating(prev => ({ ...prev, review: e.target.value }))}
                    placeholder="Share your experience with this property..."
                    rows={4}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button type="submit" disabled={newRating.rating === 0}>
                    Submit Rating
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowRatingForm(false);
                      setNewRating({ rating: 0, review: '' });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {/* Ratings List */}
      <Card>
        <CardHeader>
          <CardTitle>Reviews ({ratings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Loading reviews...</p>
            </div>
          ) : ratings.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
              <p className="text-gray-600">Be the first to review this property!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {ratings.map((rating) => (
                <div key={rating.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium">{rating.tenantName}</div>
                      <div className="flex items-center gap-1 mt-1">
                        {renderStars(rating.rating)}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(rating.createdAt)}
                    </div>
                  </div>
                  
                  {rating.review && (
                    <p className="text-gray-700 mt-2">{rating.review}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
