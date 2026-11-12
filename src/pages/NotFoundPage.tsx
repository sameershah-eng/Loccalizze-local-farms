import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FBF8F1] pt-32 pb-20 px-4 flex items-center justify-center text-center">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-12 border border-[#E7E0D2] shadow-sm space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-[#F3EEE3] text-[#1F4D3A] flex items-center justify-center mx-auto border border-[#E7E0D2]">
          <Sprout className="w-8 h-8" />
        </div>
        <div>
          <span className="font-serif text-5xl font-bold text-[#1F4D3A]">404</span>
          <h1 className="font-serif text-2xl font-bold text-[#1E1B16] mt-2">
            Field Not Found
          </h1>
          <p className="text-sm text-[#6B645A] mt-2 leading-relaxed">
            The farm path you followed may have moved or closed for the season. Let&apos;s get you back to the fresh harvest.
          </p>
        </div>

        <Link to="/">
          <Button variant="gradient" size="md" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Return to Farm Directory
          </Button>
        </Link>
      </div>
    </div>
  );
};
