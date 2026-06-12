import React from "react";
import Link from "next/link";
import Image from "next/image";

export const SliderDiv = () => {
  const items = [
    {
      href: "https://www.remaxcrest.ca/",
      src: "/images/slider/REMAX-Masters.png",
      alt: "REMAX Masters",
    },
    {
      href: "https://www.honestdoor.com/cities/bc/squamish/squamish",
      src: "/images/slider/HonestDoor.png",
      alt: "Honest Door",
    },
    {
      href: "https://autoprop.ca/",
      src: "/images/slider/Autoprop.jpg",
      alt: "Autoprop",
    },
    {
      href: "https://www.bcit.ca/study/computing-it/",
      src: "/images/slider/BCIT.jpg",
      alt: "BCIT",
    },
    {
      href: "https://www.remax.ca/commercial/bc/squamish-real-estate",
      src: "/images/slider/REMAX-Commercial.png",
      alt: "REMAX Commercial",
    },
  ];

  return (
    // Outer container strictly locked to the exact width of the screen
    <div className="w-full py-8 bg-background overflow-hidden relative">
      {/* Soft visual fade on the edges so items "fade" out instead of abruptly clipping */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-8 md:w-20 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-8 md:w-20 bg-gradient-to-l from-background to-transparent z-10" />

      {/* 
        THE MAGIC WRAPPER: Width is exactly 200% of the screen.
        It holds two identical tracks. When it shifts by -50%, it moves exactly one screen width.
      */}
      <div className="flex w-[200%] animate-marqueeSmooth">
        {/* TRACK 1 (Takes up exactly 1 screen width) */}
        <div className="w-1/2 flex justify-evenly items-center shrink-0">
          {items.map((item, idx) => (
            <Link
              key={`track1-${idx}`}
              href={item.href}
              target="_blank"
              className="shrink-0"
            >
              <div
                className="
                  relative bg-card border border-border rounded-xl
                  flex items-center justify-center shadow-sm hover:shadow-md
                  transition-all duration-300 hover:scale-[1.05] overflow-hidden
                  h-16 sm:h-20 md:h-24 
                  w-[18vw] max-w-[250px]
                "
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 768px) 18vw, 250px"
                  className="object-contain p-2 sm:p-4 md:p-5"
                  priority={idx < 5}
                />
              </div>
            </Link>
          ))}
        </div>

        {/* TRACK 2 (Seamless clone, also takes exactly 1 screen width) */}
        <div
          className="w-1/2 flex justify-evenly items-center shrink-0"
          aria-hidden="true"
        >
          {items.map((item, idx) => (
            <Link
              key={`track2-${idx}`}
              href={item.href}
              target="_blank"
              className="shrink-0"
            >
              <div
                className="
                  relative bg-card border border-border rounded-xl
                  flex items-center justify-center shadow-sm hover:shadow-md
                  transition-all duration-300 hover:scale-[1.05] overflow-hidden
                  h-16 sm:h-20 md:h-24 
                  w-[18vw] max-w-[250px]
                "
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 768px) 18vw, 250px"
                  className="object-contain p-2 sm:p-4 md:p-5"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
