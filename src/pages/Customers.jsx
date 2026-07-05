import { useEffect, useMemo, useState } from "react";
import { Edit3, Search, Trash2, UserPlus } from "lucide-react";
import { money, readStore, writeStore } from "../utils/storage";

const emptyCustomer = {
  id: "",
  name: "",
  phone: "",
  nic: "",
  address: "",
  credit: "",
};

function Customers() {
  const [customer, setCustomer] = useState(emptyCustomer);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    setCustomers(readStore("customers"));
  }, []);

  const filteredCustomers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return customers;
    return customers.filter((item) =>
      [item.name, item.phone, item.nic, item.address]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    );
  }, [customers, search]);

  const handleChange = (event) => {
    setCustomer((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const resetForm = () => {
    setCustomer(emptyCustomer);
    setEditId(null);
  };

  const handleSave = () => {
    if (!customer.name.trim()) {
      alert("Customer name is required");
      return;
    }

    const existing = readStore("customers");
    const normalized = {
      ...customer,
      id: editId || customer.id || crypto.randomUUID(),
      credit: String(Number(customer.credit || 0)),
    };

    const updated = editId
      ? existing.map((item) => (item.id === editId ? normalized : item))
      : [normalized, ...existing];

    writeStore("customers", updated);
    setCustomers(updated);
    resetForm();
    alert(editId ? "Customer updated successfully" : "Customer saved successfully");
  };

  const editCustomer = (item) => {
    setCustomer({ ...emptyCustomer, ...item });
    setEditId(item.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteCustomer = (id) => {
    if (!confirm("Delete this customer?")) return;
    const updated = customers.filter((item) => item.id !== id);
    writeStore("customers", updated);
    setCustomers(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
            Farmers
          </p>
          <h1 className="text-3xl font-bold text-slate-950">Customers</h1>
        </div>
        <button onClick={resetForm} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800">
          <UserPlus size={18} />
          New Customer
        </button>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <input name="name" placeholder="Customer Name" value={customer.name} onChange={handleChange} className="input" />
          <input name="phone" placeholder="Phone Number" value={customer.phone} onChange={handleChange} className="input" />
          <input name="nic" placeholder="NIC (optional)" value={customer.nic} onChange={handleChange} className="input md:col-span-2" />
          <input name="address" placeholder="Address" value={customer.address} onChange={handleChange} className="input md:col-span-2" />
          <input type="number" name="credit" placeholder="Current Credit Balance" value={customer.credit} onChange={handleChange} className="input md:col-span-2" />
        </div>

        <div className="mt-5 flex gap-3">
          <button onClick={handleSave} className="rounded-lg bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800">
            {editId ? "Update Customer" : "Save Customer"}
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
          placeholder="Search customer, phone, NIC, address..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white py-4 pl-12 pr-4 shadow-sm outline-none focus:border-green-600"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {filteredCustomers.map((item) => (
          <article key={item.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-950">{item.name}</h2>
                <p className="text-slate-500">{item.phone || "No phone"}</p>
                <p className="text-sm text-slate-500">NIC: {item.nic || "-"}</p>
                <p className="text-sm text-slate-400">{item.address || "No address"}</p>
              </div>
              <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-bold text-red-700">
                Due Rs. {money(item.credit)}
              </span>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={() => editCustomer(item)} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">
                <Edit3 size={16} />
                Edit
              </button>
              <button onClick={() => deleteCustomer(item.id)} className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700">
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default Customers;
