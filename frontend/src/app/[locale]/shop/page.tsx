import ShopClient from "./ShopClient";

export const metadata = {
  title: "Boutique | Custom Shop",
};

async function getCategories() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/categories", { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data['hydra:member'] || [];
  } catch (e) {
    return [
      { id: 1, name: "Électronique" },
      { id: 2, name: "Mode" },
      { id: 3, name: "Maison" }
    ];
  }
}

export default async function ShopPage() {
  const categories = await getCategories();

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Tous nos produits</h1>
      </div>
      
      <ShopClient categories={categories} />
    </div>
  );
}
