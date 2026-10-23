import { StationGrid } from '@/components/StationGrid';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Stations — StationTalk Voice Rooms',
  description: 'Browse regional station voice rooms. Listen in or join the discussion.',
};

export default function StationsPage() {
  return (
    <div className="flex-1 bg-[#0b0f17] py-6 sm:py-8 min-h-[calc(100vh-4rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <StationGrid />
      </div>
    </div>
  );
}
