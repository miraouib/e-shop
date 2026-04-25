"use client";

import { useState, useEffect } from "react";
import { Package, ShoppingBag, Settings as SettingsIcon, LogOut, Archive } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslations } from 'next-intl';

export default function AdminDashboard() {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const [phoneFilter, setPhoneFilter] = useState("");
  const [totalItems, setTotalItems] = useState(0);
  const [products, setProducts] = useState([]);
  const [productPage, setProductPage] = useState(1);
  const [productItemsPerPage, setProductItemsPerPage] = useState(10);
  const [productTotalItems, setProductTotalItems] = useState(0);
  const [categories, setCategories] = useState([]);
  const [creationStep, setCreationStep] = useState(0); // 0: List, 1: Identity, 2: Media, 3: Pricing
  const [currentProductId, setCurrentProductId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    translations: {
      fr: { title: "", description: "" },
      en: { title: "", description: "" },
      ar: { title: "", description: "" }
    },
    categoryId: "",
    price: 0,
    isActive: true,
    images: [] as string[],
    promotions: [] as { quantityThreshold: number, discountPrice: number }[]
  });
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
      const params = new URLSearchParams({
        page: page.toString(),
        itemsPerPage: itemsPerPage.toString()
      });
      if (statusFilter) params.append("status", statusFilter);
      if (nameFilter) params.append("customerName", nameFilter);
      if (phoneFilter) params.append("phone", phoneFilter);
      params.append("isArchive", activeTab === "archives" ? "true" : "false");

      const res = await fetch(`http://127.0.0.1:8000/api/orders?${params.toString()}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data['hydra:member'] || data['member'] || []);
        setTotalItems(data['hydra:totalItems'] || data['totalItems'] || 0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProducts = async () => {
    if (!token) return;
    try {
      const params = new URLSearchParams({
        page: productPage.toString(),
        itemsPerPage: productItemsPerPage.toString()
      });

      const res = await fetch(`http://127.0.0.1:8000/api/products?${params.toString()}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data['hydra:member'] || data['member'] || []);
        setProductTotalItems(data['hydra:totalItems'] || data['totalItems'] || 0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCategories = async () => {
    if (!token) return;
    try {
      const res = await fetch("http://127.0.0.1:8000/api/categories", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(data['hydra:member'] || data['member'] || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const res = await fetch("http://127.0.0.1:8000/api/products", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({
          translations: formData.translations,
          category: `/api/categories/${formData.categoryId}`,
          price: 0,
          isActive: formData.isActive
        })
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentProductId(data.id);
        setCreationStep(2);
        toast.success("Produit créé ! Passons aux images.");
      } else {
        toast.error("Erreur lors de la création");
      }
    } catch (e) {
      toast.error("Erreur de connexion");
    }
  };

  const handleStep2 = async () => {
    setCreationStep(3);
  };

  const handleStep3 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !currentProductId) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/products/${currentProductId}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/merge-patch+json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({
          price: Number(formData.price),
          promotions: formData.promotions.map(p => ({
            quantityThreshold: Number(p.quantityThreshold),
            discountPrice: Number(p.discountPrice)
          }))
        })
      });
      if (res.ok) {
        toast.success("Produit finalisé !");
        setCreationStep(0);
        fetchProducts();
      } else {
        toast.error("Erreur lors de la finalisation");
      }
    } catch (e) {
      toast.error("Erreur de connexion");
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/merge-patch+json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        toast.success("Statut mis à jour");
        fetchOrders();
      } else {
        toast.error("Erreur lors de la mise à jour");
      }
    } catch (e) {
      toast.error("Erreur de connexion au serveur");
    }
  };

  const handleArchive = async (orderId: number) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/merge-patch+json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ isArchive: true })
      });
      if (res.ok) {
        toast.success(t('order_archived'));
        fetchOrders();
      } else {
        toast.error("Erreur lors de l'archivage");
      }
    } catch (e) {
      toast.error("Erreur de connexion au serveur");
    }
  };

  // Debounce logic to avoid spamming the API on every keystroke
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (token) {
        if (activeTab === "orders" || activeTab === "archives") {
          fetchOrders();
        } else if (activeTab === "products" && creationStep === 0) {
          fetchProducts();
          fetchCategories();
        }
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [token, activeTab, page, itemsPerPage, statusFilter, nameFilter, phoneFilter, productPage, productItemsPerPage, creationStep]);

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
          onClick={() => { setActiveTab("orders"); setPage(1); }}
          className={`w-full flex items-center gap-3 p-4 rounded-xl font-medium transition-colors ${activeTab === "orders" ? "bg-primary text-white" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
        >
          <ShoppingBag size={20} /> {t('orders')}
        </button>
        <button 
          onClick={() => { setActiveTab("archives"); setPage(1); }}
          className={`w-full flex items-center gap-3 p-4 rounded-xl font-medium transition-colors ${activeTab === "archives" ? "bg-primary text-white" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
        >
          <Archive size={20} /> {t('archives')}
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
        {(activeTab === "orders" || activeTab === "archives") && (
          <div>
            <h2 className="text-2xl font-bold mb-6">{activeTab === "archives" ? t('archives') : t('orders')}</h2>
            
            {/* Filtres */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <input
                type="text"
                placeholder="Filtrer par nom..."
                value={nameFilter}
                onChange={(e) => { setNameFilter(e.target.value); setPage(1); }}
                className="p-2 border dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg outline-none flex-1 text-sm text-gray-900 dark:text-white focus:border-primary"
              />
              <input
                type="text"
                placeholder="Filtrer par téléphone..."
                value={phoneFilter}
                onChange={(e) => { setPhoneFilter(e.target.value); setPage(1); }}
                className="p-2 border dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg outline-none flex-1 text-sm text-gray-900 dark:text-white focus:border-primary"
              />
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="p-2 border dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg outline-none flex-1 text-sm text-gray-900 dark:text-white focus:border-primary"
              >
                <option value="">{t('all_statuses')}</option>
                <option value="PENDING">{t('status_pending')}</option>
                <option value="CONTACT">{t('status_contact')}</option>
                <option value="NO_CONTACT">{t('status_no_contact')}</option>
                <option value="REFUSED">{t('status_refused')}</option>
                <option value="VALIDATED">{t('status_validated')}</option>
                <option value="DELIVERED">{t('status_delivered')}</option>
                <option value="RETURNED">{t('status_returned')}</option>
                <option value="FINALIZED">{t('status_finalized')}</option>
                <option value="SETTLED">{t('status_settled')}</option>
              </select>
            </div>

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
                       <th className="p-3 text-right">{t('actions')}</th>
                     </tr>
                   </thead>
                   <tbody>
                     {orders.map((order: any) => (
                       <tr key={order.id} className="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                         <td className="p-3">#{order.id}</td>
                         <td className="p-3">{order.customerName}</td>
                         <td className="p-3 font-bold text-primary">{order.totalPrice} DT</td>
                         <td className="p-3">
                           <select 
                             value={order.status}
                             onChange={(e) => handleStatusChange(order.id, e.target.value)}
                             className={`text-xs px-2 py-1 rounded-full font-bold outline-none cursor-pointer ${
                               order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                               order.status === 'CONTACT' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                               order.status === 'NO_CONTACT' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                               order.status === 'REFUSED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                               order.status === 'VALIDATED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                               order.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
                               order.status === 'RETURNED' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                               order.status === 'FINALIZED' ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400' :
                               order.status === 'SETTLED' ? 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400' :
                               'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                             }`}
                           >
                             <option value="PENDING" className="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">{t('status_pending')}</option>
                             <option value="CONTACT" className="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">{t('status_contact')}</option>
                             <option value="NO_CONTACT" className="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">{t('status_no_contact')}</option>
                             <option value="REFUSED" className="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">{t('status_refused')}</option>
                             <option value="VALIDATED" className="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">{t('status_validated')}</option>
                             <option value="DELIVERED" className="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">{t('status_delivered')}</option>
                             <option value="RETURNED" className="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">{t('status_returned')}</option>
                             <option value="FINALIZED" className="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">{t('status_finalized')}</option>
                             <option value="SETTLED" className="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">{t('status_settled')}</option>
                           </select>
                         </td>
                         <td className="p-3 text-right">
                           {activeTab === 'orders' && order.status === 'SETTLED' && (
                             <button 
                               onClick={() => handleArchive(order.id)}
                               className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-xs px-3 py-1 rounded-lg font-bold transition-colors"
                             >
                               {t('archive')}
                             </button>
                           )}
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            )}
            
            {/* Pagination */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{t('items_per_page')}:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => { setItemsPerPage(Number(e.target.value)); setPage(1); }}
                  className="p-1 border dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg outline-none text-sm text-gray-900 dark:text-white focus:border-primary"
                >
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                  {t('previous')}
                </button>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('page_info', { current: page, total: Math.max(1, Math.ceil(totalItems / itemsPerPage)) })}
                </span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page * itemsPerPage >= totalItems}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                  {t('next')}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === "products" && (
           <div>
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{t('products')}</h2>
                {creationStep === 0 && (
                  <button 
                    onClick={() => setCreationStep(1)}
                    className="bg-primary text-white px-4 py-2 rounded-lg font-bold hover:opacity-90 transition"
                  >
                    + Ajouter
                  </button>
                )}
             </div>
             
             {creationStep === 0 && (
               <>
                 {products.length === 0 ? (
                    <p className="text-gray-500">{t('no_products')}</p>
                 ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b dark:border-gray-800">
                            <th className="p-3">{t('id')}</th>
                            <th className="p-3">{t('product_name')}</th>
                            <th className="p-3">{t('product_category')}</th>
                            <th className="p-3">{t('product_price')}</th>
                            <th className="p-3">{t('product_status')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map((product: any) => (
                            <tr key={product.id} className="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                              <td className="p-3">#{product.id}</td>
                              <td className="p-3 font-medium">{product.translations?.fr?.title || 'N/A'}</td>
                              <td className="p-3 text-sm text-gray-500">{product.category?.name || 'N/A'}</td>
                              <td className="p-3 font-bold text-primary">{product.price} DT</td>
                              <td className="p-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${product.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                                  {product.isActive ? 'Actif' : 'Inactif'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Pagination Produits */}
                      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">{t('items_per_page')}:</span>
                          <select
                            value={productItemsPerPage}
                            onChange={(e) => { setProductItemsPerPage(Number(e.target.value)); setProductPage(1); }}
                            className="p-1 border dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg outline-none text-sm text-gray-900 dark:text-white focus:border-primary"
                          >
                            <option value={10}>10</option>
                            <option value={15}>15</option>
                            <option value={20}>20</option>
                          </select>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setProductPage(p => Math.max(1, p - 1))}
                            disabled={productPage === 1}
                            className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                          >
                            {t('previous')}
                          </button>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('page_info', { current: productPage, total: Math.max(1, Math.ceil(productTotalItems / productItemsPerPage)) })}
                          </span>
                          <button
                            onClick={() => setProductPage(p => p + 1)}
                            disabled={productPage * productItemsPerPage >= productTotalItems}
                            className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                          >
                            {t('next')}
                          </button>
                        </div>
                      </div>
                    </div>
                 )}
               </>
             )}

             {creationStep === 1 && (
               <form onSubmit={handleStep1} className="max-w-4xl space-y-6">
                 <div className="flex items-center gap-4 text-sm font-bold text-primary mb-4">
                   <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">1</span>
                   <span>Identité du produit</span>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   {['fr', 'en', 'ar'].map(lang => (
                     <div key={lang} className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border dark:border-gray-800">
                       <label className="text-sm font-bold uppercase block border-b pb-2 dark:border-gray-700">{lang}</label>
                       <div className="space-y-2">
                         <label className="text-xs text-gray-500">Titre {lang === 'fr' && '*'}</label>
                         <input 
                           type="text" 
                           required={lang === 'fr'}
                           value={(formData.translations as any)[lang].title}
                           onChange={(e) => setFormData({...formData, translations: {...formData.translations, [lang]: {...(formData.translations as any)[lang], title: e.target.value}}})}
                           className="w-full p-2 border dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg outline-none focus:border-primary"
                         />
                       </div>
                       <div className="space-y-2">
                         <label className="text-xs text-gray-500">Description</label>
                         <textarea 
                           rows={4}
                           value={(formData.translations as any)[lang].description}
                           onChange={(e) => setFormData({...formData, translations: {...formData.translations, [lang]: {...(formData.translations as any)[lang], description: e.target.value}}})}
                           className="w-full p-2 border dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg outline-none focus:border-primary text-sm"
                         />
                       </div>
                     </div>
                   ))}
                 </div>

                 <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border dark:border-gray-800 space-y-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Catégorie *</label>
                        <select 
                          required
                          value={formData.categoryId}
                          onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                          className="w-full p-2 border dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg outline-none focus:border-primary"
                        >
                          <option value="">Sélectionner une catégorie</option>
                          {categories.map((cat: any) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-3 h-full pt-6">
                        <input 
                          type="checkbox" 
                          id="isActive"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                          className="w-5 h-5 accent-primary"
                        />
                        <label htmlFor="isActive" className="text-sm font-medium cursor-pointer">Produit actif (visible en boutique)</label>
                      </div>
                   </div>
                 </div>

                 <div className="flex justify-end gap-4 pt-4">
                   <button type="button" onClick={() => setCreationStep(0)} className="px-6 py-2 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition">Annuler</button>
                   <button type="submit" className="px-8 py-2 bg-primary text-white rounded-lg font-bold hover:opacity-90 shadow-lg shadow-primary/20">Suivant</button>
                 </div>
               </form>
             )}

             {creationStep === 2 && (
               <div className="max-w-2xl space-y-6">
                 <div className="flex items-center gap-4 text-sm font-bold text-primary mb-4">
                   <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">2</span>
                   <span>Images du produit</span>
                 </div>
                 
                 <div 
                   onClick={() => document.getElementById('fileInput')?.click()}
                   className="border-2 border-dashed dark:border-gray-700 rounded-2xl p-16 text-center bg-gray-50 dark:bg-gray-800/30 cursor-pointer hover:border-primary transition-colors"
                 >
                    <input 
                      type="file" 
                      id="fileInput" 
                      multiple 
                      className="hidden" 
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        const newImages = files.map(file => URL.createObjectURL(file));
                        setFormData({...formData, images: [...formData.images, ...newImages]});
                        toast.success(`${files.length} images sélectionnées`);
                      }}
                    />
                    <div className="bg-white dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <Package size={32} className="text-primary" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">Upload des images</h3>
                    <p className="text-gray-500 mb-8 max-w-sm mx-auto">Glissez-déposez vos images ici ou cliquez pour parcourir vos fichiers.</p>
                    
                    {formData.images.length > 0 && (
                      <div className="flex flex-wrap gap-4 mb-8 justify-center">
                        {formData.images.map((img, idx) => (
                          <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border dark:border-gray-700 shadow-sm">
                            <img src={img} alt="preview" className="w-full h-full object-cover" />
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setFormData({...formData, images: formData.images.filter((_, i) => i !== idx)});
                              }}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition"
                            >
                              <LogOut size={12} className="rotate-90" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <button 
                      onClick={(e) => { e.stopPropagation(); handleStep2(); }} 
                      className="px-10 py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90 shadow-lg shadow-primary/20 transition"
                    >
                      Continuer vers la tarification
                    </button>
                 </div>
               </div>
             )}

             {creationStep === 3 && (
               <form onSubmit={handleStep3} className="max-w-2xl space-y-6">
                 <div className="flex items-center gap-4 text-sm font-bold text-primary mb-4">
                   <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">3</span>
                   <span>Tarification & Promotions</span>
                 </div>
                 
                 <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border dark:border-gray-700 shadow-sm space-y-6">
                    <div className="space-y-2">
                       <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">Prix de vente unitaire (DT)</label>
                       <div className="relative">
                         <input 
                           type="number" 
                           step="0.01"
                           autoFocus
                           value={formData.price}
                           onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                           className="w-full p-4 border-2 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl outline-none focus:border-primary text-4xl font-black text-primary"
                         />
                         <span className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">DT</span>
                       </div>
                    </div>

                    <div className="p-5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30 space-y-4">
                       <div className="flex items-center justify-between">
                         <div className="flex gap-4">
                           <div className="bg-blue-100 dark:bg-blue-900/50 w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                             <SettingsIcon size={20} className="text-blue-600 dark:text-blue-400" />
                           </div>
                           <div className="space-y-1">
                             <h4 className="font-bold text-blue-900 dark:text-blue-300">Remises sur quantité</h4>
                             <p className="text-sm text-blue-800 dark:text-blue-400">Configurez des prix dégressifs selon la quantité achetée.</p>
                           </div>
                         </div>
                         <button 
                           type="button"
                           onClick={() => setFormData({...formData, promotions: [...formData.promotions, { quantityThreshold: 2, discountPrice: formData.price }]})}
                           className="text-primary font-bold text-sm bg-white dark:bg-gray-800 px-3 py-1 rounded-lg border dark:border-gray-700"
                         >
                           + Ajouter un seuil
                         </button>
                       </div>

                       {formData.promotions.length > 0 && (
                         <div className="space-y-3 pt-2">
                           {formData.promotions.map((promo, idx) => (
                             <div key={idx} className="flex items-center gap-4 bg-white dark:bg-gray-800 p-3 rounded-lg border dark:border-gray-700">
                               <div className="flex-1 space-y-1">
                                 <label className="text-[10px] uppercase font-bold text-gray-400">À partir de</label>
                                 <div className="flex items-center gap-2">
                                   <input 
                                     type="number" 
                                     value={promo.quantityThreshold}
                                     onChange={(e) => {
                                       const newPromos = [...formData.promotions];
                                       newPromos[idx].quantityThreshold = Number(e.target.value);
                                       setFormData({...formData, promotions: newPromos});
                                     }}
                                     className="w-full p-1 border dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded outline-none text-sm"
                                   />
                                   <span className="text-xs text-gray-500 whitespace-nowrap">articles</span>
                                 </div>
                               </div>
                               <div className="flex-1 space-y-1">
                                 <label className="text-[10px] uppercase font-bold text-gray-400">Prix unitaire</label>
                                 <div className="flex items-center gap-2">
                                   <input 
                                     type="number" 
                                     step="0.01"
                                     value={promo.discountPrice}
                                     onChange={(e) => {
                                       const newPromos = [...formData.promotions];
                                       newPromos[idx].discountPrice = Number(e.target.value);
                                       setFormData({...formData, promotions: newPromos});
                                     }}
                                     className="w-full p-1 border dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded outline-none text-sm font-bold text-primary"
                                   />
                                   <span className="text-xs text-gray-500">DT</span>
                                 </div>
                               </div>
                               <button 
                                 type="button"
                                 onClick={() => setFormData({...formData, promotions: formData.promotions.filter((_, i) => i !== idx)})}
                                 className="mt-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded"
                               >
                                 <LogOut size={16} className="rotate-90" />
                               </button>
                             </div>
                           ))}
                         </div>
                       )}
                    </div>
                 </div>

                 <div className="flex justify-end gap-4 pt-4">
                   <button type="submit" className="px-10 py-4 bg-green-600 text-white rounded-xl font-bold text-xl hover:bg-green-700 transition shadow-lg shadow-green-600/20">Finaliser et Publier</button>
                 </div>
               </form>
             )}
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
