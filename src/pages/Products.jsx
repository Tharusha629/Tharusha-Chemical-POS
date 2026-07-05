import { useEffect, useMemo, useState } from "react";
import { Edit3, PackagePlus, Search, Trash2 } from "lucide-react";
import {
  getProductUnitOptions,
  matchesSearch,
  money,
  readStore,
  writeStore,
} from "../utils/storage";

const emptyProduct = {
  id: "",
  name: "",
  sinhala: "",
  aliases: "",
  category: "",
  brand: "",
  batch: "",
  expiry: "",
  buyingPrice: "",
  labeledPrice: "",
  discount: "",
  type: "normal",
  bag50: "",
  bag25: "",
  bag10: "",
  stock: "",
  loosePrice: "",
  minStock: "5",
  packet50g: "",
  packet100g: "",
  packet200g: "",
  packet500g: "",
  packet1kg: "",
  bottle50ml: "",
  bottle100ml: "",
  bottle200ml: "",
  bottle500ml: "",
  bottle1l: "",
  customUnits: "",
};

function Products() {
  const [product, setProduct] = useState(emptyProduct);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    setProducts(readStore("products"));
  }, []);

  const filteredProducts = useMemo(
    () => products.filter((item) => matchesSearch(item, search)),
    [products, search]
  );

  const handleChange = (event) => {
    setProduct((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const resetForm = () => {
    setProduct(emptyProduct);
    setEditId(null);
  };

  const handleSave = () => {
    if (!product.name.trim()) {
      alert("Product name is required");
      return;
    }

    if (Number(product.stock || 0) < 0) {
      alert("Stock cannot be negative");
      return;
    }

    const existing = readStore("products");
    const normalized = {
      ...product,
      id: editId || product.id || crypto.randomUUID(),
      aliases: product.aliases.trim(),
      stock: String(Number(product.stock || 0)),
      discount: String(Number(product.discount || 0)),
      minStock: String(Number(product.minStock || 0)),
    };

    const updated = editId
      ? existing.map((item) => (item.id === editId ? normalized : item))
      : [normalized, ...existing];

    writeStore("products", updated);
    setProducts(updated);
    resetForm();
    alert(editId ? "Product updated successfully" : "Product saved successfully");
  };

  const editProduct = (item) => {
    setProduct({ ...emptyProduct, ...item });
    setEditId(item.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteProduct = (id) => {
    if (!confirm("Delete this product?")) return;
    const updated = products.filter((item) => item.id !== id);
    writeStore("products", updated);
    setProducts(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
            Inventory
          </p>
          <h1 className="text-3xl font-bold text-slate-950">
            Product Management
          </h1>
        </div>
        <button
          onClick={resetForm}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
        >
          <PackagePlus size={18} />
          New Product
        </button>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 grid gap-4 md:grid-cols-4">
          <input name="name" placeholder="Product Name" value={product.name} onChange={handleChange} className="input" />
          <input name="sinhala" placeholder="Sinhala Name" value={product.sinhala} onChange={handleChange} className="input" />
          <input name="aliases" placeholder="Aliases: wartako, virtako" value={product.aliases} onChange={handleChange} className="input md:col-span-2" />
          <input name="category" placeholder="Category" value={product.category} onChange={handleChange} className="input" />
          <input name="brand" placeholder="Brand" value={product.brand} onChange={handleChange} className="input" />
          <input name="batch" placeholder="Batch Number" value={product.batch} onChange={handleChange} className="input" />
          <input type="date" name="expiry" value={product.expiry} onChange={handleChange} className="input" />
          <input type="number" name="buyingPrice" placeholder="Buying Price" value={product.buyingPrice} onChange={handleChange} className="input" />
          <input type="number" name="labeledPrice" placeholder="Labeled Price" value={product.labeledPrice} onChange={handleChange} className="input" />
          <input type="number" name="discount" placeholder="Discount %" value={product.discount} onChange={handleChange} className="input" />
          <input type="number" name="stock" placeholder="Stock Qty (pieces) / KG for fertilizer" value={product.stock} onChange={handleChange} className="input" />
          <input type="number" name="minStock" placeholder="Min Stock Alert" value={product.minStock} onChange={handleChange} className="input" />
          <select name="type" value={product.type} onChange={handleChange} className="input">
            <option value="normal">Normal Product</option>
            <option value="fertilizer">Fertilizer / Loose KG</option>
            <option value="packet">Packet Sizes</option>
            <option value="bottle">Bottle Sizes</option>
          </select>
        </div>

        {product.type === "fertilizer" && (
          <div className="mb-5 grid gap-4 rounded-lg bg-emerald-50 p-4 md:grid-cols-4">
            <input type="number" name="bag50" placeholder="50KG Bag Price" value={product.bag50} onChange={handleChange} className="input" />
            <input type="number" name="bag25" placeholder="25KG Bag Price" value={product.bag25} onChange={handleChange} className="input" />
            <input type="number" name="bag10" placeholder="10KG Bag Price" value={product.bag10} onChange={handleChange} className="input" />
            <input type="number" name="loosePrice" placeholder="1KG Loose Price" value={product.loosePrice} onChange={handleChange} className="input" />
          </div>
        )}

        {product.type === "packet" && (
          <div className="mb-5 grid gap-4 rounded-lg bg-blue-50 p-4 md:grid-cols-5">
            <input type="number" name="packet50g" placeholder="50g Price" value={product.packet50g} onChange={handleChange} className="input" />
            <input type="number" name="packet100g" placeholder="100g Price" value={product.packet100g} onChange={handleChange} className="input" />
            <input type="number" name="packet200g" placeholder="200g Price" value={product.packet200g} onChange={handleChange} className="input" />
            <input type="number" name="packet500g" placeholder="500g Price" value={product.packet500g} onChange={handleChange} className="input" />
            <input type="number" name="packet1kg" placeholder="1KG Price" value={product.packet1kg} onChange={handleChange} className="input" />
          </div>
        )}

        {product.type === "bottle" && (
          <div className="mb-5 grid gap-4 rounded-lg bg-amber-50 p-4 md:grid-cols-5">
            <input type="number" name="bottle50ml" placeholder="50ml Price" value={product.bottle50ml} onChange={handleChange} className="input" />
            <input type="number" name="bottle100ml" placeholder="100ml Price" value={product.bottle100ml} onChange={handleChange} className="input" />
            <input type="number" name="bottle200ml" placeholder="200ml Price" value={product.bottle200ml} onChange={handleChange} className="input" />
            <input type="number" name="bottle500ml" placeholder="500ml Price" value={product.bottle500ml} onChange={handleChange} className="input" />
            <input type="number" name="bottle1l" placeholder="1L Price" value={product.bottle1l} onChange={handleChange} className="input" />
          </div>
        )}

        <div className="mb-5 rounded-lg bg-slate-50 p-4">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Extra custom units (optional)
          </label>
          <textarea
            name="customUnits"
            placeholder={"One unit per line: label, stock deduct qty, price\nExample: 250g Packet, 1, 950\nExample: 2L Bottle, 1, 4200"}
            value={product.customUnits}
            onChange={handleChange}
            className="input min-h-28 w-full"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button onClick={handleSave} className="rounded-lg bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800">
            {editId ? "Update Product" : "Save Product"}
          </button>
          {editId && (
            <button onClick={resetForm} className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
          )}
        </div>
      </section>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Search Sinhala, Singlish, English, brand, batch..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white py-4 pl-12 pr-4 shadow-sm outline-none focus:border-green-600"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {filteredProducts.map((item) => {
          const lowStock = Number(item.stock || 0) <= Number(item.minStock || 0);
          return (
            <article key={item.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-950">{item.name}</h2>
                  <p className="text-slate-500">{item.sinhala || "No Sinhala name"}</p>
                  <p className="mt-1 text-sm text-slate-400">{item.category || "Uncategorized"} | {item.brand || "No brand"} | Batch {item.batch || "-"}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-sm font-semibold ${lowStock ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                  Stock {money(item.stock)}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {getProductUnitOptions(item).map((unit) => (
                  <span key={unit.label} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                    {unit.label}: Rs. {money(unit.price)}
                  </span>
                ))}
              </div>

              <div className="mt-5 flex justify-end gap-3">
                <button onClick={() => editProduct(item)} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">
                  <Edit3 size={16} />
                  Edit
                </button>
                <button onClick={() => deleteProduct(item.id)} className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700">
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default Products;
