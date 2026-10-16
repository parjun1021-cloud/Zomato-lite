'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';

type Review = { id: number; rating: number; comment: string; createdAt: string };
type Data = {
  name: string;
  cuisine: string;
  area: string;
  type: string;
  image: string;
  averageRating: number | null;
  totalReviews: number;
  latestReview: Review | null;
  reviews: Review[];
};

export default function RestaurantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<Data | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    fetch(`/api/restaurants/${id}`)
      .then((r) => {
        if (r.status === 404) { setMissing(true); return null; }
        return r.json();
      })
      .then((d) => d && setData(d as Data))
      .catch(() => {});
  }, [id]);

  if (missing) return <main className="mx-auto w-full max-w-[480px] p-4">Restaurant not found. <Link className="underline" href="/">Back</Link></main>;
  if (!data) return <main className="mx-auto w-full max-w-[480px] p-4 text-[#696969]">Loading…</main>;

  return (
    <div className="mx-auto min-h-screen w-full max-w-[480px] bg-[#f8f8f8]">
      <header className="sticky top-0 z-10 flex items-center gap-3 bg-[#e23744] px-4 py-4 text-white">
        <Link href="/" aria-label="Back">←</Link>
        <h1 className="text-xl font-bold">{data.name}</h1>
      </header>
      <main className="p-4">
        <div className="overflow-hidden rounded-xl border border-[#e8e8e8] bg-white">
          <img src={data.image} alt={data.name} className="h-44 w-full object-cover" />
          <div className="p-4 text-center">
          <p className="text-sm text-[#696969]">{data.cuisine} · {data.type}</p>
          <p className="text-sm text-[#696969]">{data.area}</p>
          {/* THE LINE BELOW prints the average. No calculation anywhere in this file. */}
          <p className="mt-1 text-[42px] font-bold leading-none">{data.averageRating === null ? '0.0' : data.averageRating.toFixed(1)}</p>
          <p className="mt-1 text-sm text-[#696969]">{data.totalReviews} review{data.totalReviews === 1 ? '' : 's'}</p>
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-[#e8e8e8] bg-white p-4 text-center">
          <Link className="block w-full rounded-lg bg-[#e23744] py-3 font-semibold text-white" href={`/review/${id}`}>
            Rate this restaurant
          </Link>
        </div>

        <h3 className="mb-2 mt-5 text-base font-semibold">Latest review</h3>
        {!data.latestReview ? (
          <div className="rounded-xl border border-[#e8e8e8] bg-white p-6 text-center text-[#696969]">
            No reviews yet. Be the first to review.
          </div>
        ) : (
          <div className="rounded-xl border border-[#e23744] bg-white p-4">
            <p className="font-medium">{data.latestReview.rating} / 5 ★</p>
            <p className="mt-1">{data.latestReview.comment}</p>
            <p className="mt-2 text-xs text-[#696969]">{new Date(data.latestReview.createdAt).toLocaleString()}</p>
          </div>
        )}

        <h3 className="mb-2 mt-5 text-base font-semibold">All reviews</h3>
        {data.reviews.length === 0 ? (
          <p className="text-sm text-[#696969]">Nothing else yet.</p>
        ) : (
          data.reviews.map((r) => (
            <article key={r.id} className="mb-2 rounded-xl border border-[#e8e8e8] bg-white p-4">
              <p className="font-medium">{r.rating} / 5 ★</p>
              <p className="mt-1">{r.comment}</p>
              <p className="mt-1 text-xs text-[#696969]">{new Date(r.createdAt).toLocaleString()}</p>
            </article>
          ))
        )}
      </main>
    </div>
  );
}
