import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
  LabRequest, LabTestItem, RadiologyRequest, RadiologyServiceItem
} from '../../../types';
import {
  FlaskConical, Eye, Plus, Search, Filter, CheckCircle2, Clock,
  AlertTriangle, FileText, Activity, ShieldCheck, XCircle, ArrowRight
} from 'lucide-react';

export const LaboratoryRadiologyView: React.FC = () => {
  const { user, tenant } = useAuth();
  const [activeTab, setActiveTab] = useState<'LAB_QUEUE' | 'LAB_CATALOGUE' | 'RADIO_QUEUE' | 'RADIO_SERVICES'>('LAB_QUEUE');
  const [labRequests, setLabRequests] = useState<LabRequest[]>([]);
  const [labCatalogue, setLabCatalogue] = useState<LabTestItem[]>([]);
  const [radioRequests, setRadioRequests] = useState<RadiologyRequest[]>([]);
  const [radioServices, setRadioServices] = useState<RadiologyServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Result Entry Modal State (Lab)
  const [activeLabRequest, setActiveLabRequest] = useState<LabRequest | null>(null);
  const [testResultValue, setTestResultValue] = useState('');
  const [testUnit, setTestUnit] = useState('mg/dL');
  const [testRefRange, setTestRefRange] = useState('70 - 110');
  const [isAbnormal, setIsAbnormal] = useState(false);
  const [labInterpretation, setLabInterpretation] = useState('');

  // Result Entry Modal State (Radiology)
  const [activeRadioRequest, setActiveRadioRequest] = useState<RadiologyRequest | null>(null);
  const [radioFindings, setRadioFindings] = useState('');
  const [radioImpression, setRadioImpression] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add Lab Test Catalogue Modal State
  const [isAddLabModalOpen, setIsAddLabModalOpen] = useState(false);
  const [newLabName, setNewLabName] = useState('');
  const [newLabCode, setNewLabCode] = useState('');
  const [newLabCategory, setNewLabCategory] = useState<'HEMATOLOGY' | 'BIOCHEMISTRY' | 'MICROBIOLOGY' | 'PARASITOLOGY' | 'SEROLOGY' | 'URINALYSIS'>('HEMATOLOGY');
  const [newLabPrice, setNewLabPrice] = useState('25');
  const [newLabRefRange, setNewLabRefRange] = useState('4.0 - 10.0 x10^9/L');

  // Add Radiology Service Modal State
  const [isAddRadioModalOpen, setIsAddRadioModalOpen] = useState(false);
  const [newRadioName, setNewRadioName] = useState('');
  const [newRadioModality, setNewRadioModality] = useState<'XRAY' | 'ULTRASOUND' | 'CT_SCAN' | 'MRI' | 'ECG' | 'ECHOCARDIOGRAM'>('XRAY');
  const [newRadioBodyPart, setNewRadioBodyPart] = useState('Chest');
  const [newRadioPrice, setNewRadioPrice] = useState('45');

  const getHeaders = () => ({
    'x-user-id': localStorage.getItem('erp_user_id') || '',
    'Content-Type': 'application/json'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [lReqRes, lCatRes, rReqRes, rCatRes] = await Promise.all([
        fetch('/api/app/hospital/lab-requests', { headers: getHeaders() }),
        fetch('/api/app/hospital/lab-tests', { headers: getHeaders() }),
        fetch('/api/app/hospital/radiology-requests', { headers: getHeaders() }),
        fetch('/api/app/hospital/radiology-services', { headers: getHeaders() })
      ]);

      if (lReqRes.ok) setLabRequests((await lReqRes.json()).labRequests || []);
      if (lCatRes.ok) setLabCatalogue((await lCatRes.json()).labTests || []);
      if (rReqRes.ok) setRadioRequests((await rReqRes.json()).requests || []);
      if (rCatRes.ok) setRadioServices((await rCatRes.json()).services || []);
    } catch (err) {
      console.error('Failed to load diagnostic data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenLabResult = (req: LabRequest) => {
    setActiveLabRequest(req);
    const catItem = labCatalogue.find(c => c.id === req.testId);
    setTestResultValue('');
    setTestUnit(catItem?.unit || 'mg/dL');
    setTestRefRange(catItem?.referenceRange || 'Normal');
    setIsAbnormal(false);
    setLabInterpretation('');
  };

  const handleSaveLabResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLabRequest) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/app/hospital/lab-requests/${activeLabRequest.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          status: 'COMPLETED',
          result: {
            parameter: activeLabRequest.testName,
            value: testResultValue.trim(),
            unit: testUnit,
            referenceRange: testRefRange,
            isAbnormal,
            interpretation: labInterpretation.trim() || (isAbnormal ? 'Abnormal Value' : 'Within normal limits')
          },
          technicianId: user?.id || 'tech-1',
          technicianName: user?.name || 'Lab Technologist',
          completedAt: new Date().toISOString()
        })
      });

      if (res.ok) {
        setActiveLabRequest(null);
        fetchData();
      }
    } catch (err) {
      console.error('Error recording lab result:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenRadioResult = (req: RadiologyRequest) => {
    setActiveRadioRequest(req);
    setRadioFindings('');
    setRadioImpression('');
  };

  const handleSaveRadioResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRadioRequest) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/app/hospital/radiology-requests/${activeRadioRequest.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          status: 'REPORTED',
          report: {
            findings: radioFindings.trim(),
            impression: radioImpression.trim() || 'No acute abnormalities visualized',
            radiologistId: user?.id || 'rad-1',
            radiologistName: user?.name || 'Radiologist',
            reportedAt: new Date().toISOString()
          }
        })
      });

      if (res.ok) {
        setActiveRadioRequest(null);
        fetchData();
      }
    } catch (err) {
      console.error('Error saving radiology report:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddLabCatalogue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabName.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/app/hospital/lab-tests', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          name: newLabName.trim(),
          code: newLabCode.trim() || `LAB-${Date.now().toString().slice(-4)}`,
          category: newLabCategory,
          referenceRange: newLabRefRange.trim(),
          unit: 'Units',
          price: parseFloat(newLabPrice) || 20,
          isActive: true
        })
      });

      if (res.ok) {
        setIsAddLabModalOpen(false);
        setNewLabName('');
        setNewLabCode('');
        fetchData();
      }
    } catch (err) {
      console.error('Failed to add lab test:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddRadioService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRadioName.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/app/hospital/radiology-services', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          name: newRadioName.trim(),
          modality: newRadioModality,
          bodyPart: newRadioBodyPart.trim(),
          price: parseFloat(newRadioPrice) || 40,
          isActive: true
        })
      });

      if (res.ok) {
        setIsAddRadioModalOpen(false);
        setNewRadioName('');
        fetchData();
      }
    } catch (err) {
      console.error('Failed to add radiology service:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingLab = labRequests.filter(r => r.status !== 'COMPLETED' && r.status !== 'CANCELLED');
  const pendingRadio = radioRequests.filter(r => r.status !== 'REPORTED' && r.status !== 'CANCELLED');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-blue-600" />
            <span>Diagnostic Services: Laboratory & Radiology</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Specimen testing, pathology analysis, X-Ray / Ultrasound / CT imaging and reports
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab.startsWith('LAB') ? (
            <button
              onClick={() => setIsAddLabModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Lab Test</span>
            </button>
          ) : (
            <button
              onClick={() => setIsAddRadioModalOpen(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Imaging Service</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('LAB_QUEUE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'LAB_QUEUE'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FlaskConical className="w-4 h-4" />
          <span>Lab Investigation Queue ({pendingLab.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('RADIO_QUEUE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'RADIO_QUEUE'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Radiology & Imaging Queue ({pendingRadio.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('LAB_CATALOGUE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'LAB_CATALOGUE'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Lab Test Catalog ({labCatalogue.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('RADIO_SERVICES')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'RADIO_SERVICES'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Radiology Modalities ({radioServices.length})</span>
        </button>
      </div>

      {/* View 1: Lab Investigation Queue */}
      {activeTab === 'LAB_QUEUE' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading lab queue...</div>
          ) : labRequests.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <FlaskConical className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No laboratory requests</p>
              <p className="text-xs text-slate-400">Tests ordered during consultations will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase">
                  <tr>
                    <th className="px-5 py-3">Patient / MRN</th>
                    <th className="px-4 py-3">Test Requested</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3">Status / Result</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {labRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900">{req.patientName}</div>
                        <div className="text-[10px] text-blue-600 font-mono">{req.mrn}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900">{req.testName}</div>
                        <div className="text-[10px] text-slate-400">Dr. {req.doctorName}</div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-700">{req.category}</td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          req.priority === 'STAT' ? 'bg-red-100 text-red-800' :
                          req.priority === 'URGENT' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {req.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        {req.status === 'COMPLETED' && req.result ? (
                          <div className="space-y-0.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              req.result.isAbnormal ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {req.result.value} {req.result.unit} {req.result.isAbnormal ? '(Abnormal)' : '(Normal)'}
                            </span>
                            <div className="text-[10px] text-slate-500 truncate max-w-[180px]">
                              {req.result.interpretation}
                            </div>
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] font-bold">
                            {req.status}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {req.status !== 'COMPLETED' ? (
                          <button
                            onClick={() => handleOpenLabResult(req)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Enter Results
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-600 font-bold flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Verified</span>
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
      )}

      {/* View 2: Radiology & Imaging Queue */}
      {activeTab === 'RADIO_QUEUE' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading radiology queue...</div>
          ) : radioRequests.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Eye className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No radiology requests</p>
              <p className="text-xs text-slate-400">Imaging ordered during consultations will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase">
                  <tr>
                    <th className="px-5 py-3">Patient / MRN</th>
                    <th className="px-4 py-3">Modality / Service</th>
                    <th className="px-4 py-3">Body Part</th>
                    <th className="px-4 py-3">Clinical Indication</th>
                    <th className="px-4 py-3">Status / Impression</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {radioRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900">{req.patientName}</div>
                        <div className="text-[10px] text-blue-600 font-mono">{req.mrn}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900">{req.serviceName}</div>
                        <div className="text-[10px] font-bold text-purple-700">{req.modality}</div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-700">{req.bodyPart}</td>
                      <td className="px-4 py-3.5 text-slate-600 max-w-[180px] truncate">{req.clinicalIndication}</td>
                      <td className="px-4 py-3.5">
                        {req.status === 'REPORTED' && req.report ? (
                          <div className="space-y-0.5">
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded font-bold text-[10px]">
                              REPORTED
                            </span>
                            <div className="text-[10px] text-slate-700 font-semibold truncate max-w-[200px]">
                              {req.report.impression}
                            </div>
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] font-bold">
                            {req.status}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {req.status !== 'REPORTED' ? (
                          <button
                            onClick={() => handleOpenRadioResult(req)}
                            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Write Report
                          </button>
                        ) : (
                          <span className="text-[11px] text-purple-700 font-bold flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Signed Off</span>
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
      )}

      {/* View 3: Lab Test Catalog */}
      {activeTab === 'LAB_CATALOGUE' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase">
                <tr>
                  <th className="px-5 py-3">Test Name</th>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Reference Range</th>
                  <th className="px-4 py-3">Standard Price</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {labCatalogue.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3.5 font-bold text-slate-900">{t.name}</td>
                    <td className="px-4 py-3.5 font-mono text-blue-600 font-semibold">{t.code}</td>
                    <td className="px-4 py-3.5 text-slate-700">{t.category}</td>
                    <td className="px-4 py-3.5 font-mono text-slate-700">{t.referenceRange}</td>
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-900">${t.price}</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                        ACTIVE
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View 4: Radiology Modalities */}
      {activeTab === 'RADIO_SERVICES' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase">
                <tr>
                  <th className="px-5 py-3">Investigation Name</th>
                  <th className="px-4 py-3">Modality</th>
                  <th className="px-4 py-3">Body Region</th>
                  <th className="px-4 py-3">Procedure Fee</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {radioServices.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3.5 font-bold text-slate-900">{r.name}</td>
                    <td className="px-4 py-3.5 font-bold text-purple-700">{r.modality}</td>
                    <td className="px-4 py-3.5 text-slate-700">{r.bodyPart}</td>
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-900">${r.price}</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded font-bold text-[10px]">
                        ONLINE
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Lab Result Entry */}
      {activeLabRequest && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Enter Laboratory Test Results</h3>
                <p className="text-xs text-slate-500">
                  {activeLabRequest.testName} • Patient: <strong className="text-slate-800">{activeLabRequest.patientName}</strong>
                </p>
              </div>
              <button onClick={() => setActiveLabRequest(null)} className="text-slate-400 hover:text-slate-700">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLabResult} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-700 font-medium mb-1">Measured Result Value *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 14.2 / Reactive / Negative"
                    value={testResultValue}
                    onChange={(e) => setTestResultValue(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Unit of Measure</label>
                  <input
                    type="text"
                    value={testUnit}
                    onChange={(e) => setTestUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Biological Reference Range</label>
                <input
                  type="text"
                  value={testRefRange}
                  onChange={(e) => setTestRefRange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <input
                  type="checkbox"
                  id="abnormalFlag"
                  checked={isAbnormal}
                  onChange={(e) => setIsAbnormal(e.target.checked)}
                  className="rounded text-red-600 focus:ring-red-500 h-4 w-4"
                />
                <label htmlFor="abnormalFlag" className="text-xs font-bold text-red-700 cursor-pointer">
                  Flag as Abnormal / Critical Value
                </label>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Technologist Clinical Interpretation</label>
                <textarea
                  rows={2}
                  placeholder="Clinical commentary or repeat verification note..."
                  value={labInterpretation}
                  onChange={(e) => setLabInterpretation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveLabRequest(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Verify & Publish Lab Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Radiology Report Entry */}
      {activeRadioRequest && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Radiology Imaging Report</h3>
                <p className="text-xs text-slate-500">
                  {activeRadioRequest.serviceName} ({activeRadioRequest.modality}) • Patient: <strong className="text-slate-800">{activeRadioRequest.patientName}</strong>
                </p>
              </div>
              <button onClick={() => setActiveRadioRequest(null)} className="text-slate-400 hover:text-slate-700">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRadioResult} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Radiological Findings *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe imaging findings, bone density, soft tissue margins, opacities..."
                  value={radioFindings}
                  onChange={(e) => setRadioFindings(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Clinical Impression / Conclusion *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Normal chest radiograph / Right lower lobe consolidation consistent with pneumonia"
                  value={radioImpression}
                  onChange={(e) => setRadioImpression(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveRadioRequest(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Sign Off & Publish Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Lab Test to Catalogue */}
      {isAddLabModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Add Lab Test to Catalogue</h3>
              <button onClick={() => setIsAddLabModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddLabCatalogue} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Test Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Complete Blood Count (CBC)"
                  value={newLabName}
                  onChange={(e) => setNewLabName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Test Code</label>
                  <input
                    type="text"
                    placeholder="e.g. CBC-001"
                    value={newLabCode}
                    onChange={(e) => setNewLabCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Category</label>
                  <select
                    value={newLabCategory}
                    onChange={(e) => setNewLabCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="HEMATOLOGY">HEMATOLOGY</option>
                    <option value="BIOCHEMISTRY">BIOCHEMISTRY</option>
                    <option value="MICROBIOLOGY">MICROBIOLOGY</option>
                    <option value="PARASITOLOGY">PARASITOLOGY</option>
                    <option value="SEROLOGY">SEROLOGY</option>
                    <option value="URINALYSIS">URINALYSIS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newLabPrice}
                    onChange={(e) => setNewLabPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Standard Reference Range</label>
                  <input
                    type="text"
                    placeholder="e.g. 4.5 - 11.0"
                    value={newLabRefRange}
                    onChange={(e) => setNewLabRefRange(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddLabModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Add Lab Test'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Radiology Service */}
      {isAddRadioModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Add Imaging Service</h3>
              <button onClick={() => setIsAddRadioModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRadioService} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Service / Procedure Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chest X-Ray PA View"
                  value={newRadioName}
                  onChange={(e) => setNewRadioName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Modality</label>
                  <select
                    value={newRadioModality}
                    onChange={(e) => setNewRadioModality(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="XRAY">XRAY</option>
                    <option value="ULTRASOUND">ULTRASOUND</option>
                    <option value="CT_SCAN">CT SCAN</option>
                    <option value="MRI">MRI</option>
                    <option value="ECG">ECG</option>
                    <option value="ECHOCARDIOGRAM">ECHOCARDIOGRAM</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Body Region</label>
                  <input
                    type="text"
                    placeholder="Chest / Abdomen"
                    value={newRadioBodyPart}
                    onChange={(e) => setNewRadioBodyPart(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newRadioPrice}
                    onChange={(e) => setNewRadioPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddRadioModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Add Imaging Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
