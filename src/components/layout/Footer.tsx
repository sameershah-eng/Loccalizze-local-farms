import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Check, ArrowRight } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { showToast } = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setIsSubscribed(true);
    showToast({
      title: 'Subscribed to Field Notes',
      message: 'You will receive weekly seasonal harvest updates from local growers.',
      type: 'success',
    });
  };

  return (
    <footer className="bg-[#143326] text-white pt-16 pb-12 border-t border-[#1F4D3A] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-white/10">
          {/* Brand & Mission (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#1F4D3A] text-[#A8D672] flex items-center justify-center border border-[#2A684F]">
                <Sprout className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-white">
                Loccalizze
              </span>
            </Link>
            <p className="text-sm text-white/75 max-w-sm leading-relaxed">
              Connecting conscious eaters directly with nearby family farms. Real food, transparent practices, and zero corporate distributor markups.
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs text-[#A8D672]">
              <span className="w-2 h-2 rounded-full bg-[#6BBF59]" />
              <span className="font-semibold">Supporting 1,240+ independent family growers</span>
            </div>
          </div>

          {/* Shoppers Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#A8D672]">
              For Shoppers
            </h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <Link to="/farms" className="hover:text-white transition-colors">
                  Explore Nearby Farms
                </Link>
              </li>
              <li>
                <Link to="/#fresh" className="hover:text-white transition-colors">
                  Fresh This Week
                </Link>
              </li>
              <li>
                <Link to="/farms?category=Vegetables" className="hover:text-white transition-colors">
                  Organic Vegetables
                </Link>
              </li>
              <li>
                <Link to="/farms?category=Eggs%20%26%20Dairy" className="hover:text-white transition-colors">
                  Pasture Eggs & Dairy
                </Link>
              </li>
              <li>
                <Link to="/#how-it-works" className="hover:text-white transition-colors">
                  How Farm Pickup Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Growers Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#A8D672]">
              For Growers
            </h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <Link to="/join" className="hover:text-white transition-colors">
                  List Your Farm Free
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">
                  Grower Dashboard
                </Link>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Fair Pricing Guide
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Pickup & Delivery Tools
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Regenerative Standards
                </span>
              </li>
            </ul>
          </div>

          {/* Newsletter Box */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#A8D672]">
              Field Notes Weekly
            </h4>
            <p className="text-xs text-white/70 leading-relaxed">
              Seasonal harvest availability, farm open-days, and seasonal cooking recipes.
            </p>
            {isSubscribed ? (
              <div className="bg-[#1F4D3A] rounded-2xl p-3 text-xs text-[#A8D672] flex items-center gap-2 border border-[#2A684F]">
                <Check className="w-4 h-4 shrink-0" />
                <span>You are subscribed for weekly harvest alerts!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full bg-[#1F4D3A] border border-[#2A684F] rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#A8D672]"
                  />
                  <button
                    type="submit"
                    aria-label="Subscribe to newsletter"
                    className="absolute right-1 top-1 bottom-1 px-3 bg-gradient-to-r from-[#F2A541] to-[#E8743B] text-white rounded-xl flex items-center justify-center hover:brightness-110 transition-all text-xs font-semibold"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-[11px] text-white/50 block">
                  No spam. Only fresh produce from local soil.
                </span>
              </form>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p>© {new Date().getFullYear()} Loccalizze Inc. Know your farmer. Taste the difference.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-white cursor-pointer transition-colors">Farm Standards</span>
            <Link to="/dashboard" className="text-[#A8D672] hover:underline font-semibold">
              Farm Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
