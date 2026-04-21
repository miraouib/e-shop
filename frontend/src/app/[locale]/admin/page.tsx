"use client";

import { useState, useEffect } from "react";
import { Package, ShoppingBag, Settings as SettingsIcon, LogOut } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslations } from 'next-intl';

export default function AdminDashboard() {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const t = useTranslations('Admin');

  // Check token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("adminToken");
    if (savedToken) setToken(savedToken);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://127.0.0.1:8000/api/login_check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("adminToken", data.token);
        setToken(data.token);
        toast.success("Connexion réussie");
      } else {
        toast.error("Identifiants incorrects");
      }
    } catch (e) {
      toast.error("Erreur de connexion au serveur");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setToken(null);
    toast.success("Déconnexion réussie");
  };

  const fetchOrders = async () => {
    if (!token) return;
    try {
      const res = await fetch("http://127.0.0.1:8000/api/orders", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data['hydra:member'] || data['member'] || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (token && activeTab === "orders") {
      fetchOrders();
    }
  }, [token, activeTab]);

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <form onSubmit={handleLogin} className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg border dark:border-gray-800 w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Connexion Admin</h1>
          <div className="space-y-4 mb-6">
            <input 
              type="text" 
              placeholder="Nom d'utilisateur (ex: admin)" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:border-primary outline-none"
              required
            />
            <input 
              type="password" 
              placeholder="Mot de passe" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:border-primary outline-none"
              required
            />
          </div>
          <button type="submit" className="w-full bg-primary text-white font-bold p-3 rounded-lg">
            Se connecter
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 py-8">
      {/* Menu Latéral */}
      <div className="w-full md:w-64 space-y-2">
        <button 
          onClick={() => setActiveTab("orders")}
          className={`w-full flex items-center gap-3 p-4 rounded-xl font-medium transition-colors ${activeTab === "orders" ? "bg-primary text-white" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
        >
          <ShoppingBag size={20} /> {t('orders')}
        </button>
        <button 
          onClick={() => setActiveTab("products")}
          className={`w-full flex items-center gap-3 p-4 rounded-xl font-medium transition-colors ${activeTab === "products" ? "bg-primary text-white" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
        >
          <Package size={20} /> {t('products')}
        </button>
        <button 
          onClick={() => setActiveTab("settings")}
          className={`w-full flex items-center gap-3 p-4 rounded-xl font-medium transition-colors ${activeTab === "settings" ? "bg-primary text-white" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
        >
          <SettingsIcon size={20} /> {t('settings')}
        </button>
        <div className="pt-4 mt-4 border-t">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-4 rounded-xl font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut size={20} /> {t('logout')}
          </button>
        </div>
      </div>

      {/* Contenu */}
      <div className="flex-1 bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border dark:border-gray-800">
        {activeTab === "orders" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">{t('orders')}</h2>
            {orders.length === 0 ? (
               <p className="text-gray-500">{t('no_orders')}</p>
            ) : (
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead>
                     <tr className="border-b dark:border-gray-800">
                       <th className="p-3">{t('id')}</th>
                       <th className="p-3">{t('client')}</th>
                       <th className="p-3">{t('total')}</th>
                       <th className="p-3">{t('status')}</th>
                     </tr>
                   </thead>
                   <tbody>
                     {orders.map((order: any) => (
                       <tr key={order.id} className="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                         <td className="p-3">#{order.id}</td>
                         <td className="p-3">{order.customerName}</td>
                         <td className="p-3 font-bold text-primary">{order.totalPrice} DT</td>
                         <td className="p-3">
                           <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-bold">
                             {order.status}
                           </span>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            )}
          </div>
        )}
        
        {activeTab === "products" && (
           <div>
             <h2 className="text-2xl font-bold mb-6">{t('products')}</h2>
             <p className="text-gray-500">Intégration multilingue à venir.</p>
           </div>
        )}

        {activeTab === "settings" && (
           <div>
             <h2 className="text-2xl font-bold mb-6">{t('settings')}</h2>
             <p className="text-gray-500">Thème global et paramètres.</p>
           </div>
        )}
      </div>
    </div>
  );
}
