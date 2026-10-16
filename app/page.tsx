'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Item = {
  id: number;
  name: string;
  cuisine: string;
  area: string;
  type: string;
  image: string;
  averageRating: number | null;
  totalReviews: number;
};

export default function Home() {
  const [items, setItems] = useState<Item[] | null>(null);

  useEffect(() => {
    fetch('/api/restaurants')
      .then((r) => r.json())
      .then((d) => setItems((d as { restaurants: Item[] }).restaurants))
      .catch(() => setItems([]));
  }, []);

  return (
    <div className="mx-auto min-h-screen w-full max-w-[480px] bg-[#f8f8f8]">
      <header className="sticky top-0 z-10 bg-[#e23744] px-4 py-4 text-white">
        <h1 className="text-xl font-bold">Zomato Lite</h1>
      </header>
      <main className="p-4">
        {!items ? (
          <p className="py-10 text-center text-[#696969]">Loading…</p>
        ) : items.length === 0 ? (
          <p className="py-10 text-center text-[#696969]">No restaurants yet.</p>
        ) : (
          items.map((r) => (
            <Link key={r.id} href={`/restaurant/${r.id}`} className="mb-3 block overflow-hidden rounded-xl border border-[#e8e8e8] bg-white">
              <img src={r.image} alt={r.name} className="h-36 w-full object-cover" />
              <div className="flex justify-between gap-3 p-4">
              <div>
                <h2 className="text-[17px] font-semibold">{r.name}</h2>
                <p className="mt-0.5 text-sm text-[#696969]">{r.cuisine} · {r.type}</p>
                <p className="mt-0.5 text-sm text-[#696969]">{r.area}</p>
                <p className="mt-1 text-xs text-[#696969]">{r.totalReviews} review{r.totalReviews === 1 ? '' : 's'}</p>
              </div>
              <div>
                {/* Prints the average. No maths here. */}
                <div className={`whitespace-nowrap rounded-lg px-2 py-1 text-sm font-bold text-white ${r.totalReviews ? 'bg-[#24963f]' : 'bg-[#9a9a9a]'}`}>
                  {r.averageRating === null ? '–' : r.averageRating.toFixed(1)} ★
                </div>
              </div>
              </div>
            </Link>
          ))
        )}
        <p className="mt-4 text-center text-xs text-[#696969]">Adding a restaurant later? It appears here automatically — no code change.</p>
      </main>
    </div>
  );
}
