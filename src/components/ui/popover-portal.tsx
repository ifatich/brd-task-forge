"use client";

import { useEffect, useState, ReactNode, RefObject, useRef } from "react";
import { createPortal } from "react-dom";

interface PopoverPortalProps {
  children: ReactNode;
  triggerRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  isOpen: boolean;
}

export function PopoverPortal({
  children,
  triggerRef,
  onClose,
  isOpen,
}: PopoverPortalProps) {
  const [mounted, setMounted] = useState(false);
  const [style, setStyle] = useState({ top: 0, left: 0, minWidth: 220 });
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !isOpen || !triggerRef.current) return;

    const updatePosition = () => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      setStyle({
        top: rect.bottom + 4, // 4px gap
        left: rect.left,
        minWidth: Math.max(220, rect.width)
      });
    };

    updatePosition();
    // Update on scroll or resize to keep it attached (capture phase for scroll)
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [mounted, isOpen, triggerRef]);

  useEffect(() => {
    if (!isOpen || !mounted) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      // If click is inside the trigger, don't do anything (let the trigger toggle handle it)
      if (triggerRef.current?.contains(target)) return;
      // If click is inside the popover itself, don't close it (unless handled internally)
      if (popoverRef.current?.contains(target)) return;
      
      onClose();
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, mounted, onClose, triggerRef]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      ref={popoverRef}
      style={{
        position: "fixed",
        top: style.top,
        left: style.left,
        minWidth: style.minWidth,
        zIndex: 9999, // very high z-index to stay above modals
      }}
      className="animate-in fade-in zoom-in-95 duration-100"
    >
      {children}
    </div>,
    document.body
  );
}
