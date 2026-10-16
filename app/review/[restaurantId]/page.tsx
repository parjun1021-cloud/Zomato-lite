'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Restaurant = { name: string; cuisine: string; area: string };

export default function ReviewPage({ params }: { params: Promise<{ restaurantId: string }> }) {
  const { restaurantId } = use(params);
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch(`/api/restaurants/${restaurantId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setRestaurant({ name: d.name, cuisine: d.cuisine, area: d.area }))
      .catch(() => {});
  }, [restaurantId]);

  const canSubmit = rating >= 1 && comment.trim().length > 0 && !sending;

  async function submit() {
    setSending(true);
    setError('');
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restaurantId: Number(restaurantId), rating, comment }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      // Display what the backend said, do not invent our own message.
      setError((data as { error?: string }).error || 'Could not submit');
      setSending(false);
      return;
    }
    router.push(`/restaurant/${restaurantId}`);
  }

  return (
    <main className="mx-auto w-full max-w-[560px] px-6 py-10">
      <p className="text-sm text-[#6b6660]">Reviewing</p>
      <h1 className="mt-1 text-2xl font-semibold">{restaurant ? restaurant.name : '…'}</h1>

      <div className="mt-8 flex gap-2" role="radiogroup" aria-label="Pick a rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            aria-label={`${n} star`}
            className={`h-11 w-11 rounded-lg border text-xl ${n <= rating ? 'border-[#b3541e] bg-[#b3541e] text-white' : 'border-[#e8e2d9] bg-white text-[#1c1a17]'}`}
          >
            ★
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write your comment"
        rows={4}
        className="mt-6 w-full rounded-lg border border-[#e8e2d9] bg-white p-3"
      />

      <button
        type="button"
        disabled={!canSubmit}
        onClick={submit}
        className="mt-4 w-full rounded-lg bg-[#b3541e] py-3 font-medium text-white disabled:opacity-40"
      >
        {sending ? 'Submitting…' : 'Submit'}
      </button>

      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}

      <p className="mt-6 text-sm">
        <Link className="underline" href={`/restaurant/${restaurantId}`}>
          Back to restaurant
        </Link>
      </p>
    </main>
  );
}
