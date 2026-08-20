import React, { useState, useEffect } from 'react';
import {
  Tv, Video, Calendar, BookOpen, Plus, Play, Clock,
  Eye, CheckCircle, Radio, Sparkles, RefreshCw, Upload
} from 'lucide-react';
import {
  TVScheduleItem, MediaContentItem, MinistryEventRecord,
  TheologicalArticleRecord
} from '../../../types';

export const BrooksOfLifeMediaStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tv' | 'vod' | 'events' | 'articles'>('tv');

  const [tvSchedule, setTvSchedule] = useState<TVScheduleItem[]>([]);
  const [mediaList, setMediaList] = useState<MediaContentItem[]>([]);
  const [events, setEvents] = useState<MinistryEventRecord[]>([]);
  const [articles, setArticles] = useState<TheologicalArticleRecord[]>([]);

  // TV Schedule item form
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [schedForm, setSchedForm] = useState({
    dayOfWeek: 'MONDAY',
    startTime: '09:00',
    endTime: '10:00',
    programmeTitle: '',
    hostOrSpeaker: 'Brooks of Life Faculty',
    category: 'THEOLOGY_LECTURE',
    isLiveNow: false
  });

  // Media VOD form
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaForm, setMediaForm] = useState({
    title: '',
    category: 'SERMON',
    durationMinutes: 45,
    videoUrl: 'https://www.youtube.com/watch?v=live-demo',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    description: '',
    speakerMinister: 'Rev. Dr. David Brooks'
  });

  useEffect(() => {
    fetchMediaData();
  }, []);

  const fetchMediaData = async () => {
    try {
      const [schedRes, medRes, evRes, artRes] = await Promise.all([
        fetch('/api/tems/tv-schedule'),
        fetch('/api/tems/media'),
        fetch('/api/tems/events'),
        fetch('/api/tems/articles')
      ]);

      const [schedData, medData, evData, artData] = await Promise.all([
        schedRes.json(), medRes.json(), evRes.json(), artRes.json()
      ]);

      if (schedData.schedule) setTvSchedule(schedData.schedule);
      if (medData.media) setMediaList(medData.media);
      if (evData.events) setEvents(evData.events);
      if (artData.articles) setArticles(artData.articles);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/tems/tv-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schedForm)
      });
      const data = await res.json();
      if (data.success) {
        setShowScheduleModal(false);
        fetchMediaData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/tems/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mediaForm)
      });
      const data = await res.json();
      if (data.success) {
        setShowMediaModal(false);
        fetchMediaData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 font-bold text-xl">
            <Tv className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-white">Brooks of Life TV &amp; Media Studio</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/30 flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
                <span>24/7 Broadcast Studio</span>
              </span>
            </div>
            <p className="text-xs text-amber-300/90 font-medium mt-1">
              “For Your Christian Vibes” &bull; Digital broadcasting, live sermons, VOD Christian video library, and theological publications.
            </p>
          </div>
        </div>

        <button
          onClick={fetchMediaData}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all cursor-pointer flex items-center space-x-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Media Feed</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto space-x-2 border-b border-slate-800 pb-2 text-xs font-medium">
        {[
          { id: 'tv', label: '24/7 TV Guide Schedule', icon: Clock },
          { id: 'vod', label: 'VOD & Sermon Library', icon: Video },
          { id: 'events', label: 'Ministry Events & Conferences', icon: Calendar },
          { id: 'articles', label: 'Theological Articles & Research', icon: BookOpen }
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center space-x-2 whitespace-nowrap ${
                isActive
                  ? 'bg-red-600 text-white font-bold shadow-md'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: 24/7 TV SCHEDULE */}
      {activeTab === 'tv' && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white">Continuous Broadcast Lineup</h3>
                <p className="text-xs text-slate-400">Manage live on-air slots and automated master control playback.</p>
              </div>
              <button
                onClick={() => setShowScheduleModal(true)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs cursor-pointer flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Broadcast Slot</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tvSchedule.map((s) => (
                <div key={s.id} className={`p-5 rounded-xl border text-xs space-y-3 ${s.isLiveNow ? 'bg-red-950/20 border-red-500/40 text-red-100' : 'bg-slate-950 border-slate-800 text-slate-300'}`}>
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-amber-400 font-bold">{s.startTime} - {s.endTime}</span>
                    {s.isLiveNow && (
                      <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-bold text-[10px] animate-pulse">
                        LIVE NOW
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-bold text-white">{s.programmeTitle}</h4>
                  <div className="text-slate-400">
                    Host: <strong className="text-slate-200">{s.hostOrSpeaker}</strong> &bull; Category: <span className="text-amber-400">{s.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VOD & SERMON LIBRARY */}
      {activeTab === 'vod' && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white">On-Demand Sermons &amp; Christian Vibes</h3>
                <p className="text-xs text-slate-400">Upload and catalog videos, praise &amp; worship, lectures and documentaries.</p>
              </div>
              <button
                onClick={() => setShowMediaModal(true)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs cursor-pointer flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Upload Media Item</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {mediaList.map((m) => (
                <div key={m.id} className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden text-xs space-y-3">
                  <div className="relative aspect-video bg-black">
                    <img src={m.thumbnailUrl} alt={m.title} className="w-full h-full object-cover opacity-80" />
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-white text-[10px] font-mono">
                      {m.durationMinutes}m
                    </span>
                  </div>
                  <div className="p-4 space-y-2">
                    <span className="text-amber-400 font-bold uppercase text-[10px]">{m.category}</span>
                    <h4 className="text-sm font-bold text-white">{m.title}</h4>
                    <p className="text-slate-400 line-clamp-2 text-[11px]">{m.description}</p>
                    <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800 flex justify-between">
                      <span>{m.speakerMinister}</span>
                      <span>{m.viewsCount} views</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MINISTRY EVENTS */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white">Ministry Events &amp; Theological Conferences</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.map((ev) => (
                <div key={ev.id} className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-amber-400">{ev.eventDate} at {ev.startTime}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">{ev.venueCity}</span>
                  </div>
                  <h4 className="text-base font-bold text-white">{ev.title}</h4>
                  <p className="text-slate-400 text-[11px]">{ev.description}</p>
                  <div className="text-slate-300">Theme: <strong>{ev.theme}</strong></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ARTICLES */}
      {activeTab === 'articles' && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white">Theological Research &amp; Articles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {articles.map((art) => (
                <div key={art.id} className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <span className="text-amber-400 font-bold uppercase text-[10px]">{art.topicCategory}</span>
                  <h4 className="text-base font-bold text-white">{art.title}</h4>
                  <p className="text-slate-400 text-[11px] leading-relaxed">{art.summary}</p>
                  <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800 flex justify-between">
                    <span>By {art.authorName}</span>
                    <span>{art.readTimeMinutes} min read</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Schedule Slot */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Add 24/7 TV Broadcast Slot</h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-white font-bold text-lg cursor-pointer">&times;</button>
            </div>
            <form onSubmit={handleCreateSchedule} className="space-y-3">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Programme Title</label>
                <input
                  type="text"
                  placeholder="e.g. Christian Vibes Praise &amp; Worship Hour"
                  value={schedForm.programmeTitle}
                  onChange={(e) => setSchedForm({ ...schedForm, programmeTitle: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-red-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Start Time (GMT)</label>
                  <input
                    type="time"
                    value={schedForm.startTime}
                    onChange={(e) => setSchedForm({ ...schedForm, startTime: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">End Time (GMT)</label>
                  <input
                    type="time"
                    value={schedForm.endTime}
                    onChange={(e) => setSchedForm({ ...schedForm, endTime: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">Host or Minister</label>
                <input
                  type="text"
                  value={schedForm.hostOrSpeaker}
                  onChange={(e) => setSchedForm({ ...schedForm, hostOrSpeaker: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button type="button" onClick={() => setShowScheduleModal(false)} className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-lg bg-red-600 text-white font-bold">Add to TV Guide</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Media Item */}
      {showMediaModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Upload / Embed Media Item</h3>
              <button onClick={() => setShowMediaModal(false)} className="text-slate-400 hover:text-white font-bold text-lg cursor-pointer">&times;</button>
            </div>
            <form onSubmit={handleCreateMedia} className="space-y-3">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Media Title</label>
                <input
                  type="text"
                  placeholder="e.g. Exegesis of the Pauline Epistles"
                  value={mediaForm.title}
                  onChange={(e) => setMediaForm({ ...mediaForm, title: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-red-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Category</label>
                  <select
                    value={mediaForm.category}
                    onChange={(e) => setMediaForm({ ...mediaForm, category: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="SERMON">SERMON</option>
                    <option value="THEOLOGY_LECTURE">THEOLOGY LECTURE</option>
                    <option value="PRAISE_WORSHIP">PRAISE &amp; WORSHIP</option>
                    <option value="YOUTH_TALK">YOUTH TALK</option>
                    <option value="CONFERENCE">CONFERENCE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={mediaForm.durationMinutes}
                    onChange={(e) => setMediaForm({ ...mediaForm, durationMinutes: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">Speaker / Minister</label>
                <input
                  type="text"
                  value={mediaForm.speakerMinister}
                  onChange={(e) => setMediaForm({ ...mediaForm, speakerMinister: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={mediaForm.description}
                  onChange={(e) => setMediaForm({ ...mediaForm, description: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button type="button" onClick={() => setShowMediaModal(false)} className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-lg bg-red-600 text-white font-bold">Publish to Library</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
