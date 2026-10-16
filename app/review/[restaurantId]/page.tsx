'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ReviewPage({ params }: { params: Promise<{ restaurantId: string }> }) {
  const { restaurantId } = use(params);
  const router = useRouter();
  const [name, setName] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch(`/api/restaurants/${restaurantId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setName((d as { name: string }).name))
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
      setError((data as { error?: string }).error || 'Could not submit');
      setSending(false);
      return;
    }
    router.push(`/restaurant/${restaurantId}`);
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-[480px] bg-[#f8f8f8]">
      <header className="sticky top-0 z-10 flex items-center gap-3 bg-[#e23744] px-4 py-4 text-white">
        <Link href={`/restaurant/${restaurantId}`} aria-label="Back">←</Link>
        <h1 className="text-xl font-bold">{name || 'Review'}</h1>
      </header>
      <main className="p-4">
        <div className="rounded-xl border border-[#e8e8e8] bg-white p-4 text-center">
          <p className="font-semibold">Tap a star</p>
          <div className="mt-2 flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} star`}
                className={`px-1 text-4xl leading-none ${n <= rating ? 'text-[#f5a623]' : 'text-[#d4d4d4]'}`}>★</button>
            ))}
          </div>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)}
            placeholder="Write a comment" rows={3}
            className="mt-4 w-full rounded-lg border border-[#e8e8e8] p-2" />
          <button type="button" disabled={!canSubmit} onClick={submit}
            className="mt-3 w-full rounded-lg bg-[#e23744] py-3 font-semibold text-white disabled:opacity-40">
            {sending ? 'Submitting…' : 'Submit review'}
          </button>
          {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
        </div>
      </main>
    </div>
  );
}
