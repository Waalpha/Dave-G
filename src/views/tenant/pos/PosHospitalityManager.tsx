import React, { useState } from 'react';
import { 
  UtensilsCrossed, Wine, Hotel, Users, Plus, 
  ChefHat, CheckCircle2, Clock, AlertCircle, 
  DoorClosed, BedDouble, RefreshCw, X, DollarSign
} from 'lucide-react';
import { 
  RestaurantTable, KitchenTicket, BarTab, 
  HotelRoom, HotelRoomType, HotelGuest, HotelReservation, 
  PosTenantConfig, PosProduct 
} from '../../../types';

interface PosHospitalityManagerProps {
  tables: RestaurantTable[];
  kitchenTickets: KitchenTicket[];
  barTabs: BarTab[];
  roomTypes: HotelRoomType[];
  hotelRooms: HotelRoom[];
  hotelGuests: HotelGuest[];
  reservations: HotelReservation[];
  products: PosProduct[];
  config: PosTenantConfig | null;
  currencySymbol: string;
  onUpdateTableStatus: (tableId: string, status: RestaurantTable['status'], guestCount?: number) => Promise<void>;
  onAddTable: (data: any) => Promise<void>;
  onUpdateKitchenTicketStatus: (ticketId: string, status: KitchenTicket['status']) => Promise<void>;
  onOpenBarTab: (data: any) => Promise<void>;
  onCloseBarTab: (tabId: string) => Promise<void>;
  onAddRoom: (data: any) => Promise<void>;
  onAddRoomType: (data: any) => Promise<void>;
  onCreateReservation: (data: any) => Promise<void>;
  onCheckInGuest: (reservationId: string) => Promise<void>;
  onCheckOutGuest: (reservationId: string, finalPayment?: number) => Promise<void>;
  onAddFolioCharge: (reservationId: string, charge: any) => Promise<void>;
  onRefresh: () => void;
}

export const PosHospitalityManager: React.FC<PosHospitalityManagerProps> = ({
  tables,
  kitchenTickets,
  barTabs,
  roomTypes,
  hotelRooms,
  hotelGuests,
  reservations,
  products,
  config,
  currencySymbol,
  onUpdateTableStatus,
  onAddTable,
  onUpdateKitchenTicketStatus,
  onOpenBarTab,
  onCloseBarTab,
  onAddRoom,
  onAddRoomType,
  onCreateReservation,
  onCheckInGuest,
  onCheckOutGuest,
  onAddFolioCharge,
  onRefresh
}) => {
  const enabled = config?.enabledFeatures || {
    restaurantTables: true,
    kitchenTickets: true,
    barTabs: true,
    hotelRooms: true
  };

  const getInitialTab = () => {
    if (enabled.restaurantTables) return 'tables';
    if (enabled.kitchenTickets) return 'kds';
    if (enabled.barTabs) return 'tabs';
    if (enabled.hotelRooms) return 'hotel';
    return 'tables';
  };

  const [activeTab, setActiveTab] = useState<'tables' | 'kds' | 'tabs' | 'hotel'>(getInitialTab());

  // Table modal
  const [showAddTableModal, setShowAddTableModal] = useState(false);
  const [tableForm, setTableForm] = useState({
    tableNumber: `T-${tables.length + 1}`,
    name: `Table ${tables.length + 1}`,
    section: 'MAIN_DINING' as const,
    capacity: 4,
    status: 'AVAILABLE' as const
  });

  // Bar Tab Modal
  const [showAddTabModal, setShowAddTabModal] = useState(false);
  const [tabForm, setTabForm] = useState({
    customerName: '',
    customerPhone: '',
    tableNumber: ''
  });

  // Hotel Modal
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [showFolioChargeModal, setShowFolioChargeModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<HotelReservation | null>(null);

  const [reservationForm, setReservationForm] = useState({
    roomId: hotelRooms[0]?.id || '',
    guestName: '',
    guestPhone: '',
    guestEmail: '',
    guestNationalId: '',
    checkInDate: new Date().toISOString().split('T')[0],
    checkOutDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    depositPaid: 0,
    paymentMethod: 'MPESA' as const,
    autoCheckIn: true
  });

  const [folioForm, setFolioForm] = useState({
    category: 'RESTAURANT' as 'ROOM_SERVICE' | 'RESTAURANT' | 'BAR' | 'LAUNDRY' | 'SPA' | 'OTHER',
    description: 'Dinner & Beverages',
    amount: 1500
  });

  const [roomForm, setRoomForm] = useState({
    roomNumber: `${101 + hotelRooms.length}`,
    floor: '1st Floor',
    roomTypeId: roomTypes[0]?.id || '',
    status: 'AVAILABLE' as const
  });

  const handleSaveTable = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddTable(tableForm);
    setShowAddTableModal(false);
  };

  const handleSaveTab = async (e: React.FormEvent) => {
    e.preventDefault();
    await onOpenBarTab(tabForm);
    setShowAddTabModal(false);
    setTabForm({ customerName: '', customerPhone: '', tableNumber: '' });
  };

  const handleSaveReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    const room = hotelRooms.find(r => r.id === reservationForm.roomId);
    if (!room) {
      alert('Please select a room');
      return;
    }
    const rType = roomTypes.find(rt => rt.id === room.roomTypeId);
    await onCreateReservation({
      roomId: room.id,
      roomNumber: room.roomNumber,
      roomTypeId: room.roomTypeId,
      roomTypeName: rType?.name || 'Standard Room',
      guestName: reservationForm.guestName,
      guestPhone: reservationForm.guestPhone,
      guestEmail: reservationForm.guestEmail,
      guestNationalId: reservationForm.guestNationalId,
      checkInDate: reservationForm.checkInDate,
      checkOutDate: reservationForm.checkOutDate,
      ratePerNight: rType?.basePricePerNight || 3500,
      amountPaid: Number(reservationForm.depositPaid || 0),
      status: reservationForm.autoCheckIn ? 'CHECKED_IN' : 'CONFIRMED'
    });
    setShowReservationModal(false);
  };

  const handleSaveFolioCharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReservation) return;
    await onAddFolioCharge(selectedReservation.id, folioForm);
    setShowFolioChargeModal(false);
  };

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const rt = roomTypes.find(t => t.id === roomForm.roomTypeId);
    await onAddRoom({
      ...roomForm,
      roomTypeName: rt?.name || 'Standard Room'
    });
    setShowAddRoomModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-indigo-600" />
            Hospitality, Restaurant, Bar & Hotel Operations
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Real-time dine-in table floors, Kitchen Display System (KDS), open customer bar tabs, and hotel lodging check-ins with room folio billing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            className="p-2.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto">
        {enabled.restaurantTables && (
          <button
            onClick={() => setActiveTab('tables')}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'tables'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Dining Tables ({tables.length})</span>
          </button>
        )}

        {enabled.kitchenTickets && (
          <button
            onClick={() => setActiveTab('kds')}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'kds'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ChefHat className="w-4 h-4" />
            <span>Kitchen Display System (KDS) ({kitchenTickets.filter(k => k.status !== 'SERVED').length})</span>
          </button>
        )}

        {enabled.barTabs && (
          <button
            onClick={() => setActiveTab('tabs')}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'tabs'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wine className="w-4 h-4" />
            <span>Bar Tabs ({barTabs.filter(b => b.status === 'OPEN').length})</span>
          </button>
        )}

        {enabled.hotelRooms && (
          <button
            onClick={() => setActiveTab('hotel')}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'hotel'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Hotel className="w-4 h-4" />
            <span>Hotel Rooms & Stays ({hotelRooms.length})</span>
          </button>
        )}
      </div>

      {/* 1. RESTAURANT TABLES VIEW */}
      {activeTab === 'tables' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-900">Floor Plan & Table Status</h3>
            <button
              onClick={() => setShowAddTableModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Table</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {tables.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
                <UtensilsCrossed className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">No restaurant tables added yet</p>
                <p className="text-xs text-slate-400 mt-1">Click "Add Table" to set up your floor plan.</p>
              </div>
            ) : (
              tables.map((t) => {
                const isOccupied = t.status === 'OCCUPIED';
                const isAvailable = t.status === 'AVAILABLE';
                const isBilling = t.status === 'BILLING';
                const isReserved = t.status === 'RESERVED';

                return (
                  <div
                    key={t.id}
                    className={`p-4 rounded-xl border-2 transition-all bg-white shadow-sm flex flex-col justify-between ${
                      isOccupied
                        ? 'border-amber-400 bg-amber-50/20'
                        : isBilling
                        ? 'border-blue-400 bg-blue-50/20'
                        : isReserved
                        ? 'border-purple-400 bg-purple-50/20'
                        : 'border-emerald-400 bg-emerald-50/20'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono font-bold text-base text-slate-900">{t.tableNumber}</span>
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                            isOccupied
                              ? 'bg-amber-100 text-amber-800'
                              : isBilling
                              ? 'bg-blue-100 text-blue-800'
                              : isReserved
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>

                      <h4 className="font-semibold text-slate-800 text-sm">{t.name}</h4>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                        <span>Section: {t.section}</span>
                        <span>•</span>
                        <span>Capacity: {t.capacity} seats</span>
                      </div>
                      {isOccupied && t.guestCount && (
                        <div className="text-xs text-amber-700 font-semibold mt-2">
                          Seated Guests: {t.guestCount}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-1">
                      {isAvailable ? (
                        <button
                          onClick={() => onUpdateTableStatus(t.id, 'OCCUPIED', 2)}
                          className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-semibold"
                        >
                          Seat Guests
                        </button>
                      ) : isOccupied ? (
                        <div className="flex w-full gap-1">
                          <button
                            onClick={() => onUpdateTableStatus(t.id, 'BILLING')}
                            className="flex-1 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold"
                          >
                            Print Bill
                          </button>
                          <button
                            onClick={() => onUpdateTableStatus(t.id, 'AVAILABLE')}
                            className="flex-1 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold"
                          >
                            Free Table
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => onUpdateTableStatus(t.id, 'AVAILABLE')}
                          className="w-full py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-semibold"
                        >
                          Mark Available
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 2. KITCHEN DISPLAY SYSTEM (KDS) */}
      {activeTab === 'kds' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-900">Active Kitchen Orders</h3>
            <span className="text-xs text-slate-500">Real-time chef preparation queue</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {kitchenTickets.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
                <ChefHat className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">No active kitchen orders</p>
                <p className="text-xs text-slate-400 mt-1">Orders sent from the POS terminal will appear here live.</p>
              </div>
            ) : (
              kitchenTickets.map((ticket) => {
                const isPending = ticket.status === 'PENDING';
                const isPreparing = ticket.status === 'PREPARING';
                const isReady = ticket.status === 'READY';
                const isServed = ticket.status === 'SERVED';

                return (
                  <div
                    key={ticket.id}
                    className={`p-4 rounded-xl border shadow-sm bg-white flex flex-col justify-between ${
                      isPending
                        ? 'border-rose-300 ring-2 ring-rose-500/20'
                        : isPreparing
                        ? 'border-amber-300 ring-2 ring-amber-500/20'
                        : isReady
                        ? 'border-emerald-300 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                        <div>
                          <span className="font-bold text-slate-900 font-mono text-sm">
                            {ticket.ticketNumber}
                          </span>
                          <span className="ml-2 text-xs font-semibold px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                            {ticket.tableNumber || 'Takeaway'}
                          </span>
                        </div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          isPending ? 'bg-rose-100 text-rose-700' :
                          isPreparing ? 'bg-amber-100 text-amber-700' :
                          isReady ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {ticket.status}
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        {ticket.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-start text-sm">
                            <div>
                              <span className="font-bold text-slate-900 mr-2">{item.quantity}x</span>
                              <span className="text-slate-800">{item.name}</span>
                              {item.notes && <div className="text-xs text-rose-600 font-medium">Note: {item.notes}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>Server: {ticket.serverName || 'Staff'}</span>
                      <div className="flex gap-1">
                        {isPending && (
                          <button
                            onClick={() => onUpdateKitchenTicketStatus(ticket.id, 'PREPARING')}
                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded font-semibold"
                          >
                            Start Cooking
                          </button>
                        )}
                        {isPreparing && (
                          <button
                            onClick={() => onUpdateKitchenTicketStatus(ticket.id, 'READY')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold"
                          >
                            Mark Ready
                          </button>
                        )}
                        {isReady && (
                          <button
                            onClick={() => onUpdateKitchenTicketStatus(ticket.id, 'SERVED')}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded font-semibold"
                          >
                            Served
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 3. BAR TABS */}
      {activeTab === 'tabs' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-900">Active Customer Bar Tabs</h3>
            <button
              onClick={() => setShowAddTabModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Open New Tab</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {barTabs.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
                <Wine className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">No open bar tabs</p>
                <p className="text-xs text-slate-400 mt-1">Click "Open New Tab" to start a running drink tab.</p>
              </div>
            ) : (
              barTabs.map((tab) => (
                <div key={tab.id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-indigo-700 font-mono">{tab.tabNumber}</span>
                    <span className={`px-2 py-0.5 text-xs rounded-full font-bold ${
                      tab.status === 'OPEN' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {tab.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900">{tab.customerName}</h4>
                  <div className="text-xs text-slate-500">
                    {tab.tableNumber && <span>Table: {tab.tableNumber} • </span>}
                    <span>Opened: {new Date(tab.openedAt).toLocaleTimeString()}</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg text-xs space-y-1">
                    {tab.items.length === 0 ? (
                      <span className="text-slate-400">No drinks charged yet</span>
                    ) : (
                      tab.items.map((i, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{i.quantity}x {i.productName}</span>
                          <span className="font-semibold">{currencySymbol} {i.total}</span>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                    <div className="font-black text-slate-900 text-base">
                      {currencySymbol} {Number(tab.total || 0).toLocaleString()}
                    </div>
                    {tab.status === 'OPEN' && (
                      <button
                        onClick={() => onCloseBarTab(tab.id)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
                      >
                        Close & Settle Tab
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 4. HOTEL ROOMS & FOLIO BILLING */}
      {activeTab === 'hotel' && (
        <div className="space-y-6">
          {/* Header Controls */}
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-900">Hotel Rooms & Guest Stay Ledger</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddRoomModal(true)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-sm font-semibold"
              >
                + Add Room
              </button>
              <button
                onClick={() => setShowReservationModal(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Check-In Guest</span>
              </button>
            </div>
          </div>

          {/* Rooms Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {hotelRooms.length === 0 ? (
              <div className="col-span-full py-8 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
                No hotel rooms created. Click "+ Add Room" to set up rooms.
              </div>
            ) : (
              hotelRooms.map((room) => {
                const isOccupied = room.status === 'OCCUPIED';
                const isAvailable = room.status === 'AVAILABLE';
                const isCleaning = room.status === 'CLEANING';

                return (
                  <div
                    key={room.id}
                    className={`p-3.5 rounded-xl border-2 bg-white text-center flex flex-col justify-between ${
                      isOccupied
                        ? 'border-rose-400 bg-rose-50/30'
                        : isCleaning
                        ? 'border-amber-400 bg-amber-50/30'
                        : 'border-emerald-400 bg-emerald-50/30'
                    }`}
                  >
                    <div>
                      <div className="font-black text-lg text-slate-900 font-mono">
                        {room.roomNumber}
                      </div>
                      <div className="text-xs text-slate-600 font-medium">{room.roomTypeName}</div>
                      <div className="text-[11px] text-slate-400">{room.floor}</div>
                    </div>

                    <div className="mt-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        isOccupied ? 'bg-rose-100 text-rose-700' :
                        isCleaning ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {room.status}
                      </span>
                      {room.currentGuestName && (
                        <div className="text-[11px] font-semibold text-slate-800 truncate mt-1">
                          {room.currentGuestName}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Active Guest Stays Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-3 p-4">
            <h4 className="font-bold text-slate-900 text-sm">Active Guest Stays & Room Folio Billing</h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-3 px-3">Room</th>
                    <th className="py-3 px-3">Guest Details</th>
                    <th className="py-3 px-3">Check-In / Out</th>
                    <th className="py-3 px-3 text-right">Folio Total</th>
                    <th className="py-3 px-3 text-right">Amount Paid</th>
                    <th className="py-3 px-3 text-right">Balance Due</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reservations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No guest stays recorded yet.
                      </td>
                    </tr>
                  ) : (
                    reservations.map((rsv) => {
                      const isCheckedIn = rsv.status === 'CHECKED_IN';
                      return (
                        <tr key={rsv.id} className="hover:bg-slate-50">
                          <td className="py-3 px-3 font-mono font-bold text-indigo-700">
                            Room {rsv.roomNumber}
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-semibold text-slate-900">{rsv.guestName}</div>
                            <div className="text-xs text-slate-500">{rsv.guestPhone}</div>
                          </td>
                          <td className="py-3 px-3 text-xs text-slate-600">
                            <div>In: {rsv.checkInDate}</div>
                            <div>Out: {rsv.checkOutDate}</div>
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-slate-900">
                            {currencySymbol} {Number(rsv.totalBill || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-right font-medium text-emerald-600">
                            {currencySymbol} {Number(rsv.amountPaid || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-rose-600">
                            {currencySymbol} {Number(rsv.balance || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {isCheckedIn && (
                                <>
                                  <button
                                    onClick={() => {
                                      setSelectedReservation(rsv);
                                      setShowFolioChargeModal(true);
                                    }}
                                    className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded text-xs font-semibold"
                                  >
                                    + Charge Room
                                  </button>
                                  <button
                                    onClick={() => onCheckOutGuest(rsv.id, rsv.balance)}
                                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold"
                                  >
                                    Check-Out
                                  </button>
                                </>
                              )}
                              {rsv.status === 'CONFIRMED' && (
                                <button
                                  onClick={() => onCheckInGuest(rsv.id)}
                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold"
                                >
                                  Check-In
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CHECK-IN RESERVATION MODAL */}
      {showReservationModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Check-In / Book Hotel Guest</h3>
              <button onClick={() => setShowReservationModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReservation} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Room *
                </label>
                <select
                  value={reservationForm.roomId}
                  onChange={(e) => setReservationForm({ ...reservationForm, roomId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  {hotelRooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      Room {r.roomNumber} ({r.roomTypeName}) - {r.status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Guest Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={reservationForm.guestName}
                  onChange={(e) => setReservationForm({ ...reservationForm, guestName: e.target.value })}
                  placeholder="e.g. Mary Wanjiku"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={reservationForm.guestPhone}
                    onChange={(e) => setReservationForm({ ...reservationForm, guestPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">National ID / Passport</label>
                  <input
                    type="text"
                    value={reservationForm.guestNationalId}
                    onChange={(e) => setReservationForm({ ...reservationForm, guestNationalId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Check-In Date</label>
                  <input
                    type="date"
                    value={reservationForm.checkInDate}
                    onChange={(e) => setReservationForm({ ...reservationForm, checkInDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Check-Out Date</label>
                  <input
                    type="date"
                    value={reservationForm.checkOutDate}
                    onChange={(e) => setReservationForm({ ...reservationForm, checkOutDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deposit / Advance Paid ({currencySymbol})
                </label>
                <input
                  type="number"
                  min="0"
                  value={reservationForm.depositPaid}
                  onChange={(e) => setReservationForm({ ...reservationForm, depositPaid: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowReservationModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm"
                >
                  Check In & Assign Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FOLIO CHARGE MODAL */}
      {showFolioChargeModal && selectedReservation && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Charge to Room {selectedReservation.roomNumber} ({selectedReservation.guestName})
              </h3>
              <button onClick={() => setShowFolioChargeModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFolioCharge} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Charge Category
                </label>
                <select
                  value={folioForm.category}
                  onChange={(e) => setFolioForm({ ...folioForm, category: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option value="RESTAURANT">Restaurant Dining</option>
                  <option value="BAR">Bar & Drinks</option>
                  <option value="ROOM_SERVICE">Room Service</option>
                  <option value="LAUNDRY">Laundry Service</option>
                  <option value="SPA">Spa & Wellness</option>
                  <option value="OTHER">Other Services</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Item Description
                </label>
                <input
                  type="text"
                  required
                  value={folioForm.description}
                  onChange={(e) => setFolioForm({ ...folioForm, description: e.target.value })}
                  placeholder="e.g. Steak Dinner + 2 Beers"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Amount to Charge ({currencySymbol}) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={folioForm.amount}
                  onChange={(e) => setFolioForm({ ...folioForm, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowFolioChargeModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm"
                >
                  Add Charge to Room Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD ROOM MODAL */}
      {showAddRoomModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add Hotel Room</h3>
              <button onClick={() => setShowAddRoomModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRoom} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Room Number / Name *
                </label>
                <input
                  type="text"
                  required
                  value={roomForm.roomNumber}
                  onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
                  placeholder="e.g. 101 / Suite A"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Floor
                </label>
                <input
                  type="text"
                  value={roomForm.floor}
                  onChange={(e) => setRoomForm({ ...roomForm, floor: e.target.value })}
                  placeholder="e.g. 1st Floor"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Room Type *
                </label>
                <select
                  value={roomForm.roomTypeId}
                  onChange={(e) => setRoomForm({ ...roomForm, roomTypeId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  {roomTypes.map((rt) => (
                    <option key={rt.id} value={rt.id}>
                      {rt.name} ({currencySymbol} {rt.basePricePerNight}/night)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddRoomModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm"
                >
                  Save Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD TABLE MODAL */}
      {showAddTableModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add Dining Table</h3>
              <button onClick={() => setShowAddTableModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTable} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Table Number *</label>
                <input
                  type="text"
                  required
                  value={tableForm.tableNumber}
                  onChange={(e) => setTableForm({ ...tableForm, tableNumber: e.target.value })}
                  placeholder="e.g. T-1 / Patio 4"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Table Name</label>
                <input
                  type="text"
                  value={tableForm.name}
                  onChange={(e) => setTableForm({ ...tableForm, name: e.target.value })}
                  placeholder="e.g. Window Booth"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Section</label>
                  <select
                    value={tableForm.section}
                    onChange={(e) => setTableForm({ ...tableForm, section: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    <option value="MAIN_DINING">Main Dining</option>
                    <option value="TERRACE">Terrace / Balcony</option>
                    <option value="VIP_LOUNGE">VIP Lounge</option>
                    <option value="BAR_COUNTER">Bar Counter</option>
                    <option value="GARDEN">Garden</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Capacity (Seats)</label>
                  <input
                    type="number"
                    min="1"
                    value={tableForm.capacity}
                    onChange={(e) => setTableForm({ ...tableForm, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddTableModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm"
                >
                  Save Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OPEN TAB MODAL */}
      {showAddTabModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Open Customer Bar Tab</h3>
              <button onClick={() => setShowAddTabModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTab} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Customer / Group Name *</label>
                <input
                  type="text"
                  required
                  value={tabForm.customerName}
                  onChange={(e) => setTabForm({ ...tabForm, customerName: e.target.value })}
                  placeholder="e.g. Alex & Friends"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={tabForm.customerPhone}
                    onChange={(e) => setTabForm({ ...tabForm, customerPhone: e.target.value })}
                    placeholder="0700 000 000"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Table / Counter #</label>
                  <input
                    type="text"
                    value={tabForm.tableNumber}
                    onChange={(e) => setTabForm({ ...tabForm, tableNumber: e.target.value })}
                    placeholder="e.g. Bar Seat 3"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddTabModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm"
                >
                  Open Bar Tab
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
