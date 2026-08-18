import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { QueueEntry, TriageAssessment, Patient, TriageCategory } from '../../../types';
import {
  Activity, Heart, Thermometer, Droplet, UserCheck, Clock, AlertTriangle,
  Plus, CheckCircle2, ChevronRight, Search, ShieldAlert, ArrowRight, User
} from 'lucide-react';

interface TriageQueueManagementProps {
  onRouteToConsultation?: (patientId: string) => void;
}

export const TriageQueueManagement: React.FC<TriageQueueManagementProps> = ({
  onRouteToConsultation
}) => {
  const { tenant } = useAuth();
  const [queues, setQueues] = useState<QueueEntry[]>([]);
  const [triages, setTriages] = useState<TriageAssessment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  // Vitals Assessment Modal State
  const [activeQueueItem, setActiveQueueItem] = useState<QueueEntry | null>(null);
  const [systolicBP, setSystolicBP] = useState('120');
  const [diastolicBP, setDiastolicBP] = useState('80');
  const [heartRate, setHeartRate] = useState('72');
  const [temperature, setTemperature] = useState('36.6');
  const [respiratoryRate, setRespiratoryRate] = useState('16');
  const [oxygenSaturation, setOxygenSaturation] = useState('98');
  const [weightKg, setWeightKg] = useState('70');
  const [heightCm, setHeightCm] = useState('170');
  const [bloodGlucose, setBloodGlucose] = useState('');
  const [triageCategory, setTriageCategory] = useState<TriageCategory>('NORMAL');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [nurseNotes, setNurseNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getHeaders = () => ({
    'x-user-id': localStorage.getItem('erp_user_id') || '',
    'Content-Type': 'application/json'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [qRes, tRes, pRes] = await Promise.all([
        fetch('/api/app/hospital/queues', { headers: getHeaders() }),
        fetch('/api/app/hospital/triages', { headers: getHeaders() }),
        fetch('/api/app/hospital/patients', { headers: getHeaders() })
      ]);

      if (qRes.ok) {
        const qData = await qRes.json();
        setQueues(qData.queues || []);
      }
      if (tRes.ok) {
        const tData = await tRes.json();
        setTriages(tData.triages || []);
      }
      if (pRes.ok) {
        const pData = await pRes.json();
        setPatients(pData.patients || []);
      }
    } catch (err) {
      console.error('Failed to load triage data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenTriage = (q: QueueEntry) => {
    setActiveQueueItem(q);
    setSystolicBP('120');
    setDiastolicBP('80');
    setHeartRate('75');
    setTemperature('36.8');
    setRespiratoryRate('16');
    setOxygenSaturation('98');
    setWeightKg('70');
    setHeightCm('170');
    setBloodGlucose('');
    setTriageCategory(q.priority === 'EMERGENCY' ? 'EMERGENCY' : q.priority === 'URGENT' ? 'URGENT' : 'NORMAL');
    setChiefComplaint('');
    setNurseNotes('');
  };

  const handleSaveTriage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQueueItem) return;

    try {
      setIsSubmitting(true);
      const sBP = parseFloat(systolicBP) || 120;
      const dBP = parseFloat(diastolicBP) || 80;
      const hr = parseFloat(heartRate) || 72;
      const temp = parseFloat(temperature) || 36.6;
      const rr = parseFloat(respiratoryRate) || 16;
      const spo2 = parseFloat(oxygenSaturation) || 98;
      const wt = parseFloat(weightKg) || 70;
      const ht = parseFloat(heightCm) || 170;
      const bg = bloodGlucose ? parseFloat(bloodGlucose) : undefined;
      const bmi = ht > 0 ? parseFloat((wt / Math.pow(ht / 100, 2)).toFixed(1)) : undefined;

      const payload = {
        patientId: activeQueueItem.patientId,
        patientName: activeQueueItem.patientName,
        mrn: activeQueueItem.mrn,
        triageCategory,
        vitals: {
          bloodPressure: `${sBP}/${dBP}`,
          systolicBP: sBP,
          diastolicBP: dBP,
          heartRateBpm: hr,
          temperatureCelsius: temp,
          respiratoryRate: rr,
          oxygenSaturationSpo2: spo2,
          weightKg: wt,
          heightCm: ht,
          bmi,
          bloodGlucoseMmol: bg
        },
        chiefComplaint: chiefComplaint.trim() || 'General OPD assessment',
        nurseNotes: nurseNotes.trim()
      };

      const res = await fetch('/api/app/hospital/triages', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        // Update queue item status to WAITING_FOR_DOCTOR
        await fetch(`/api/app/hospital/queues/${activeQueueItem.id}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify({
            status: 'WAITING_FOR_DOCTOR',
            department: 'DOCTOR_CONSULTATION'
          })
        });

        setActiveQueueItem(null);
        fetchData();
      }
    } catch (err) {
      console.error('Error saving triage:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const waitingQueue = queues.filter(q => q.status === 'WAITING' || q.status === 'IN_TRIAGE');
  const readyForDoctorQueue = queues.filter(q => q.status === 'WAITING_FOR_DOCTOR' || q.status === 'IN_CONSULTATION');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-red-600" />
            <span>Nurse Triage Station & OPD Queue Flow</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Vital signs assessment, acuity categorization, and live patient routing
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>{waitingQueue.length} In Triage Queue</span>
          </span>
          <span className="px-3 py-1.5 bg-blue-50 text-blue-800 border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>{readyForDoctorQueue.length} Ready for Doctor</span>
          </span>
        </div>
      </div>

      {/* Two-Column Queue Dashboard: 1. Waiting for Triage | 2. Triaged & Ready for Doctor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Waiting for Nurse Triage */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <h4 className="font-bold text-slate-900 text-sm">1. Arrived & Waiting for Vitals ({waitingQueue.length})</h4>
            </div>
            <span className="text-[11px] text-slate-400">Nurse Station</span>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading queue...</div>
          ) : waitingQueue.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <UserCheck className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-medium text-slate-600">No patients waiting for triage</p>
              <p className="text-[11px] text-slate-400">Patients registered or checked in will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {waitingQueue.map((q) => (
                <div
                  key={q.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-blue-300 hover:shadow-xs transition-all flex items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs truncate">{q.patientName}</span>
                      <span className="font-mono text-[10px] text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded">
                        {q.mrn}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        q.priority === 'EMERGENCY' ? 'bg-red-100 text-red-800' :
                        q.priority === 'URGENT' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-200 text-slate-700'
                      }`}>
                        {q.priority}
                      </span>
                      <span>Queue #{q.queueNumber}</span>
                      <span>•</span>
                      <span>{new Date(q.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenTriage(q)}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>Take Vitals</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Triaged & Waiting for Consultation */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h4 className="font-bold text-slate-900 text-sm">2. Triaged & Ready for Doctor ({readyForDoctorQueue.length})</h4>
            </div>
            <span className="text-[11px] text-slate-400">Consultation Roster</span>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading queue...</div>
          ) : readyForDoctorQueue.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Activity className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-medium text-slate-600">No patients waiting for doctor</p>
              <p className="text-[11px] text-slate-400">Triaged patients will automatically populate this consultation queue</p>
            </div>
          ) : (
            <div className="space-y-3">
              {readyForDoctorQueue.map((q) => {
                const latestTriage = triages.find(t => t.patientId === q.patientId);
                return (
                  <div
                    key={q.id}
                    className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/30 hover:bg-white hover:border-emerald-300 hover:shadow-xs transition-all flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs truncate">{q.patientName}</span>
                        <span className="font-mono text-[10px] text-emerald-700 font-semibold bg-emerald-100 px-1.5 py-0.5 rounded">
                          {q.mrn}
                        </span>
                      </div>

                      {latestTriage && (
                        <div className="flex items-center gap-2 text-[10px] text-slate-600 flex-wrap">
                          <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded font-mono font-bold text-slate-800">
                            BP: {latestTriage.vitals.bloodPressure}
                          </span>
                          <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded font-mono">
                            HR: {latestTriage.vitals.heartRateBpm} bpm
                          </span>
                          <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded font-mono">
                            Temp: {latestTriage.vitals.temperatureCelsius}°C
                          </span>
                          <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded font-mono">
                            SpO2: {latestTriage.vitals.oxygenSaturationSpo2}%
                          </span>
                        </div>
                      )}
                    </div>

                    {onRouteToConsultation && (
                      <button
                        onClick={() => onRouteToConsultation(q.patientId)}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                      >
                        <span>Call In</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Triage Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
        <h4 className="font-bold text-slate-900 text-sm">Recent Clinical Triage Logs</h4>
        {triages.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No clinical triage assessments recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-2.5">Time / Patient</th>
                  <th className="px-3 py-2.5">Category</th>
                  <th className="px-3 py-2.5">Blood Pressure</th>
                  <th className="px-3 py-2.5">Heart Rate</th>
                  <th className="px-3 py-2.5">Temp</th>
                  <th className="px-3 py-2.5">SpO2</th>
                  <th className="px-3 py-2.5">BMI / Wt</th>
                  <th className="px-4 py-2.5">Chief Complaint</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {triages.slice(0, 10).map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5">
                      <div className="font-bold text-slate-900">{t.patientName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{t.mrn} • {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.triageCategory === 'EMERGENCY' ? 'bg-red-100 text-red-800' :
                        t.triageCategory === 'URGENT' ? 'bg-amber-100 text-amber-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {t.triageCategory}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-mono font-semibold text-slate-800">{t.vitals.bloodPressure}</td>
                    <td className="px-3 py-2.5 font-mono">{t.vitals.heartRateBpm} bpm</td>
                    <td className="px-3 py-2.5 font-mono">{t.vitals.temperatureCelsius}°C</td>
                    <td className="px-3 py-2.5 font-mono">{t.vitals.oxygenSaturationSpo2}%</td>
                    <td className="px-3 py-2.5 font-mono">{t.vitals.bmi ? `${t.vitals.bmi} (${t.vitals.weightKg}kg)` : `${t.vitals.weightKg}kg`}</td>
                    <td className="px-4 py-2.5 max-w-[200px] truncate text-slate-700">{t.chiefComplaint}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Vitals Recording Modal */}
      {activeQueueItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Record Patient Vital Signs</h3>
                <p className="text-xs text-slate-500">
                  Patient: <strong className="text-slate-800">{activeQueueItem.patientName}</strong> ({activeQueueItem.mrn})
                </p>
              </div>
              <button onClick={() => setActiveQueueItem(null)} className="text-slate-400 hover:text-slate-700 text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTriage} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Acuity Category *</label>
                  <select
                    value={triageCategory}
                    onChange={(e) => setTriageCategory(e.target.value as TriageCategory)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="NORMAL" className="text-emerald-700">NORMAL (Standard OPD)</option>
                    <option value="PRIORITY" className="text-blue-700">PRIORITY (Elderly / Pediatric)</option>
                    <option value="URGENT" className="text-amber-700">URGENT (Severe pain, High fever)</option>
                    <option value="EMERGENCY" className="text-red-700">EMERGENCY (Immediate resuscitation)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Blood Glucose (mmol/L)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 5.4"
                    value={bloodGlucose}
                    onChange={(e) => setBloodGlucose(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Vitals Grid */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <span className="font-bold text-slate-800 text-[11px]">Vital Parameters</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-slate-500 text-[10px] mb-1">Systolic BP (mmHg)</label>
                    <input
                      type="number"
                      required
                      value={systolicBP}
                      onChange={(e) => setSystolicBP(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[10px] mb-1">Diastolic BP (mmHg)</label>
                    <input
                      type="number"
                      required
                      value={diastolicBP}
                      onChange={(e) => setDiastolicBP(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[10px] mb-1">Pulse / HR (bpm)</label>
                    <input
                      type="number"
                      required
                      value={heartRate}
                      onChange={(e) => setHeartRate(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[10px] mb-1">Temperature (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[10px] mb-1">SpO2 (%)</label>
                    <input
                      type="number"
                      required
                      value={oxygenSaturation}
                      onChange={(e) => setOxygenSaturation(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[10px] mb-1">Resp Rate (/min)</label>
                    <input
                      type="number"
                      required
                      value={respiratoryRate}
                      onChange={(e) => setRespiratoryRate(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[10px] mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.5"
                      required
                      value={weightKg}
                      onChange={(e) => setWeightKg(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[10px] mb-1">Height (cm)</label>
                    <input
                      type="number"
                      required
                      value={heightCm}
                      onChange={(e) => setHeightCm(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Chief Complaint *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Severe headache for 3 days with nausea"
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Nurse Triage Notes</label>
                <textarea
                  rows={2}
                  placeholder="Clinical observation, consciousness level, mobility..."
                  value={nurseNotes}
                  onChange={(e) => setNurseNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveQueueItem(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Vitals & Route to Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
