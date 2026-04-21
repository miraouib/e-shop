"use client";

import { useCartStore } from "@/store/cartStore";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocale } from "next-intl";

export default function CartHeader() {
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((state) => state.items);
  const locale = useLocale();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  if (!mounted) {
    return (
      <div className="relative p-2">
        <ShoppingCart size={24} />
      </div>
    );
  }

  return (
    <Link href={`/${locale}/cart`} className="relative p-2 hover:bg-white/10 rounded-full transition-colors flex items-center">
      <ShoppingCart size={24} />
      {totalItems > 0 && (
        <span className="absolute top-0 right-0 bg-yellow-400 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {totalItems}
        </span>
      )}
    </Link>
  );
}
