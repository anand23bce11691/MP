import React, { useState } from 'react';
import { Star, CheckCircle, ThumbsUp, MessageSquare } from 'lucide-react';

interface ReviewItem {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  helpfulCount: number;
  verifiedBuyer: boolean;
}

interface ShopEasyReviewsSectionProps {
  productName: string;
  overallRating: number;
  totalReviews: number;
}

export const ShopEasyReviewsSection: React.FC<ShopEasyReviewsSectionProps> = ({
  productName,
  overallRating,
  totalReviews
}) => {
  const [reviews, setReviews] = useState<ReviewItem[]>([
    {
      id: 'r1',
      author: 'Vikram S.',
      rating: 5,
      date: '2 days ago',
      title: 'Best-in-class audio clarity & battery!',
      comment: `Purchased the ${productName} for my remote engineering workflow. The active noise cancellation blocks out all ambient background noise during team calls. Battery lasts almost an entire week on a single charge!`,
      helpfulCount: 24,
      verifiedBuyer: true
    },
    {
      id: 'r2',
      author: 'Ananya P.',
      rating: 5,
      date: '1 week ago',
      title: 'Extremely comfortable & ultra-sleek design',
      comment: 'Super fast delivery in Bengaluru. Build quality feels very premium. Seamless bluetooth multipoint pairing between my laptop and mobile phone.',
      helpfulCount: 14,
      verifiedBuyer: true
    },
    {
      id: 'r3',
      author: 'Rohan M.',
      rating: 4,
      date: '2 weeks ago',
      title: 'Solid performance, great value for money',
      comment: 'Audio profile is neutral and balanced out of the box. Equalizer app allows custom bass tuning. Highly recommended.',
      helpfulCount: 9,
      verifiedBuyer: true
    }
  ]);

  const [newComment, setNewComment] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newRating, setNewRating] = useState(5);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const added: ReviewItem = {
      id: `r-${Date.now()}`,
      author: 'You (Verified Customer)',
      rating: newRating,
      date: 'Just now',
      title: newTitle || 'Great Product!',
      comment: newComment,
      helpfulCount: 0,
      verifiedBuyer: true
    };

    setReviews([added, ...reviews]);
    setNewComment('');
    setNewTitle('');
  };

  const handleHelpful = (id: string) => {
    setReviews(reviews.map(r => r.id === id ? { ...r, helpfulCount: r.helpfulCount + 1 } : r));
  };

  return (
    <div className="mt-8 pt-8 border-t border-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            Verified Customer Reviews ({totalReviews + reviews.length - 3})
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Real feedback from verified buyers across India</p>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-4 h-4 ${i < Math.floor(overallRating) ? 'fill-current' : 'text-slate-300'}`} />
            ))}
          </div>
          <span className="text-sm font-bold text-slate-900 font-mono">{overallRating} / 5.0</span>
        </div>
      </div>

      {/* Review Submission Form */}
      <form onSubmit={handleAddReview} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-8 space-y-4">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Write a Verified Review</h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input 
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="Review Headline (e.g. Fantastic build quality!)"
            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-600 bg-white"
          />
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600">Your Rating:</span>
            <div className="flex text-amber-400 cursor-pointer">
              {[1, 2, 3, 4, 5].map(star => (
                <Star 
                  key={star} 
                  onClick={() => setNewRating(star)} 
                  className={`w-5 h-5 ${star <= newRating ? 'fill-current' : 'text-slate-300'}`} 
                />
              ))}
            </div>
          </div>
        </div>

        <textarea 
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          rows={3}
          placeholder={`Share your experience using ${productName}...`}
          className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-600 bg-white"
        />

        <div className="flex justify-end">
          <button 
            type="submit"
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
          >
            Submit Customer Review
          </button>
        </div>
      </form>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map(review => (
          <div key={review.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">{review.author}</span>
                {review.verifiedBuyer && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <CheckCircle className="w-3 h-3" /> Verified Buyer
                  </span>
                )}
              </div>
              <span className="text-xs font-mono text-slate-400">{review.date}</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-current' : 'text-slate-300'}`} />
                ))}
              </div>
              <h5 className="font-bold text-slate-900 text-xs">{review.title}</h5>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{review.comment}</p>

            <div className="pt-2 flex items-center justify-end">
              <button 
                onClick={() => handleHelpful(review.id)}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 font-medium bg-slate-50 hover:bg-indigo-50 px-3 py-1.5 rounded-lg border border-slate-200 transition-all"
              >
                <ThumbsUp className="w-3.5 h-3.5" /> Helpful ({review.helpfulCount})
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
