"use client"

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { sidebarLinks, socialLinks } from "@/constants"
import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

const MobileNav = () => {
  const pathname = usePathname();

  return (
    <section>
      <Sheet>
        <SheetTrigger>
          <div className="relative w-[30px] h-[30px]">
            <Image 
              src="/icons/hamburger.svg" 
              alt="menu" 
              fill
              className="object-contain cursor-pointer" 
            />
          </div>
        </SheetTrigger>
        <SheetContent side="left" className="border-none bg-gradient-to-b from-black-1 via-[#1a1a2e] to-black-2">
          <Link href="/" className="flex cursor-pointer items-center gap-3 pb-10 pl-4">
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
          <div className="flex h-[calc(100vh-72px)] flex-col justify-between overflow-y-auto">
            <div className="flex flex-col gap-2">
              <SheetClose asChild>
                <nav className="flex flex-col gap-2">
                  {sidebarLinks.map(({ route, label, imgURL }) => {
                    const isActive = pathname === route || pathname.startsWith(`${route}/`);

                    return (
                      <SheetClose asChild key={route}>
                        <Link 
                          href={route} 
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
                      </SheetClose>
                    );
                  })}
                </nav>
              </SheetClose>

              <div className="h-[1px] bg-black-4/50 my-2" />

              {/* Social Links */}
              {socialLinks.map(({ href, label, imgURL }) => (
                <SheetClose asChild key={href}>
                  <a
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
                </SheetClose>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </section>
  )
}

export default MobileNav