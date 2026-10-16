'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';

type Review = { id: number; rating: number; comment: string; createdAt: string };
type Data = {
  name: string;
  cuisine: string;
  area: string;
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

  if (missing) return <main className="mx-auto w-full max-w-[560px] px-6 py-10"><p>Restaurant not found.</p></main>;
  if (!data) return <main className="mx-auto w-full max-w-[560px] px-6 py-10"><p>Loading…</p></main>;

  return (
    <main className="mx-auto w-full max-w-[560px] px-6 py-10">
      <h1 className="text-2xl font-semibold">{data.name}</h1>
      <p className="mt-1 text-sm text-[#6b6660]">{data.cuisine} · {data.area}</p>

      <div className="mt-6 flex items-baseline gap-3">
        {/* THE LINE BELOW prints the average. There is no calculation anywhere in this file. */}
        <span className="text-6xl font-semibold">{data.averageRating === null ? '–' : data.averageRating.toFixed(1)}</span>
        <span className="text-sm text-[#6b6660]">{data.totalReviews} review{data.totalReviews === 1 ? '' : 's'}</span>
      </div>

      {data.totalReviews === 0 || !data.latestReview ? (
        <div className="mt-10 rounded-lg border border-[#e8e2d9] bg-white p-6 text-center">
          <p>No reviews yet. Be the first to review.</p>
          <p className="mt-4"><Link className="underline" href={`/review/${id}`}>Write a review</Link></p>
        </div>
      ) : (
        <>
          <section className="mt-8 rounded-lg border border-[#b3541e] bg-white p-5">
            <p className="text-xs uppercase tracking-wide text-[#b3541e]">Latest review</p>
            <p className="mt-2 font-medium">{data.latestReview.rating} / 5</p>
            <p className="mt-1">{data.latestReview.comment}</p>
            <p className="mt-2 text-xs text-[#6b6660]">{new Date(data.latestReview.createdAt).toLocaleString()}</p>
          </section>

          <section className="mt-6">
            {data.reviews.map((r) => (
              <article key={r.id} className="border-t border-[#e8e2d9] py-4">
                <p className="font-medium">{r.rating} / 5</p>
                <p className="mt-1">{r.comment}</p>
                <p className="mt-1 text-xs text-[#6b6660]">{new Date(r.createdAt).toLocaleString()}</p>
              </article>
            ))}
          </section>

          <p className="mt-8 text-sm">
            <Link className="underline" href={`/review/${id}`}>Write a review</Link>
          </p>
        </>
      )}
    </main>
  );
}
