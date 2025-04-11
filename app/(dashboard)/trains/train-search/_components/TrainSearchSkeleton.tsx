import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export const TrainSearchSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Search Form Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Skeleton height={20} width={100} />
          <Skeleton height={40} />
        </div>
        <div className="space-y-2">
          <Skeleton height={20} width={100} />
          <Skeleton height={40} />
        </div>
        <div className="space-y-2">
          <Skeleton height={20} width={100} />
          <Skeleton height={40} />
        </div>
      </div>

      {/* Results Skeleton */}
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="p-4 border rounded-lg">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="md:w-1/4">
                <Skeleton height={100} />
              </div>
              <div className="md:w-3/4 space-y-2">
                <Skeleton height={24} width={200} />
                <Skeleton height={20} width={150} />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton height={20} width={120} />
                  <Skeleton height={20} width={120} />
                </div>
                <Skeleton height={40} width={120} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 