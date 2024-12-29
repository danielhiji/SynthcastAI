'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react'
import Header from './Header';
import Carousel from './Carousel';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import { useAudio } from '@/providers/AudioProvider';
import { cn } from '@/lib/utils';

const RightSidebar = () => {
  // Add your component logic here
  return (
    <div>
      {/* Add your component JSX here */}
    </div>
  )
}

export default RightSidebar