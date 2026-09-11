import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit2, Search, Database } from 'lucide-react';
import adminService from '../../../services/adminService';
import { PageLoader } from '../../../components/common/Loader';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Alert from '../../../components/common/Alert';

export default function AdminFoodDatabase() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchFoods = async () => {
    setLoading(true);
    try {
      const data = await adminService.getFoods(0, 100);
      setFoods(data);
    } catch (err) {
      setError('Failed to fetch food database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this food item?')) return;
    try {
      await adminService.deleteFood(id);
      setSuccess('Food item deleted.');
      setFoods(foods.filter(f => f.id !== id));
    } catch (err) {
      setError('Failed to delete food.');
    }
  };

  const filteredFoods = foods.filter(f => 
    f.food_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.category && f.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full text-[#0a192f]">
      <div className="glass-card p-6 sm:p-8 rounded-3xl bg-white/95 border border-sky-200/90 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-4xl font-black text-[#0a192f] tracking-tight">Food Database</h1>
            <p className="text-slate-600 text-sm font-semibold mt-0.5">Manage nutritional datasets, calories, and macronutrient items.</p>
          </div>
        </div>
        <Button icon={Plus} size="lg">Add Food Item</Button>
      </div>

      <Alert type="error" message={error} show={!!error} onClose={() => setError('')} />
      <Alert type="success" message={success} show={!!success} onClose={() => setSuccess('')} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 sm:p-8 rounded-3xl bg-white/95 border border-slate-200 shadow-md space-y-6 overflow-hidden"
      >
        <div className="max-w-md">
          <Input 
            icon={Search} 
            placeholder="Search by food name or category..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto custom-scrollbar -mx-6 px-6 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[640px] text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-black uppercase text-[11px] tracking-wider border-b border-slate-200">
                <th className="py-3 px-4 rounded-l-xl">Food Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Diet Type</th>
                <th className="py-3 px-4 text-right">Calories</th>
                <th className="py-3 px-4 text-right rounded-r-xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFoods.slice(0, 50).map((food) => (
                <tr key={food.id} className="hover:bg-sky-50/50 transition-colors">
                  <td className="py-4 px-4 text-[#0a192f] font-black">{food.food_name}</td>
                  <td className="py-4 px-4 text-slate-600 font-semibold">{food.category || 'N/A'}</td>
                  <td className="py-4 px-4 text-slate-600 font-semibold">
                    <span className="px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-100 text-[#0284c7] font-bold text-xs">
                      {food.diet_type || 'General'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-[#0a192f] font-black text-right">{food.energy_kcal?.toFixed(1)} kcal</td>
                  <td className="py-4 px-4 text-right space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="!px-3"
                      onClick={() => alert('Edit feature coming soon!')}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm" 
                      onClick={() => handleDelete(food.id)}
                      className="!px-3"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredFoods.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500 font-semibold">No food items found matching filter.</td>
                </tr>
              )}
            </tbody>
          </table>
          <p className="text-center text-xs text-slate-500 font-semibold mt-4">Showing top 50 results.</p>
        </div>
      </motion.div>
    </div>
  );
}
