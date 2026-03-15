import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mentorsAPI, paymentAPI } from '../api'
import toast from 'react-hot-toast'
import { Star, Clock, Loader2, X, Calendar } from 'lucide-react'

const SLOT_LABELS = { '15min': '15 min', '30min': '30 min', '1hr': '1 hour' }

function BookingModal({ mentor, onClose }) {
  const [slot, setSlot] = useState(null)
  const [notes, setNotes] = useState('')
  const qc = useQueryClient()

  const bookMutation = useMutation({
    mutationFn: async () => {
      const { data } = await mentorsAPI.book(mentor._id, { duration: slot, notes })
      const bookingId = data.booking._id
      const { data: order } = await paymentAPI.createOrder(bookingId)
      if (order.mock) return { message: 'Booking confirmed! (Mock payment)' }
      // Real Razorpay flow
      return new Promise((res, rej) => {
        const rzp = new window.Razorpay({
          key: order.key, amount: order.amount, currency: 'INR',
          name: 'AI Career Navigator', description: `${SLOT_LABELS[slot]} with ${mentor.name}`,
          handler: async (response) => {
            await paymentAPI.verify({ bookingId, paymentId: response.razorpay_payment_id, orderId: order.orderId })
            res({ message: 'Booking confirmed!' })
          },
          modal: { ondismiss: () => rej(new Error('Payment cancelled')) }
        })
        rzp.open()
      })
    },
    onSuccess: (r) => { toast.success(r.message); onClose(); qc.invalidateQueries(['my-bookings']) },
    onError: (e) => toast.error(e.message || 'Booking failed'),
  })

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card max-w-md w-full">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-lg">Book Session</h3>
            <p className="text-slate-500 text-sm">{mentor.name} · {mentor.title}</p>
          </div>
          <button onClick={onClose} className="text-slate-600 hover:text-white"><X size={20} /></button>
        </div>

        <div className="mb-5">
          <div className="text-xs text-slate-500 mb-2">Select Duration</div>
          <div className="grid grid-cols-3 gap-2">
            {mentor.slots?.map(s => (
              <div key={s} onClick={() => setSlot(s)}
                className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${slot === s ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/40'}`}>
                <div className="font-bold text-sm">{SLOT_LABELS[s]}</div>
                <div className="text-accent text-sm font-semibold mt-0.5">₹{mentor.pricing?.[s]}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <label className="text-xs text-slate-500 block mb-1.5">Session Notes (optional)</label>
          <textarea rows={3} className="input resize-none text-sm" placeholder="What do you want to cover? E.g. system design prep, resume review, salary negotiation…" value={notes} onChange={e => setNotes(e.target.value)} />
        </div>

        <button disabled={!slot || bookMutation.isPending} onClick={() => bookMutation.mutate()} className="btn-primary w-full flex items-center justify-center gap-2">
          {bookMutation.isPending ? <><Loader2 size={16} className="animate-spin" /> Processing…</> : slot ? `Confirm Booking · ₹${mentor.pricing?.[slot]}` : 'Select a duration'}
        </button>
      </div>
    </div>
  )
}

export default function MentorsPage() {
  const [bookingMentor, setBookingMentor] = useState(null)
  const { data, isLoading } = useQuery({ queryKey: ['mentors'], queryFn: () => mentorsAPI.getAll().then(r => r.data.mentors) })
  const { data: bookingsData } = useQuery({ queryKey: ['my-bookings'], queryFn: () => mentorsAPI.getMyBookings().then(r => r.data.bookings) })

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 size={32} className="animate-spin text-accent" /></div>

  return (
    <div>
      <div className="mb-8 page-header"><h1>Human Mentors</h1><p>Book 1-on-1 paid guidance with industry experts</p></div>

      <div className="grid grid-cols-2 gap-5 mb-8">
        {data?.map(mentor => (
          <div key={mentor._id} className="card hover:border-slate-600 transition-all hover:-translate-y-0.5 duration-200">
            <div className="flex gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{ background: `${mentor.accentColor}20`, color: mentor.accentColor }}>
                {mentor.avatarInitials}
              </div>
              <div className="flex-1">
                <div className="font-bold">{mentor.name}</div>
                <div className="text-sm text-slate-500">{mentor.title} @ {mentor.company}</div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-accent4 text-xs"><Star size={11} fill="currentColor" /> {mentor.rating}</span>
                  <span className="text-slate-600 text-xs">{mentor.totalReviews} reviews</span>
                  <span className="text-slate-600 text-xs">{mentor.yearsExperience} yrs exp</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-3 leading-relaxed">{mentor.bio}</p>
            <div className="flex gap-1 flex-wrap mb-4">
              {mentor.expertise?.slice(0, 4).map(e => <span key={e} className="tag text-[10px]">{e}</span>)}
            </div>
            <div className="flex gap-2 mb-4">
              {mentor.slots?.map(s => (
                <div key={s} className="flex-1 bg-bg rounded-lg p-2.5 border border-border/60 text-center">
                  <div className="flex items-center justify-center gap-1 text-xs text-slate-500 mb-0.5"><Clock size={10} />{SLOT_LABELS[s]}</div>
                  <div className="font-semibold text-sm text-accent">₹{mentor.pricing?.[s]}</div>
                </div>
              ))}
            </div>
            <button onClick={() => setBookingMentor(mentor)} className="btn-primary w-full text-sm">Book Session</button>
          </div>
        ))}
      </div>

      {bookingsData?.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4"><Calendar size={16} className="text-accent" /><span className="font-semibold">My Bookings</span></div>
          {bookingsData.map(b => (
            <div key={b._id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
              <div>
                <div className="text-sm font-medium">{b.mentorId?.name || 'Mentor'}</div>
                <div className="text-xs text-slate-500">{SLOT_LABELS[b.duration]} · ₹{b.price}</div>
              </div>
              <span style={{ color: b.status === 'confirmed' ? '#10b981' : b.status === 'pending' ? '#f59e0b' : '#94a3b8', background: b.status === 'confirmed' ? '#10b98115' : '#f59e0b15', padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                {b.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {bookingMentor && <BookingModal mentor={bookingMentor} onClose={() => setBookingMentor(null)} />}
    </div>
  )
}
