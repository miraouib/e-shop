"use client";

import { useState, useEffect } from "react";
import { Package, ShoppingBag, Settings as SettingsIcon, LogOut, Archive, Palette } from "lucide-react";
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
  const [managingBlocksProductId, setManagingBlocksProductId] = useState<number | null>(null);
  const [managingBlocksProduct, setManagingBlocksProduct] = useState<any>(null);
  const [productBlocks, setProductBlocks] = useState<any[]>([]);
  const [blockActionModal, setBlockActionModal] = useState<{isOpen: boolean, action: 'delete' | 'toggle', block: any | null}>({isOpen: false, action: 'delete', block: null});
  const [themeDeleteModal, setThemeDeleteModal] = useState<{isOpen: boolean, themeId: number | null, themeName: string}>({isOpen: false, themeId: null, themeName: ""});
  const [imageSelectorOpenForBlock, setImageSelectorOpenForBlock] = useState<number | 'new' | null>(null);
  const [pricingMethod, setPricingMethod] = useState<"NORMAL" | "PROMOTION" | "VOLUME">("NORMAL");
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [globalSettings, setGlobalSettings] = useState({
    id: 1,
    globalShippingFee: 7.0,
    freeShippingThreshold: 100,
    companyName: "",
    companyAddress: "",
    companyPhone: "",
    companyEmail: "",
    primaryColor: "#ffffff",
    secondaryColor: "#000000",
    tertiaryColor: "#f3f4f6",
    cardColor: "#ffffff",
    formBgColor: "#111827",
    formTextColor: "#ffffff",
    headerTextColor: "#ffffff",
    footerTextColor: "#ffffff",
    translations: {
      fr: { siteName: "", companyName: "", companyAddress: "" },
      en: { siteName: "", companyName: "", companyAddress: "" },
      ar: { siteName: "", companyName: "", companyAddress: "" }
    }
  });
  const [formData, setFormData] = useState({
    translations: {
      fr: { title: "", description: "" },
      en: { title: "", description: "" },
      ar: { title: "", description: "" }
    },
    categoryId: "",
    price: 0,
    originalPrice: null as number | null,
    isActive: true,
    isFreeShipping: false,
    freeShippingPriceThreshold: null as number | null,
    freeShippingQuantityThreshold: null as number | null,
    images: [] as string[],
    promotions: [] as { quantityThreshold: number, discountPrice: number }[],
    isSlideshow: false,
    slideshowOrder: null as number | null,
    isNewArrival: false
  });
  const [themes, setThemes] = useState([]);
  const [newTheme, setNewTheme] = useState({ 
    name: "", 
    primaryColor: "#ffffff", 
    secondaryColor: "#000000", 
    tertiaryColor: "#f3f4f6", 
    cardColor: "#ffffff",
    formBgColor: "#111827",
    formTextColor: "#ffffff",
    headerTextColor: "#ffffff",
    footerTextColor: "#ffffff",
    isActive: false 
  });
  const t = useTranslations('Admin');

  // Check token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("adminToken");
    if (savedToken) setToken(savedToken);

    // Intercepteur global pour gérer les erreurs 401
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      if (response.status === 401 && !args[0].toString().includes('login_check')) {
        localStorage.removeItem("adminToken");
        setToken(null);
        // On évite les toasts multiples si plusieurs requêtes échouent en même temps
        if (!document.getElementById('session-expired-toast')) {
          const toastId = toast.error("Votre session a expiré. Veuillez vous reconnecter.", {
            id: 'session-expired-toast'
          });
        }
      }
      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
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

  const fetchThemes = async () => {
    if (!token) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/themes`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setThemes(data['hydra:member'] || data['member'] || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateNewProduct = () => {
    setCurrentProductId(null);
    setPricingMethod("NORMAL");
    setDiscountPercentage(0);
    setFormData({
      translations: {
        fr: { title: "", description: "" },
        en: { title: "", description: "" },
        ar: { title: "", description: "" }
      },
      categoryId: "",
      price: 0,
      originalPrice: null,
      isActive: true,
      isFreeShipping: false,
      freeShippingPriceThreshold: null,
      freeShippingQuantityThreshold: null,
      images: [],
      promotions: [],
      isSlideshow: false,
      slideshowOrder: null,
      isNewArrival: false
    });
    setCreationStep(1);
  };

  const handleEditProduct = (product: any) => {
    setCurrentProductId(product.id);
    
    const getCategoryId = (cat: any) => {
      if (!cat) return "";
      if (typeof cat === 'string') return cat.split('/').pop() || "";
      if (cat.id) return cat.id.toString();
      if (cat['@id']) return cat['@id'].split('/').pop() || "";
      return "";
    };

    // Determine pricing method
    let method: "NORMAL" | "PROMOTION" | "VOLUME" = "NORMAL";
    if (product.promotions && product.promotions.length > 0) {
      method = "VOLUME";
    } else if (product.originalPrice) {
      method = "PROMOTION";
    }

    setPricingMethod(method);
    if (method === "PROMOTION" && product.originalPrice) {
      setDiscountPercentage(Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100));
    } else {
      setDiscountPercentage(0);
    }

    setFormData({
      translations: {
        fr: { title: product.translations?.fr?.title || "", description: product.translations?.fr?.description || "" },
        en: { title: product.translations?.en?.title || "", description: product.translations?.en?.description || "" },
        ar: { title: product.translations?.ar?.title || "", description: product.translations?.ar?.description || "" }
      },
      categoryId: getCategoryId(product.category),
      price: product.price,
      originalPrice: product.originalPrice || null,
      isActive: product.isActive,
      isFreeShipping: product.isFreeShipping || false,
      freeShippingPriceThreshold: product.freeShippingPriceThreshold || null,
      freeShippingQuantityThreshold: product.freeShippingQuantityThreshold || null,
      images: product.images || [],
      promotions: product.promotions?.map((p: any) => ({
        quantityThreshold: p.quantityThreshold,
        discountPrice: p.discountPrice
      })) || [],
      isSlideshow: product.isSlideshow || false,
      slideshowOrder: product.slideshowOrder || null,
      isNewArrival: product.isNewArrival || false
    });
    setCreationStep(1);
  };

  const fetchProductBlocks = async (productId: number) => {
    if (!token) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/product_blocks?product=${productId}&order[position]=asc`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProductBlocks(data['hydra:member'] || data['member'] || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleManageBlocks = (product: any) => {
    setManagingBlocksProductId(product.id);
    setManagingBlocksProduct(product);
    fetchProductBlocks(product.id);
  };

  const fetchSettings = async () => {
    if (!token) return;
    try {
      const res = await fetch("http://127.0.0.1:8000/api/settings", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const settings = data['hydra:member']?.[0] || data['member']?.[0];
        if (settings) {
          setGlobalSettings({
            id: settings.id,
            globalShippingFee: settings.globalShippingFee ?? 7.0,
            freeShippingThreshold: settings.freeShippingThreshold ?? 100,
            companyName: settings.companyName ?? "",
            companyAddress: settings.companyAddress ?? "",
            companyPhone: settings.companyPhone ?? "",
            companyEmail: settings.companyEmail ?? "",
            primaryColor: settings.primaryColor ?? "#ffffff",
            secondaryColor: settings.secondaryColor ?? "#000000",
            tertiaryColor: settings.tertiaryColor ?? "#f3f4f6",
            cardColor: settings.cardColor ?? "#ffffff",
            formBgColor: settings.formBgColor ?? "#111827",
            formTextColor: settings.formTextColor ?? "#ffffff",
            headerTextColor: settings.headerTextColor ?? "#ffffff",
            footerTextColor: settings.footerTextColor ?? "#ffffff",
            translations: settings.translations ?? {
              fr: { siteName: "", companyName: "", companyAddress: "" },
              en: { siteName: "", companyName: "", companyAddress: "" },
              ar: { siteName: "", companyName: "", companyAddress: "" }
            }
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/settings/${globalSettings.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/ld+json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          globalShippingFee: Number(globalSettings.globalShippingFee),
          freeShippingThreshold: Number(globalSettings.freeShippingThreshold),
          companyName: globalSettings.companyName,
          companyAddress: globalSettings.companyAddress,
          companyPhone: globalSettings.companyPhone,
          companyEmail: globalSettings.companyEmail,
          primaryColor: globalSettings.primaryColor,
          secondaryColor: globalSettings.secondaryColor,
          tertiaryColor: globalSettings.tertiaryColor,
          cardColor: globalSettings.cardColor,
          formBgColor: globalSettings.formBgColor,
          formTextColor: globalSettings.formTextColor,
          headerTextColor: globalSettings.headerTextColor,
          footerTextColor: globalSettings.footerTextColor,
          translations: globalSettings.translations
        })
      });
      if (res.ok) {
        toast.success("Paramètres mis à jour");
      } else {
        toast.error("Erreur lors de la mise à jour des paramètres");
      }
    } catch (e) {
      toast.error("Erreur de connexion");
    }
  };

  const handleSaveTheme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const res = await fetch("http://127.0.0.1:8000/api/themes", {
        method: "POST",
        headers: {
          "Content-Type": "application/ld+json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newTheme)
      });
      if (res.ok) {
        toast.success("Thème créé");
        setNewTheme({ 
          name: "", 
          primaryColor: "#ffffff", 
          secondaryColor: "#000000", 
          tertiaryColor: "#f3f4f6",
          cardColor: "#ffffff",
          formBgColor: "#111827",
          formTextColor: "#ffffff",
          headerTextColor: "#ffffff",
          footerTextColor: "#ffffff",
          isActive: false 
        });
        fetchThemes();
      } else {
        toast.error("Erreur lors de la création du thème");
      }
    } catch (e) {
      toast.error("Erreur de connexion");
    }
  };

  const handleApplyTheme = async (theme: any) => {
    if (!token) return;
    try {
      // 1. Find and deactivate existing active themes
      const activeThemes = themes.filter((t: any) => t.isActive && t.id !== theme.id);
      for (const t of activeThemes) {
        await fetch(`http://127.0.0.1:8000/api/themes/${t.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/merge-patch+json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ isActive: false })
        });
      }

      // 2. Activate the selected theme
      const res = await fetch(`http://127.0.0.1:8000/api/themes/${theme.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/merge-patch+json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ isActive: true })
      });

      if (res.ok) {
        setGlobalSettings({
          ...globalSettings,
          primaryColor: theme.primaryColor,
          secondaryColor: theme.secondaryColor,
          tertiaryColor: theme.tertiaryColor,
          cardColor: theme.cardColor,
          formBgColor: theme.formBgColor,
          formTextColor: theme.formTextColor,
          headerTextColor: theme.headerTextColor,
          footerTextColor: theme.footerTextColor
        });
        toast.success(`Thème "${theme.name}" activé sur tout le site !`);
        fetchThemes();
      }
    } catch (e) {
      toast.error("Erreur lors de l'activation du thème");
    }
  };

  const handleDeleteTheme = async (id: number) => {
    if (!token) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/themes/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Thème supprimé");
        fetchThemes();
        setThemeDeleteModal({ isOpen: false, themeId: null, themeName: "" });
      }
    } catch (e) {
      console.error(e);
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const url = currentProductId 
        ? `http://127.0.0.1:8000/api/products/${currentProductId}`
        : "http://127.0.0.1:8000/api/products";
      const method = currentProductId ? "PATCH" : "POST";
      const contentType = currentProductId ? "application/merge-patch+json" : "application/ld+json";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": contentType,
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          translations: formData.translations,
          category: `/api/categories/${formData.categoryId}`,
          price: currentProductId ? formData.price : 0,
          isActive: formData.isActive,
          isSlideshow: formData.isSlideshow,
          slideshowOrder: formData.slideshowOrder ? Number(formData.slideshowOrder) : null,
          isNewArrival: formData.isNewArrival
        })
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentProductId(data.id);
        setCreationStep(2);
        toast.success(currentProductId ? "Identité mise à jour !" : "Produit créé ! Passons aux images.");
      } else {
        toast.error("Erreur lors de la création");
      }
    } catch (e) {
      toast.error("Erreur de connexion");
    }
  };

  const patchImagesToDB = async (newImages: string[]) => {
    if (!currentProductId || !token) return;
    try {
      await fetch(`http://127.0.0.1:8000/api/products/${currentProductId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/merge-patch+json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ images: newImages })
      });
    } catch (e) {
      console.error(e);
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
          originalPrice: pricingMethod === 'PROMOTION' ? Number(formData.originalPrice) : null,
          isFreeShipping: formData.isFreeShipping,
          freeShippingPriceThreshold: formData.freeShippingPriceThreshold ? Number(formData.freeShippingPriceThreshold) : null,
          freeShippingQuantityThreshold: formData.freeShippingQuantityThreshold ? Number(formData.freeShippingQuantityThreshold) : null,
          promotions: pricingMethod === 'VOLUME' ? formData.promotions.map(p => ({
            quantityThreshold: Number(p.quantityThreshold),
            discountPrice: Number(p.discountPrice)
          })) : []
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
        } else if (activeTab === "settings") {
          fetchSettings();
        } else if (activeTab === "theme") {
          fetchThemes();
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
        <button
          onClick={() => setActiveTab("theme")}
          className={`w-full flex items-center gap-3 p-4 rounded-xl font-medium transition-colors ${activeTab === "theme" ? "bg-primary text-white" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
        >
          <Palette size={20} /> {t('theme') || "Thème"}
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
                    <tr className="border-b dark:border-gray-800 text-gray-700 dark:text-gray-300">
                      <th className="p-3 font-bold uppercase text-xs tracking-wider">{t('id')}</th>
                      <th className="p-3 font-bold uppercase text-xs tracking-wider">{t('client')}</th>
                      <th className="p-3 font-bold uppercase text-xs tracking-wider">{t('total')}</th>
                      <th className="p-3 font-bold uppercase text-xs tracking-wider">{t('status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order: any) => (
                      <tr key={order.id} className="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="p-3 text-gray-500 dark:text-gray-400 font-mono text-xs">#{order.id}</td>
                        <td className="p-3 text-gray-900 dark:text-white font-medium">{order.customerName}</td>
                        <td className="p-3 font-bold text-primary">{order.totalPrice} DT</td>
                        <td className="p-3">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className={`text-xs px-2 py-1 rounded-full font-bold outline-none cursor-pointer ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
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
              {creationStep === 0 && !managingBlocksProductId && (
                <button
                  onClick={handleCreateNewProduct}
                  className="bg-primary text-white px-4 py-2 rounded-lg font-bold hover:opacity-90 transition"
                >
                  + Ajouter
                </button>
              )}
            </div>

            {creationStep === 0 && !managingBlocksProductId && (
              <>
                {products.length === 0 ? (
                  <p className="text-gray-500">{t('no_products')}</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b dark:border-gray-800 text-gray-700 dark:text-gray-300">
                          <th className="p-3 font-bold uppercase text-xs tracking-wider">{t('id')}</th>
                          <th className="p-3 font-bold uppercase text-xs tracking-wider">{t('product_name')}</th>
                          <th className="p-3 font-bold uppercase text-xs tracking-wider">{t('product_category')}</th>
                          <th className="p-3 font-bold uppercase text-xs tracking-wider">{t('product_price')}</th>
                          <th className="p-3 font-bold uppercase text-xs tracking-wider">{t('product_status')}</th>
                          <th className="p-3 text-right font-bold uppercase text-xs tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product: any) => (
                          <tr key={product.id} className="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <td className="p-3 text-gray-500 dark:text-gray-400 font-mono text-xs">#{product.id}</td>
                            <td className="p-3 font-bold text-gray-900 dark:text-white">{product.translations?.fr?.title || 'N/A'}</td>
                            <td className="p-3 text-sm text-gray-600 dark:text-gray-400">{product.category?.name || 'N/A'}</td>
                            <td className="p-3 font-black text-primary">{product.price} DT</td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${product.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                                {product.isActive ? 'Actif' : 'Inactif'}
                              </span>
                            </td>
                            <td className="p-3 text-right space-x-2">
                              <button 
                                onClick={() => handleManageBlocks(product)}
                                className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded hover:bg-indigo-200 transition font-bold"
                              >
                                Blocs
                              </button>
                              <button 
                                onClick={() => handleEditProduct(product)}
                                className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 transition font-bold"
                              >
                                Éditer
                              </button>
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

            {managingBlocksProductId && (
               <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border dark:border-gray-800">
                 <div className="flex justify-between items-center mb-6 border-b pb-4 dark:border-gray-800">
                   <h2 className="text-xl font-bold text-gray-900 dark:text-white">Gestion des Blocs</h2>
                   <button 
                     onClick={() => setManagingBlocksProductId(null)}
                     className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700"
                   >
                     Retour aux produits
                   </button>
                 </div>
                 
                 <div className="space-y-6">
                   {productBlocks.length === 0 ? (
                     <p className="text-gray-500">Aucun bloc pour ce produit.</p>
                   ) : (
                     <div className="space-y-4">
                       {productBlocks.map((block) => (
                         <div key={block.id} className={`p-4 border rounded-xl flex gap-4 ${!block.isActive ? 'opacity-50' : ''}`}>
                           {block.image && <img src={block.image} alt="Block" className="w-24 h-24 object-cover rounded-lg" />}
                           <div className="flex-1">
                             <div className="flex justify-between items-start">
                               <h3 className="font-bold text-lg text-gray-900 dark:text-white">{block.translations?.fr?.title || 'Sans titre'}</h3>
                               <div className="flex flex-wrap gap-2 justify-end">
                                 <span className="text-xs px-2 py-1 bg-green-100 text-green-800 font-bold rounded">Pos: {block.position}</span>
                                 <button 
                                   onClick={() => setImageSelectorOpenForBlock(block.id)}
                                   className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800 hover:bg-blue-200 font-bold"
                                 >
                                   Image
                                 </button>
                                 <button 
                                   onClick={() => setBlockActionModal({ isOpen: true, action: 'toggle', block })}
                                   className={`text-xs px-2 py-1 rounded font-bold text-white ${block.isActive ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-500 hover:bg-green-600'}`}
                                 >
                                   {block.isActive ? 'Désactiver' : 'Activer'}
                                 </button>
                                 <button 
                                   onClick={() => setBlockActionModal({ isOpen: true, action: 'delete', block })}
                                   className="text-xs px-2 py-1 rounded font-bold bg-red-500 text-white hover:bg-red-600"
                                 >
                                   Supprimer
                                 </button>
                               </div>
                             </div>
                             <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2" dangerouslySetInnerHTML={{ __html: block.translations?.fr?.content || '' }} />
                           </div>
                         </div>
                       ))}
                     </div>
                   )}

                   <div className="pt-6 border-t dark:border-gray-800">
                     <h3 className="font-bold mb-4 text-gray-900 dark:text-white">Ajouter un nouveau bloc</h3>
                     <form onSubmit={async (e) => {
                       e.preventDefault();
                       const form = e.target as HTMLFormElement;
                       const image = (form.elements.namedItem('image') as HTMLInputElement).value;
                       const position = (form.elements.namedItem('position') as HTMLInputElement).value;
                       const translations = {
                         fr: {
                           title: (form.elements.namedItem('title_fr') as HTMLInputElement).value,
                           content: (form.elements.namedItem('content_fr') as HTMLTextAreaElement).value
                         },
                         en: {
                           title: (form.elements.namedItem('title_en') as HTMLInputElement).value,
                           content: (form.elements.namedItem('content_en') as HTMLTextAreaElement).value
                         },
                         ar: {
                           title: (form.elements.namedItem('title_ar') as HTMLInputElement).value,
                           content: (form.elements.namedItem('content_ar') as HTMLTextAreaElement).value
                         }
                       };

                       const res = await fetch('http://127.0.0.1:8000/api/product_blocks', {
                         method: 'POST',
                         headers: { 'Content-Type': 'application/ld+json', 'Authorization': `Bearer ${token}` },
                         body: JSON.stringify({
                           product: `/api/products/${managingBlocksProductId}`,
                           translations: translations,
                           image: image || null,
                           position: Number(position),
                           isActive: true
                         })
                       });
                       if (res.ok) {
                         toast.success("Bloc ajouté");
                         form.reset();
                         fetchProductBlocks(managingBlocksProductId);
                       } else {
                         toast.error("Erreur d'ajout");
                       }
                     }} className="space-y-4">
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                         {['fr', 'en', 'ar'].map(lang => (
                           <div key={lang} className="space-y-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded border dark:border-gray-700">
                             <label className="text-xs font-bold uppercase block border-b pb-1 dark:border-gray-700 text-gray-900 dark:text-white">{lang === 'fr' ? '🇫🇷 Français' : lang === 'en' ? '🇬🇧 English' : '🇸🇦 العربية'}</label>
                             <input name={`title_${lang}`} required={lang === 'fr'} className="w-full p-2 border dark:border-gray-700 bg-white dark:bg-gray-900 rounded outline-none text-sm text-gray-900 dark:text-white focus:border-primary" placeholder={`Titre (${lang})`} />
                             <textarea name={`content_${lang}`} required={lang === 'fr'} rows={3} className="w-full p-2 border dark:border-gray-700 bg-white dark:bg-gray-900 rounded font-mono text-xs text-gray-900 dark:text-white outline-none focus:border-primary" placeholder={`<p>Contenu HTML (${lang})...</p>`} />
                           </div>
                         ))}
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                         <div>
                           <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Position (Ordre d'affichage)</label>
                           <input name="position" type="number" defaultValue={0} required className="w-full p-2 border dark:border-gray-700 bg-white dark:bg-gray-900 rounded outline-none text-sm text-gray-900 dark:text-white focus:border-primary" />
                         </div>
                         <div>
                           <div className="flex justify-between items-end mb-1">
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image URL (Optionnel)</label>
                             <button 
                               type="button"
                               onClick={() => setImageSelectorOpenForBlock('new')}
                               className="text-xs text-primary font-bold hover:underline"
                             >
                               Choisir parmi les images
                             </button>
                           </div>
                           <input name="image" className="w-full p-2 border dark:border-gray-700 bg-white dark:bg-gray-900 rounded outline-none text-sm text-gray-900 dark:text-white focus:border-primary" placeholder="https://..." />
                         </div>
                       </div>
                       <button type="submit" className="bg-primary text-white px-6 py-2 rounded font-bold hover:opacity-90">Créer le bloc</button>
                     </form>
                   </div>
                 </div>
               </div>
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
                      <label className="text-sm font-bold uppercase block border-b pb-2 dark:border-gray-700 text-gray-900 dark:text-white">{lang === 'fr' ? '🇫🇷 Français' : lang === 'en' ? '🇬🇧 English' : '🇸🇦 العربية'}</label>
                      <div className="space-y-2">
                        <label className="text-xs text-gray-500 dark:text-gray-400">Titre {lang === 'fr' && '*'}</label>
                        <input
                          type="text"
                          required={lang === 'fr'}
                          value={(formData.translations as any)[lang].title}
                          onChange={(e) => setFormData({ ...formData, translations: { ...formData.translations, [lang]: { ...(formData.translations as any)[lang], title: e.target.value } } })}
                          className="w-full p-2 border dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg outline-none text-sm text-gray-900 dark:text-white focus:border-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs text-gray-500 dark:text-gray-400">Description</label>
                        <textarea
                          rows={4}
                          value={(formData.translations as any)[lang].description}
                          onChange={(e) => setFormData({ ...formData, translations: { ...formData.translations, [lang]: { ...(formData.translations as any)[lang], description: e.target.value } } })}
                          className="w-full p-2 border dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg outline-none text-sm text-gray-900 dark:text-white focus:border-primary"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border dark:border-gray-800 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-900 dark:text-white">Catégorie *</label>
                      <select
                        required
                        value={formData.categoryId}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                        className="w-full p-2 border dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg outline-none text-sm text-gray-900 dark:text-white focus:border-primary"
                      >
                        <option value="">Sélectionner une catégorie</option>
                        {categories.map((cat: any) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col justify-center gap-3 pt-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="isActive"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                          className="w-5 h-5 accent-primary"
                        />
                        <label htmlFor="isActive" className="text-sm font-medium cursor-pointer text-gray-900 dark:text-white">Produit actif (visible en boutique)</label>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="isNewArrival"
                          checked={formData.isNewArrival}
                          onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
                          className="w-5 h-5 accent-primary"
                        />
                        <label htmlFor="isNewArrival" className="text-sm font-medium cursor-pointer text-gray-900 dark:text-white">Afficher dans "Nouveautés"</label>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <input
                          type="checkbox"
                          id="isSlideshow"
                          checked={formData.isSlideshow}
                          onChange={(e) => setFormData({ ...formData, isSlideshow: e.target.checked })}
                          className="w-5 h-5 accent-primary"
                        />
                        <label htmlFor="isSlideshow" className="text-sm font-medium cursor-pointer text-gray-900 dark:text-white">Afficher dans le Diaporama Accueil</label>
                        {formData.isSlideshow && (
                          <input
                            type="number"
                            placeholder="Ordre"
                            value={formData.slideshowOrder || ''}
                            onChange={(e) => setFormData({ ...formData, slideshowOrder: e.target.value ? Number(e.target.value) : null })}
                            className="p-1 border dark:border-gray-700 bg-white dark:bg-gray-800 rounded outline-none w-20 text-sm text-gray-900 dark:text-white focus:border-primary"
                          />
                        )}
                      </div>
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
                    onChange={async (e) => {
                      const files = Array.from(e.target.files || []);
                      const newImagesList = [...formData.images];
                      
                      for (const file of files) {
                        const formDataUpload = new FormData();
                        formDataUpload.append('image', file);
                        
                        try {
                          const uploadRes = await fetch("http://127.0.0.1:8000/api/upload_image", {
                            method: "POST",
                            body: formDataUpload
                          });
                          if (uploadRes.ok) {
                            const data = await uploadRes.json();
                            newImagesList.push(data.url);
                          } else {
                            toast.error("Erreur lors de l'upload d'une image");
                          }
                        } catch(err) {
                          console.error("Upload failed", err);
                          toast.error("Erreur de connexion lors de l'upload");
                        }
                      }
                      
                      setFormData({ ...formData, images: newImagesList });
                      if (currentProductId) {
                        await patchImagesToDB(newImagesList);
                      }
                      toast.success(`${files.length} images ajoutées !`);
                    }}
                  />
                  <div className="bg-white dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Package size={32} className="text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Upload des images</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">Glissez-déposez vos images ici ou cliquez pour parcourir vos fichiers.</p>

                  {formData.images.length > 0 && (
                    <div className="flex flex-wrap gap-4 mb-8 justify-center">
                      {formData.images.map((img, idx) => (
                        <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border dark:border-gray-700 shadow-sm">
                          <img src={img} alt="preview" className="w-full h-full object-cover" />
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              if(confirm("Supprimer cette image ?")) {
                                const newImagesList = formData.images.filter((_, i) => i !== idx);
                                setFormData({ ...formData, images: newImagesList });
                                if (currentProductId) {
                                  await patchImagesToDB(newImagesList);
                                }
                                toast.success("Image supprimée !");
                              }
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

                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-6">
                  <button
                    type="button"
                    onClick={() => setPricingMethod("NORMAL")}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${pricingMethod === "NORMAL" ? "bg-white dark:bg-gray-700 shadow-sm text-primary" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"}`}
                  >
                    Prix Normal
                  </button>
                  <button
                    type="button"
                    onClick={() => setPricingMethod("PROMOTION")}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${pricingMethod === "PROMOTION" ? "bg-white dark:bg-gray-700 shadow-sm text-primary" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"}`}
                  >
                    Promotion
                  </button>
                  <button
                    type="button"
                    onClick={() => setPricingMethod("VOLUME")}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${pricingMethod === "VOLUME" ? "bg-white dark:bg-gray-700 shadow-sm text-primary" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"}`}
                  >
                    Remises sur Quantité
                  </button>
                </div>

                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border dark:border-gray-700 shadow-sm space-y-6">
                  {pricingMethod === 'PROMOTION' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Prix d'origine (DT)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.originalPrice || ''}
                          onChange={(e) => {
                            const orig = Number(e.target.value);
                            setFormData({ ...formData, originalPrice: orig, price: orig - (orig * discountPercentage / 100) });
                          }}
                          className="w-full p-4 border-2 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl outline-none focus:border-primary text-2xl font-bold text-gray-900 dark:text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Remise (%)</label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0" max="100"
                            value={discountPercentage}
                            onChange={(e) => {
                              const pct = Number(e.target.value);
                              setDiscountPercentage(pct);
                              if (formData.originalPrice) {
                                setFormData({ ...formData, price: formData.originalPrice - (formData.originalPrice * pct / 100) });
                              }
                            }}
                            className="w-full p-4 border-2 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl outline-none focus:border-primary text-2xl font-bold text-red-500"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">%</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">{pricingMethod === 'PROMOTION' ? 'Prix promotionnel final (DT)' : 'Prix de vente unitaire (DT)'}</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        autoFocus
                        value={formData.price}
                        onChange={(e) => {
                          const newPrice = Number(e.target.value);
                          setFormData({ ...formData, price: newPrice });
                          if (pricingMethod === 'PROMOTION' && formData.originalPrice) {
                            setDiscountPercentage(Math.round(((formData.originalPrice - newPrice) / formData.originalPrice) * 100));
                          }
                        }}
                        className={`w-full p-4 border-2 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl outline-none focus:border-primary text-4xl font-black ${pricingMethod === 'PROMOTION' ? 'text-green-500' : 'text-primary'}`}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">DT</span>
                    </div>
                  </div>

                  {pricingMethod === 'VOLUME' && (
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
                          onClick={() => setFormData({ ...formData, promotions: [...formData.promotions, { quantityThreshold: 2, discountPrice: formData.price }] })}
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
                                      setFormData({ ...formData, promotions: newPromos });
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
                                      setFormData({ ...formData, promotions: newPromos });
                                    }}
                                    className="w-full p-1 border dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded outline-none text-sm font-bold text-primary"
                                  />
                                  <span className="text-xs text-gray-500">DT</span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setFormData({ ...formData, promotions: formData.promotions.filter((_, i) => i !== idx) })}
                                className="mt-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded"
                              >
                                <LogOut size={16} className="rotate-90" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border dark:border-gray-700 shadow-sm space-y-6 mt-6">
                  <h3 className="text-lg font-bold border-b pb-2 dark:border-gray-700">Conditions de Livraison (Optionnel)</h3>
                  <p className="text-sm text-gray-500">Par défaut, les règles globales s'appliquent. Définissez ici des règles de gratuité spécifiques à ce produit.</p>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="isFreeShipping"
                        checked={formData.isFreeShipping}
                        onChange={(e) => setFormData({ ...formData, isFreeShipping: e.target.checked })}
                        className="w-5 h-5 accent-primary"
                      />
                      <label htmlFor="isFreeShipping" className="text-sm font-medium cursor-pointer">Livraison toujours gratuite pour ce produit</label>
                    </div>

                    {!formData.isFreeShipping && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Gratuit à partir de (DT)</label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="ex: 50"
                            value={formData.freeShippingPriceThreshold || ''}
                            onChange={(e) => setFormData({ ...formData, freeShippingPriceThreshold: e.target.value ? Number(e.target.value) : null })}
                            className="w-full p-2 border dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded outline-none text-sm focus:border-primary"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Gratuit à partir de (Quantité)</label>
                          <input
                            type="number"
                            placeholder="ex: 3"
                            value={formData.freeShippingQuantityThreshold || ''}
                            onChange={(e) => setFormData({ ...formData, freeShippingQuantityThreshold: e.target.value ? Number(e.target.value) : null })}
                            className="w-full p-2 border dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded outline-none text-sm focus:border-primary"
                          />
                        </div>
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
            <h2 className="text-2xl font-bold mb-6">{t('settings') || "Paramètres"}</h2>
            <form onSubmit={handleSaveSettings} className="space-y-6 max-w-4xl">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700">
                <h3 className="text-lg font-bold mb-4 border-b pb-2 dark:border-gray-700 text-gray-900 dark:text-white">Paramètres Généraux</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {['fr', 'en', 'ar'].map(lang => (
                    <div key={lang} className="space-y-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border dark:border-gray-700">
                      <label className="text-xs font-bold uppercase block border-b pb-1 dark:border-gray-700 text-gray-900 dark:text-white">{lang === 'fr' ? '🇫🇷 Français' : lang === 'en' ? '🇬🇧 English' : '🇸🇦 العربية'}</label>
                      <div>
                        <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-300">Nom du site</label>
                        <input 
                          type="text" 
                          value={globalSettings.translations[lang as keyof typeof globalSettings.translations]?.siteName || ""} 
                          onChange={(e) => setGlobalSettings({ 
                            ...globalSettings, 
                            translations: { 
                              ...globalSettings.translations, 
                              [lang]: { ...globalSettings.translations[lang as keyof typeof globalSettings.translations], siteName: e.target.value } 
                            } 
                          })}
                          className="w-full p-2 border dark:border-gray-700 bg-white dark:bg-gray-900 rounded outline-none text-sm text-gray-900 dark:text-white focus:border-primary"
                          placeholder="Ex: Ma Boutique"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-300">Nom de la société</label>
                        <input 
                          type="text" 
                          value={globalSettings.translations[lang as keyof typeof globalSettings.translations]?.companyName || ""} 
                          onChange={(e) => setGlobalSettings({ 
                            ...globalSettings, 
                            translations: { 
                              ...globalSettings.translations, 
                              [lang]: { ...globalSettings.translations[lang as keyof typeof globalSettings.translations], companyName: e.target.value } 
                            } 
                          })}
                          className="w-full p-2 border dark:border-gray-700 bg-white dark:bg-gray-900 rounded outline-none text-sm text-gray-900 dark:text-white focus:border-primary"
                          placeholder="Ex: SARL MyShop"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-300">Adresse</label>
                        <input 
                          type="text" 
                          value={globalSettings.translations[lang as keyof typeof globalSettings.translations]?.companyAddress || ""} 
                          onChange={(e) => setGlobalSettings({ 
                            ...globalSettings, 
                            translations: { 
                              ...globalSettings.translations, 
                              [lang]: { ...globalSettings.translations[lang as keyof typeof globalSettings.translations], companyAddress: e.target.value } 
                            } 
                          })}
                          className="w-full p-2 border dark:border-gray-700 bg-white dark:bg-gray-900 rounded outline-none text-sm text-gray-900 dark:text-white focus:border-primary"
                          placeholder="Ex: Rue 123, Paris"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700">
                <h3 className="text-lg font-bold mb-4 border-b pb-2 dark:border-gray-700 text-gray-900 dark:text-white">Contacts & Livraison</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Téléphone</label>
                      <input 
                        type="text" 
                        value={globalSettings.companyPhone} 
                        onChange={(e) => setGlobalSettings({ ...globalSettings, companyPhone: e.target.value })}
                        className="w-full p-2 border dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded outline-none text-sm text-gray-900 dark:text-white focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Email</label>
                      <input 
                        type="email" 
                        value={globalSettings.companyEmail} 
                        onChange={(e) => setGlobalSettings({ ...globalSettings, companyEmail: e.target.value })}
                        className="w-full p-2 border dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded outline-none text-sm text-gray-900 dark:text-white focus:border-primary"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Frais de livraison (DT)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        value={globalSettings.globalShippingFee} 
                        onChange={(e) => setGlobalSettings({ ...globalSettings, globalShippingFee: Number(e.target.value) })}
                        className="w-full p-2 border dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded outline-none text-sm text-gray-900 dark:text-white focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Seuil livraison gratuite (DT)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        value={globalSettings.freeShippingThreshold} 
                        onChange={(e) => setGlobalSettings({ ...globalSettings, freeShippingThreshold: Number(e.target.value) })}
                        className="w-full p-2 border dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded outline-none text-sm text-gray-900 dark:text-white focus:border-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button type="submit" className="bg-primary text-white px-10 py-3 rounded-xl font-bold hover:opacity-90 transition shadow-lg shadow-primary/20">
                  Enregistrer les paramètres
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === "theme" && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{t('theme') || "Thème & Couleurs"}</h2>
            
            {/* Gestion des Thèmes Enregistrés */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700">
              <h3 className="text-lg font-bold mb-4 border-b pb-2 dark:border-gray-700 text-gray-900 dark:text-white">Thèmes enregistrés</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {themes.map((theme: any) => (
                  <div key={theme.id} className={`p-4 rounded-xl border relative group transition-all ${theme.isActive ? 'bg-primary/5 border-primary shadow-md' : 'bg-gray-50 dark:bg-gray-900/50 dark:border-gray-700'}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white">{theme.name}</h4>
                        {theme.isActive && <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full font-bold uppercase">Actif</span>}
                      </div>
                      <button 
                        onClick={() => setThemeDeleteModal({ isOpen: true, themeId: theme.id, themeName: theme.name })}
                        className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <Archive size={14} />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      <div className="w-6 h-6 rounded-full border border-white shadow-sm" style={{ backgroundColor: theme.primaryColor }} title="Header"></div>
                      <div className="w-6 h-6 rounded-full border border-white shadow-sm" style={{ backgroundColor: theme.secondaryColor }} title="Body"></div>
                      <div className="w-6 h-6 rounded-full border border-white shadow-sm" style={{ backgroundColor: theme.cardColor }} title="Card"></div>
                      <div className="w-6 h-6 rounded-full border border-white shadow-sm" style={{ backgroundColor: theme.formBgColor }} title="Form"></div>
                      <div className="w-6 h-6 rounded-full border border-white shadow-sm" style={{ backgroundColor: theme.tertiaryColor }} title="Footer"></div>
                    </div>
                    <button 
                      onClick={() => handleApplyTheme(theme)}
                      disabled={theme.isActive}
                      className={`w-full py-2 border rounded-lg text-xs font-bold transition shadow-sm ${theme.isActive ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                      {theme.isActive ? "Thème utilisé" : "Utiliser ce thème"}
                    </button>
                  </div>
                ))}

                {/* Formulaire nouveau thème */}
                <form onSubmit={handleSaveTheme} className="p-4 bg-primary/5 rounded-xl border border-dashed border-primary/30 space-y-4">
                  <input 
                    type="text" 
                    placeholder="Nom du nouveau thème"
                    value={newTheme.name}
                    onChange={(e) => setNewTheme({ ...newTheme, name: e.target.value })}
                    className="w-full p-2 bg-white dark:bg-gray-900 border dark:border-gray-700 rounded text-xs outline-none focus:border-primary font-bold"
                    required
                  />
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-gray-400">Header</label>
                      <input type="color" value={newTheme.primaryColor} onChange={(e) => setNewTheme({ ...newTheme, primaryColor: e.target.value })} className="w-full h-8 rounded cursor-pointer border-none" title="Header Bg" />
                      <input type="color" value={newTheme.headerTextColor} onChange={(e) => setNewTheme({ ...newTheme, headerTextColor: e.target.value })} className="w-full h-8 rounded cursor-pointer border-none" title="Header Text" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-gray-400">Body</label>
                      <input type="color" value={newTheme.secondaryColor} onChange={(e) => setNewTheme({ ...newTheme, secondaryColor: e.target.value })} className="w-full h-8 rounded cursor-pointer border-none" title="Body Bg" />
                      <input type="color" value={newTheme.cardColor} onChange={(e) => setNewTheme({ ...newTheme, cardColor: e.target.value })} className="w-full h-8 rounded cursor-pointer border-none" title="Card Bg" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-gray-400">Footer</label>
                      <input type="color" value={newTheme.tertiaryColor} onChange={(e) => setNewTheme({ ...newTheme, tertiaryColor: e.target.value })} className="w-full h-8 rounded cursor-pointer border-none" title="Footer Bg" />
                      <input type="color" value={newTheme.footerTextColor} onChange={(e) => setNewTheme({ ...newTheme, footerTextColor: e.target.value })} className="w-full h-8 rounded cursor-pointer border-none" title="Footer Text" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-gray-400">Formulaire Bg</label>
                      <input type="color" value={newTheme.formBgColor} onChange={(e) => setNewTheme({ ...newTheme, formBgColor: e.target.value })} className="w-full h-8 rounded cursor-pointer border-none" title="Form Bg" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-gray-400">Formulaire Text</label>
                      <input type="color" value={newTheme.formTextColor} onChange={(e) => setNewTheme({ ...newTheme, formTextColor: e.target.value })} className="w-full h-8 rounded cursor-pointer border-none" title="Form Text" />
                    </div>
                  </div>

                  <button type="submit" className="w-full py-2 bg-primary text-white rounded-lg text-xs font-bold shadow-md shadow-primary/20 hover:opacity-90 transition">
                    Enregistrer le thème
                  </button>
                </form>
              </div>
            </div>

            {/* Éditeur de couleurs en cours */}
            <form onSubmit={handleSaveSettings} className="space-y-6 max-w-5xl">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700">
                <h3 className="text-lg font-bold mb-6 border-b pb-2 dark:border-gray-700 text-gray-900 dark:text-white">Configuration détaillée des couleurs</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* Section Header & Body */}
                  <div className="space-y-6">
                    <h4 className="text-xs font-bold uppercase text-primary tracking-widest">En-tête & Corps</h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Header (Fond)</label>
                        <div className="flex gap-2">
                          <input type="color" value={globalSettings.primaryColor} onChange={(e) => setGlobalSettings({ ...globalSettings, primaryColor: e.target.value })} className="w-10 h-10 border-none rounded cursor-pointer" />
                          <input type="text" value={globalSettings.primaryColor} onChange={(e) => setGlobalSettings({ ...globalSettings, primaryColor: e.target.value })} className="flex-1 p-2 border dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded outline-none text-xs font-mono text-gray-900 dark:text-white" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Header (Texte)</label>
                        <div className="flex gap-2">
                          <input type="color" value={globalSettings.headerTextColor} onChange={(e) => setGlobalSettings({ ...globalSettings, headerTextColor: e.target.value })} className="w-10 h-10 border-none rounded cursor-pointer" />
                          <input type="text" value={globalSettings.headerTextColor} onChange={(e) => setGlobalSettings({ ...globalSettings, headerTextColor: e.target.value })} className="flex-1 p-2 border dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded outline-none text-xs font-mono text-gray-900 dark:text-white" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Fond du site (Body)</label>
                        <div className="flex gap-2">
                          <input type="color" value={globalSettings.secondaryColor} onChange={(e) => setGlobalSettings({ ...globalSettings, secondaryColor: e.target.value })} className="w-10 h-10 border-none rounded cursor-pointer" />
                          <input type="text" value={globalSettings.secondaryColor} onChange={(e) => setGlobalSettings({ ...globalSettings, secondaryColor: e.target.value })} className="flex-1 p-2 border dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded outline-none text-xs font-mono text-gray-900 dark:text-white" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section Composants */}
                  <div className="space-y-6">
                    <h4 className="text-xs font-bold uppercase text-primary tracking-widest">Composants (Cartes & Form)</h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Carte Produit (Fond)</label>
                        <div className="flex gap-2">
                          <input type="color" value={globalSettings.cardColor} onChange={(e) => setGlobalSettings({ ...globalSettings, cardColor: e.target.value })} className="w-10 h-10 border-none rounded cursor-pointer" />
                          <input type="text" value={globalSettings.cardColor} onChange={(e) => setGlobalSettings({ ...globalSettings, cardColor: e.target.value })} className="flex-1 p-2 border dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded outline-none text-xs font-mono text-gray-900 dark:text-white" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Formulaire (Fond)</label>
                        <div className="flex gap-2">
                          <input type="color" value={globalSettings.formBgColor} onChange={(e) => setGlobalSettings({ ...globalSettings, formBgColor: e.target.value })} className="w-10 h-10 border-none rounded cursor-pointer" />
                          <input type="text" value={globalSettings.formBgColor} onChange={(e) => setGlobalSettings({ ...globalSettings, formBgColor: e.target.value })} className="flex-1 p-2 border dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded outline-none text-xs font-mono text-gray-900 dark:text-white" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Formulaire (Texte)</label>
                        <div className="flex gap-2">
                          <input type="color" value={globalSettings.formTextColor} onChange={(e) => setGlobalSettings({ ...globalSettings, formTextColor: e.target.value })} className="w-10 h-10 border-none rounded cursor-pointer" />
                          <input type="text" value={globalSettings.formTextColor} onChange={(e) => setGlobalSettings({ ...globalSettings, formTextColor: e.target.value })} className="flex-1 p-2 border dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded outline-none text-xs font-mono text-gray-900 dark:text-white" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section Footer & Autres */}
                  <div className="space-y-6">
                    <h4 className="text-xs font-bold uppercase text-primary tracking-widest">Pied de page</h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Footer (Fond)</label>
                        <div className="flex gap-2">
                          <input type="color" value={globalSettings.tertiaryColor} onChange={(e) => setGlobalSettings({ ...globalSettings, tertiaryColor: e.target.value })} className="w-10 h-10 border-none rounded cursor-pointer" />
                          <input type="text" value={globalSettings.tertiaryColor} onChange={(e) => setGlobalSettings({ ...globalSettings, tertiaryColor: e.target.value })} className="flex-1 p-2 border dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded outline-none text-xs font-mono text-gray-900 dark:text-white" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Footer (Texte)</label>
                        <div className="flex gap-2">
                          <input type="color" value={globalSettings.footerTextColor} onChange={(e) => setGlobalSettings({ ...globalSettings, footerTextColor: e.target.value })} className="w-10 h-10 border-none rounded cursor-pointer" />
                          <input type="text" value={globalSettings.footerTextColor} onChange={(e) => setGlobalSettings({ ...globalSettings, footerTextColor: e.target.value })} className="flex-1 p-2 border dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded outline-none text-xs font-mono text-gray-900 dark:text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-10 p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-dashed dark:border-gray-700">
                  <h4 className="text-xs font-bold uppercase text-gray-400 mb-6 tracking-widest text-center">Aperçu direct de la palette</h4>
                  <div className="flex flex-wrap gap-8 justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full shadow-lg border-2 border-white" style={{ backgroundColor: globalSettings.primaryColor }}></div>
                      <span className="text-[10px] font-bold text-gray-500">Header</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full shadow-lg border-2 border-white" style={{ backgroundColor: globalSettings.secondaryColor }}></div>
                      <span className="text-[10px] font-bold text-gray-500">Body</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full shadow-lg border-2 border-white" style={{ backgroundColor: globalSettings.cardColor }}></div>
                      <span className="text-[10px] font-bold text-gray-500">Card</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full shadow-lg border-2 border-white" style={{ backgroundColor: globalSettings.formBgColor }}></div>
                      <span className="text-[10px] font-bold text-gray-500">Form</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full shadow-lg border-2 border-white" style={{ backgroundColor: globalSettings.tertiaryColor }}></div>
                      <span className="text-[10px] font-bold text-gray-500">Footer</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button type="submit" className="bg-primary text-white px-10 py-3 rounded-xl font-bold hover:opacity-90 transition shadow-lg shadow-primary/20">
                  Enregistrer et Appliquer partout
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Modals for Block Management */}
      {blockActionModal.isOpen && blockActionModal.block && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">
                {blockActionModal.action === 'delete' ? 'Supprimer le bloc ?' : 
                 (blockActionModal.block.isActive ? 'Désactiver le bloc ?' : 'Activer le bloc ?')}
              </h3>
              <p className="text-gray-500 mb-6">
                {blockActionModal.action === 'delete' 
                  ? 'Cette action est irréversible. Voulez-vous vraiment supprimer ce bloc de contenu ?'
                  : `Le bloc sera ${blockActionModal.block.isActive ? 'masqué' : 'visible'} sur la page produit.`}
              </p>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setBlockActionModal({ isOpen: false, action: 'delete', block: null })}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold"
                >
                  Annuler
                </button>
                <button 
                  onClick={async () => {
                    const block = blockActionModal.block;
                    if (blockActionModal.action === 'delete') {
                      await fetch(`http://127.0.0.1:8000/api/product_blocks/${block.id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                      });
                      toast.success("Bloc supprimé");
                    } else {
                      await fetch(`http://127.0.0.1:8000/api/product_blocks/${block.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/merge-patch+json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({ isActive: !block.isActive })
                      });
                      toast.success(block.isActive ? "Bloc désactivé" : "Bloc activé");
                    }
                    setBlockActionModal({ isOpen: false, action: 'delete', block: null });
                    fetchProductBlocks(managingBlocksProductId!);
                  }}
                  className={`px-4 py-2 rounded-lg text-white font-bold ${
                    blockActionModal.action === 'delete' ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:opacity-90'
                  }`}
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Image Selection from Product Images */}
      {imageSelectorOpenForBlock !== null && managingBlocksProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-6 border-b dark:border-gray-800 flex justify-between items-center">
              <h3 className="text-xl font-bold">Choisir une image du produit</h3>
              <button onClick={() => setImageSelectorOpenForBlock(null)} className="text-gray-500 hover:text-gray-800 font-bold text-xl">&times;</button>
            </div>
            <div className="p-6 overflow-y-auto">
              {!managingBlocksProduct.images || managingBlocksProduct.images.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Ce produit n'a aucune image téléchargée.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {managingBlocksProduct.images.map((img: string, idx: number) => (
                    <button 
                      key={idx}
                      onClick={async () => {
                        if (imageSelectorOpenForBlock === 'new') {
                          // Find the input element by name 'image' and set its value
                          const imgInput = document.querySelector('input[name="image"]') as HTMLInputElement;
                          if (imgInput) imgInput.value = img;
                          toast.success("Image sélectionnée pour le nouveau bloc");
                        } else {
                          // Update existing block
                          await fetch(`http://127.0.0.1:8000/api/product_blocks/${imageSelectorOpenForBlock}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/merge-patch+json', 'Authorization': `Bearer ${token}` },
                            body: JSON.stringify({ image: img })
                          });
                          toast.success("Image du bloc mise à jour");
                          fetchProductBlocks(managingBlocksProductId!);
                        }
                        setImageSelectorOpenForBlock(null);
                      }}
                      className="group relative aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-primary focus:border-primary focus:outline-none transition-all"
                    >
                      <img src={img} alt={`Product ${idx}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <span className="text-white opacity-0 group-hover:opacity-100 font-bold drop-shadow-md">Choisir</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end">
               <button 
                  onClick={() => setImageSelectorOpenForBlock(null)}
                  className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 font-bold"
                >
                  Fermer
                </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal Confirmation Suppression Thème */}
      {themeDeleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600 dark:text-red-400">
                <Archive size={40} />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Supprimer le thème ?</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8">
                Êtes-vous sûr de vouloir supprimer le thème <span className="font-bold text-gray-900 dark:text-white">"{themeDeleteModal.themeName}"</span> ? Cette action est irréversible.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setThemeDeleteModal({ isOpen: false, themeId: null, themeName: "" })}
                  className="flex-1 py-4 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={() => themeDeleteModal.themeId && handleDeleteTheme(themeDeleteModal.themeId)}
                  className="flex-1 py-4 rounded-2xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
