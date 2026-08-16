import React, { useState, useEffect } from 'react';
import { 
  Wine, UtensilsCrossed, Plus, CheckCircle2, Clock, 
  Users, RefreshCw, DollarSign, ChefHat, LayoutGrid
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { RestaurantTable, RestaurantMenuItem } from '../../../types';

export const RestaurantBarDashboard: React.FC = () => {
  const { currentTenant, token } = useAuth();
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [menu, setMenu] = useState<RestaurantMenuItem[]>([]);
  const [activeTab, setActiveTab] = useState<'tables' | 'menu'>('tables');
  const [selectedSection, setSelectedSection] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [menuForm, setMenuForm] = useState({
    name: '',
    category: 'MAIN_DISHES' as const,
    price: 650,
    costPrice: 350,
    isAvailable: true,
    preparationTimeMinutes: 15,
    portionSize: 'Standard'
  });

  const currencySymbol = currentTenant?.branding?.currencySymbol || 'KES';
  const authHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const fetchTablesAndMenu = async () => {
    setLoading(true);
    try {
      const [tblRes, mnuRes] = await Promise.all([
        fetch('/api/app/bar/tables', { headers: authHeaders }),
        fetch('/api/app/bar/menu', { headers: authHeaders })
      ]);
      if (tblRes.ok) {
        const d = await tblRes.json();
        setTables(d.tables || []);
      }
      if (mnuRes.ok) {
        const m = await mnuRes.json();
        setMenu(m.menu || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTablesAndMenu();
  }, [currentTenant?.id]);

  const updateTableStatus = async (tableId: string, status: RestaurantTable['status'], guestCount?: number) => {
    try {
      const res = await fetch(`/api/app/bar/tables/${tableId}/status`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ status, guestCount })
      });
      if (res.ok) fetchTablesAndMenu();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/app/bar/menu', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(menuForm)
      });
      if (res.ok) {
        setShowAddMenuModal(false);
        fetchTablesAndMenu();
        setMenuForm({
          name: '',
          category: 'MAIN_DISHES',
          price: 650,
          costPrice: 350,
          isAvailable: true,
          preparationTimeMinutes: 15,
          portionSize: 'Standard'
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bar & Restaurant Management</h1>
          <p className="text-sm text-gray-500 mt-1">Live table seating, beverage dispensary, food menu & tabs</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddMenuModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Menu / Drink Item</span>
          </button>
          <button
            onClick={fetchTablesAndMenu}
            className="p-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white px-6 rounded-t-xl">
        <button
          onClick={() => setActiveTab('tables')}
          className={`flex items-center gap-2 py-4 px-4 text-sm font-medium border-b-2 transition ${
            activeTab === 'tables' ? 'border-amber-600 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Floor & Table Grid ({tables.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('menu')}
          className={`flex items-center gap-2 py-4 px-4 text-sm font-medium border-b-2 transition ${
            activeTab === 'menu' ? 'border-amber-600 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <UtensilsCrossed className="w-4 h-4" />
          <span>Menu & Drinks Inventory ({menu.length})</span>
        </button>
      </div>

      {/* TABLES VIEW */}
      {activeTab === 'tables' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {tables.map(table => {
            const isOcc = table.status === 'OCCUPIED';
            const isBill = table.status === 'BILLING';
            return (
              <div
                key={table.id}
                className={`p-5 rounded-xl border transition flex flex-col justify-between ${
                  isOcc ? 'bg-amber-50 border-amber-300 shadow-sm' :
                  isBill ? 'bg-purple-50 border-purple-300' :
                  'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-lg text-gray-900">{table.tableNumber}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      isOcc ? 'bg-amber-200 text-amber-900' :
                      isBill ? 'bg-purple-200 text-purple-900' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {table.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{table.section} • Cap: {table.capacity} seats</p>
                  {isOcc && (
                    <div className="mt-3 p-2 bg-amber-100/60 rounded text-xs text-amber-900 font-medium">
                      Guests: {table.guestCount || 2} • Order active
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-200/60 flex gap-2">
                  {!isOcc ? (
                    <button
                      onClick={() => updateTableStatus(table.id, 'OCCUPIED', 2)}
                      className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded transition"
                    >
                      Seat Guests
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => updateTableStatus(table.id, 'BILLING')}
                        className="flex-1 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded transition"
                      >
                        Bill
                      </button>
                      <button
                        onClick={() => updateTableStatus(table.id, 'AVAILABLE', 0)}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded transition"
                      >
                        Free Table
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MENU VIEW */}
      {activeTab === 'menu' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b">
              <tr>
                <th className="px-6 py-3">Item Name</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Portion Size</th>
                <th className="px-6 py-3">Selling Price</th>
                <th className="px-6 py-3">Cost Price</th>
                <th className="px-6 py-3">Prep Time</th>
                <th className="px-6 py-3">Availability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {menu.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 text-xs font-medium text-amber-700">{item.category}</td>
                  <td className="px-6 py-4 text-xs">{item.portionSize || 'Single'}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">{currencySymbol} {item.price.toLocaleString()}</td>
                  <td className="px-6 py-4 text-xs text-gray-400">{currencySymbol} {item.costPrice.toLocaleString()}</td>
                  <td className="px-6 py-4 text-xs text-gray-600">{item.preparationTimeMinutes} mins</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full">
                      Available
                    </span>
                  </td>
                </tr>
              ))}
              {menu.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No menu items added. Click "Add Menu / Drink Item" above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ADD MENU MODAL */}
      {showAddMenuModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Add Menu or Drink Item</h3>
            <form onSubmit={handleAddMenuItem} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nyama Choma 1kg / Tusker Cider"
                  value={menuForm.name}
                  onChange={e => setMenuForm({ ...menuForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Category</label>
                  <select
                    value={menuForm.category}
                    onChange={e => setMenuForm({ ...menuForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg text-sm mt-1"
                  >
                    <option value="MAIN_DISHES">Main Dishes & Grilled</option>
                    <option value="APPETIZERS">Appetizers & Starters</option>
                    <option value="ALCOHOL_BEER">Beers & Ciders</option>
                    <option value="WINES_SPIRITS">Wines & Spirits</option>
                    <option value="BEVERAGES_SOFT">Soft Drinks & Juices</option>
                    <option value="DESSERTS">Desserts</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Portion / Volume</label>
                  <input
                    type="text"
                    value={menuForm.portionSize}
                    onChange={e => setMenuForm({ ...menuForm, portionSize: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Menu Price ({currencySymbol})</label>
                  <input
                    type="number"
                    required
                    value={menuForm.price}
                    onChange={e => setMenuForm({ ...menuForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg text-sm mt-1 font-bold text-amber-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Prep Time (Minutes)</label>
                  <input
                    type="number"
                    value={menuForm.preparationTimeMinutes}
                    onChange={e => setMenuForm({ ...menuForm, preparationTimeMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg text-sm mt-1"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddMenuModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
