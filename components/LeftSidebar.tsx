'use client';

import { sidebarLinks, socialLinks } from '@/constants'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
import { useAudio } from '@/providers/AudioProvider';

const LeftSidebar = () => {
  const pathname = usePathname();
  const { audio } = useAudio();

  return (
    <section 
      className={cn(
        "sticky left-0 top-0 flex h-screen flex-col justify-between bg-gradient-to-b from-black-1 via-[#1a1a2e] to-black-2 border-r border-black-4/30 backdrop-blur-xl",
        "w-[270px] px-6 py-8",
        "max-md:hidden",
        audio?.audioUrl && "h-[calc(100vh-113px)]"
      )}
    >
      {/* Top Section */}
      <div className="flex flex-col gap-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[--accent-color] to-purple-500 p-2">
            <Image 
              src="/icons/miclogo.svg" 
              alt="logo" 
              fill
              priority
              className="object-contain p-1"
            />
          </div>
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-cyan-400 to-cyan-200 bg-clip-text text-transparent">
            SynthcastAI
          </h1>
        </Link>

        {/* Navigation Links */}
        <div className="flex flex-col gap-2">
          <nav className="flex flex-col gap-2">
            {sidebarLinks.map(({ route, label, imgURL }) => {
              const isActive = pathname === route || pathname.startsWith(`${route}/`);

              return (
                <Link 
                  href={route} 
                  key={label} 
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300",
                    "hover:bg-black-4/50",
                    isActive && "bg-gradient-to-r from-[--accent-color]/10 to-purple-500/10 border border-[--accent-color]/20"
                  )}
                >
                  <div className={cn(
                    "relative w-5 h-5 transition-all duration-300",
                    isActive && "scale-110"
                  )}>
                    <Image 
                      src={imgURL} 
                      alt={label} 
                      fill
                      className={cn(
                        "object-contain transition-all duration-300",
                        isActive && "filter brightness-150"
                      )}
                    />
                  </div>
                  <span className={cn(
                    "font-medium transition-all duration-300",
                    isActive ? "text-[--accent-color]" : "text-gray-400",
                    "hover:text-white-1"
                  )}>
                    {label}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="h-[1px] bg-black-4/50 my-2" />

          {/* Social Links */}
          {socialLinks.map(({ href, label, imgURL }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300 hover:bg-black-4/50"
            >
              <div className="relative w-6 h-6">
                <Image 
                  src={imgURL} 
                  alt={label} 
                  fill
                  unoptimized
                  className="object-contain brightness-90 hover:brightness-125 transition-all duration-300"
                />
              </div>
              <span className="font-medium text-gray-400 hover:text-white-1 transition-all duration-300">
                {label}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export default LeftSidebar;