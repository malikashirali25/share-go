import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ThumbsUp, ThumbsDown, Flag, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  title: string;
  comment: string;
  helpful: number;
  notHelpful: number;
  createdAt: string;
  isVerified: boolean;
}

interface RatingSystemProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  onAddReview?: (review: Omit<Review, 'id' | 'createdAt' | 'helpful' | 'notHelpful'>) => void;
  onRateHelpful?: (reviewId: string, helpful: boolean) => void;
  onReportReview?: (reviewId: string) => void;
  onEditReview?: (reviewId: string, updatedReview: Partial<Review>) => void;
  onDeleteReview?: (reviewId: string) => void;
  currentUserId?: string;
  canReview?: boolean;
}

const RatingSystem = ({
  reviews,
  averageRating,
  totalReviews,
  onAddReview,
  onRateHelpful,
  onReportReview,
  onEditReview,
  onDeleteReview,
  currentUserId,
  canReview = true
}: RatingSystemProps) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 0,
    title: '',
    comment: ''
  });
  const [editingReview, setEditingReview] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
  const [filterBy, setFilterBy] = useState<number | 'all'>('all');

  const handleStarClick = (rating: number) => {
    setNewReview(prev => ({ ...prev, rating }));
  };

  const handleSubmitReview = () => {
    if (newReview.rating === 0 || !newReview.title.trim() || !newReview.comment.trim()) {
      return;
    }

    if (onAddReview) {
      onAddReview({
        userId: currentUserId || 'current_user',
        userName: 'Current User',
        userAvatar: 'https://i.pravatar.cc/150?img=1',
        rating: newReview.rating,
        title: newReview.title,
        comment: newReview.comment,
        isVerified: true
      });
    }

    setNewReview({ rating: 0, title: '', comment: '' });
    setShowReviewForm(false);
  };

  const handleEditReview = (reviewId: string) => {
    const review = reviews.find(r => r.id === reviewId);
    if (review) {
      setNewReview({
        rating: review.rating,
        title: review.title,
        comment: review.comment
      });
      setEditingReview(reviewId);
      setShowReviewForm(true);
    }
  };

  const handleUpdateReview = () => {
    if (editingReview && onEditReview) {
      onEditReview(editingReview, {
        rating: newReview.rating,
        title: newReview.title,
        comment: newReview.comment
      });
    }
    setEditingReview(null);
    setNewReview({ rating: 0, title: '', comment: '' });
    setShowReviewForm(false);
  };

  const filteredReviews = reviews
    .filter(review => filterBy === 'all' || review.rating === filterBy)
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

  const getRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0];
    reviews.forEach(review => {
      distribution[review.rating - 1]++;
    });
    return distribution;
  };

  const distribution = getRatingDistribution();

  return (
    <div className="space-y-6">
      {/* Rating Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Average Rating */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <span className="text-4xl font-bold text-gray-900">{averageRating.toFixed(1)}</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-6 h-6 ${
                        star <= averageRating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-gray-600 mb-4">Based on {totalReviews} reviews</p>
              {canReview && (
                <Button
                  onClick={() => setShowReviewForm(true)}
                  className="w-full md:w-auto"
                >
                  Write a Review
                </Button>
              )}
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = distribution[rating - 1];
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                
                return (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="text-sm font-medium w-2">{rating}</span>
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Review Form */}
      {showReviewForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>
                {editingReview ? 'Edit Review' : 'Write a Review'}
              </CardTitle>
              <CardDescription>
                Share your experience with others
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Star Rating */}
              <div>
                <Label>Rating *</Label>
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleStarClick(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          star <= newReview.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300 hover:text-yellow-400'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Title */}
              <div>
                <Label htmlFor="review-title">Title *</Label>
                <Input
                  id="review-title"
                  placeholder="Summarize your experience"
                  value={newReview.title}
                  onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              {/* Review Comment */}
              <div>
                <Label htmlFor="review-comment">Comment *</Label>
                <textarea
                  id="review-comment"
                  placeholder="Tell others about your experience..."
                  value={newReview.comment}
                  onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={editingReview ? handleUpdateReview : handleSubmitReview}
                  disabled={newReview.rating === 0 || !newReview.title.trim() || !newReview.comment.trim()}
                >
                  {editingReview ? 'Update Review' : 'Submit Review'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowReviewForm(false);
                    setEditingReview(null);
                    setNewReview({ rating: 0, title: '', comment: '' });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {/* Filters and Sort */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-2">
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
            </select>
          </div>
          
          <p className="text-sm text-gray-600">
            Showing {filteredReviews.length} of {reviews.length} reviews
          </p>
        </div>

        {/* Reviews */}
        {filteredReviews.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
              <p className="text-gray-500">Be the first to review this item!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={review.userAvatar}
                          alt={review.userName}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900">{review.userName}</h4>
                            {review.isVerified && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                Verified
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {(review.userId === currentUserId || onDeleteReview) && (
                        <div className="flex items-center gap-1">
                          {review.userId === currentUserId && onEditReview && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditReview(review.id)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                          {review.userId === currentUserId && onDeleteReview && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDeleteReview(review.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                          {onReportReview && review.userId !== currentUserId && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onReportReview(review.id)}
                              className="text-gray-400 hover:text-red-600"
                            >
                              <Flag className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <h5 className="font-medium text-gray-900 mb-2">{review.title}</h5>
                    <p className="text-gray-700 mb-4">{review.comment}</p>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRateHelpful?.(review.id, true)}
                          className="text-gray-600 hover:text-green-600"
                        >
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          Helpful ({review.helpful})
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRateHelpful?.(review.id, false)}
                          className="text-gray-600 hover:text-red-600"
                        >
                          <ThumbsDown className="w-4 h-4 mr-1" />
                          Not Helpful ({review.notHelpful})
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RatingSystem;



