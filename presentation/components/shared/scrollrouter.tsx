"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

const routes = ["/", "/projects", "/contact"];

export default function ScrollRouter() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let isThrottled = false;

    const handleWheel = (e: WheelEvent) => {
      // If on home, let CSS snapping + page logic handle it
      if (pathname === "/") return;
      // Ignore if the event target is within a scrollable element that can consume vertical scrolling
      const target = e.target as HTMLElement | null;
      if (target) {
        const scrollable = target.closest('[data-scrollable], .overflow-y-auto, .overflow-auto');
        if (scrollable) return;
      }
      if (isThrottled) return;
      isThrottled = true;
      setTimeout(() => (isThrottled = false), 800); // debounce so it feels like snapping

      const currentIndex = routes.indexOf(pathname);
      if (e.deltaY > 0 && currentIndex < routes.length - 1) {
        router.push(routes[currentIndex + 1]);
      } else if (e.deltaY < 0 && currentIndex > 0) {
        router.push(routes[currentIndex - 1]);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [pathname, router]);

  return null;
}
