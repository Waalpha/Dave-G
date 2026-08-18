import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { TheatreBooking, Patient } from '../../../types';
import {
  Activity, Plus, Calendar, Clock, User, CheckCircle2, AlertTriangle,
  FileText, ShieldCheck, XCircle, ChevronRight
} from 'lucide-react';

export const TheatreSurgeryView: React.FC = () => {
  const { user, tenant } = useAuth();
  const [bookings, setBookings] = useState<TheatreBooking[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  // New Booking Modal State
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [theatreRoom, setTheatreRoom] = useState('Operating Theatre 1 (Main OT)');
  const [procedureName, setProcedureName] = useState('');
  const [procedureType, setProcedureType] = useState<'ELECTIVE' | 'EMERGENCY' | 'DAY_CARE'>('ELECTIVE');
  const [scheduledStartTime, setScheduledStartTime] = useState('');
  const [scheduledEndTime, setScheduledEndTime] = useState('');
  const [leadSurgeonName, setLeadSurgeonName] = useState('Dr. Main Surgeon');
  const [anesthesiologistName, setAnesthesiologistName] = useState('Dr. Anesthetist');
  const [anesthesiaType, setAnesthesiaType] = useState('General Anesthesia (GA)');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Post-Op Operation Notes Modal State
  const [activeBookingForNotes, setActiveBookingForNotes] = useState<TheatreBooking | null>(null);
  const [operationNotes, setOperationNotes] = useState('');
  const [postOpInstructions, setPostOpInstructions] = useState('');

  const getHeaders = () => ({
    'x-user-id': localStorage.getItem('erp_user_id') || '',
    'Content-Type': 'application/json'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tRes, pRes] = await Promise.all([
        fetch('/api/app/hospital/theatre-bookings', { headers: getHeaders() }),
        fetch('/api/app/hospital/patients', { headers: getHeaders() })
      ]);

      if (tRes.ok) setBookings((await tRes.json()).bookings || []);
      if (pRes.ok) {
        const pData = (await pRes.json()).patients || [];
        setPatients(pData);
        if (pData.length > 0 && !patientId) setPatientId(pData[0].id);
      }
    } catch (err) {
      console.error('Failed to load theatre bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    const pObj = patients.find(p => p.id === patientId);
    if (!pObj || !procedureName.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/app/hospital/theatre-bookings', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          patientId: pObj.id,
          patientName: pObj.fullName,
          mrn: pObj.mrn,
          theatreRoom: theatreRoom.trim(),
          procedureName: procedureName.trim(),
          procedureType,
          scheduledStartTime: scheduledStartTime || new Date().toISOString(),
          scheduledEndTime: scheduledEndTime || new Date(Date.now() + 7200000).toISOString(),
          leadSurgeonId: user?.id || 'surg-1',
          leadSurgeonName: leadSurgeonName.trim(),
          anesthesiologistName: anesthesiologistName.trim(),
          anesthesiaType: anesthesiaType.trim(),
          status: 'SCHEDULED'
        })
      });

      if (res.ok) {
        setIsBookModalOpen(false);
        setProcedureName('');
        fetchData();
      }
    } catch (err) {
      console.error('Failed to schedule surgery:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED') => {
    try {
      const res = await fetch(`/api/app/hospital/theatre-bookings/${bookingId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          status,
          operationNotes: status === 'COMPLETED' ? operationNotes : undefined,
          postOpInstructions: status === 'COMPLETED' ? postOpInstructions : undefined
        })
      });

      if (res.ok) {
        setActiveBookingForNotes(null);
        setOperationNotes('');
        setPostOpInstructions('');
        fetchData();
      }
    } catch (err) {
      console.error('Error updating surgery status:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-rose-600" />
            <span>Operating Theatres & Surgical Suites (OT)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Surgical schedule, pre-op checklists, anesthesia logs, and post-op recovery
          </p>
        </div>

        <button
          onClick={() => setIsBookModalOpen(true)}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Book Operating Theatre</span>
        </button>
      </div>

      {/* Bookings List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading surgical bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Activity className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No surgical cases scheduled</p>
            <p className="text-xs text-slate-400">Elective and emergency surgical procedures will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase">
                <tr>
                  <th className="px-5 py-3">Patient / MRN</th>
                  <th className="px-4 py-3">Procedure & Type</th>
                  <th className="px-4 py-3">Theatre Room</th>
                  <th className="px-4 py-3">Surgical Team</th>
                  <th className="px-4 py-3">Schedule / Status</th>
                  <th className="px-5 py-3 text-right">OT Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900">{b.patientName}</div>
                      <div className="text-[10px] text-blue-600 font-mono">{b.mrn}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">{b.procedureName}</div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        b.procedureType === 'EMERGENCY' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {b.procedureType}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-rose-900">{b.theatreRoom}</td>
                    <td className="px-4 py-3.5">
                      <div className="text-slate-800">Surgeon: <strong>{b.leadSurgeonName}</strong></div>
                      <div className="text-[10px] text-slate-500">Anesth: {b.anesthesiologistName || 'N/A'} ({b.anesthesiaType})</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        b.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                        b.status === 'IN_PROGRESS' ? 'bg-rose-100 text-rose-800 animate-pulse' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {b.status}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(b.scheduledStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {b.status === 'SCHEDULED' && (
                        <button
                          onClick={() => handleUpdateBookingStatus(b.id, 'IN_PROGRESS')}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          Start Case
                        </button>
                      )}
                      {b.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => setActiveBookingForNotes(b)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          Finish Surgery
                        </button>
                      )}
                      {b.status === 'COMPLETED' && (
                        <span className="text-[11px] text-emerald-600 font-bold flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Recovered</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Book Theatre */}
      {isBookModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Schedule Surgical Procedure</h3>
              <button onClick={() => setIsBookModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Select Patient *</label>
                <select
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.fullName} ({p.mrn})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Surgical Procedure Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Laparoscopic Appendectomy / Caesarean Section"
                  value={procedureName}
                  onChange={(e) => setProcedureName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Operating Suite</label>
                  <select
                    value={theatreRoom}
                    onChange={(e) => setTheatreRoom(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="Operating Theatre 1 (Main OT)">Operating Theatre 1 (Main OT)</option>
                    <option value="Operating Theatre 2 (Emergency)">Operating Theatre 2 (Emergency)</option>
                    <option value="Operating Theatre 3 (Maternity/OBGYN)">Operating Theatre 3 (Maternity)</option>
                    <option value="Minor Procedure Room">Minor Procedure Room</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Procedure Urgency</label>
                  <select
                    value={procedureType}
                    onChange={(e) => setProcedureType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                  >
                    <option value="ELECTIVE">ELECTIVE</option>
                    <option value="EMERGENCY">EMERGENCY</option>
                    <option value="DAY_CARE">DAY CARE</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Lead Surgeon</label>
                  <input
                    type="text"
                    value={leadSurgeonName}
                    onChange={(e) => setLeadSurgeonName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Anesthesiologist</label>
                  <input
                    type="text"
                    value={anesthesiologistName}
                    onChange={(e) => setAnesthesiologistName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Scheduling...' : 'Confirm Theatre Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Post-Op Operation Notes */}
      {activeBookingForNotes && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Post-Op Operation Notes</h3>
                <p className="text-xs text-slate-500">Patient: <strong className="text-slate-800">{activeBookingForNotes.patientName}</strong></p>
              </div>
              <button onClick={() => setActiveBookingForNotes(null)} className="text-slate-400 hover:text-slate-700">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Intra-Operative Notes & Findings *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Incision details, anatomical findings, blood loss estimated, closure..."
                  value={operationNotes}
                  onChange={(e) => setOperationNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Post-Op Recovery & Nursing Instructions</label>
                <textarea
                  rows={2}
                  placeholder="Transfer to PACU/Surgical Ward, IV fluids rate, analgesia, drain monitoring..."
                  value={postOpInstructions}
                  onChange={(e) => setPostOpInstructions(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveBookingForNotes(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateBookingStatus(activeBookingForNotes.id, 'COMPLETED')}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs"
                >
                  Complete & Save Post-Op Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
