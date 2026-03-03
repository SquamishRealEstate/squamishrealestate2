import React from 'react';
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-30 frosted-glass border-b border-border/20">
        <div className="container mx-auto flex items-center justify-between h-20">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
              <img src="/images/icon.ico" alt="Home" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Squamish Real Estate</h1>
              <p className="text-xs text-muted-foreground">Your Mountain Home Awaits</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#properties" className="text-sm font-medium hover:text-primary transition-colors">
              Properties
            </a>
            <a href="#neighborhoods" className="text-sm font-medium hover:text-primary transition-colors">
              Neighborhoods
            </a>
            <a href="#about" className="text-sm font-medium hover:text-primary transition-colors">
              About
            </a>
            <Button>Contact Us</Button>
          </div>
        </div>
    </nav>
  );
}
