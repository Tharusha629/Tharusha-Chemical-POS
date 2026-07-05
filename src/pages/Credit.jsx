import { useEffect, useMemo, useState } from "react";
import { Banknote, Search } from "lucide-react";
import { makeId, money, readStore, writeStore } from "../utils/storage";

function Credit() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [payment, setPayment] = useState("");

  useEffect(() => {
    setCustomers(readStore("customers"));
  }, []);

  const creditCustomers = useMemo(
    () => customers.filter((customer) => Number(customer.credit || 0) > 0),
    [customers]
  );

  const filteredCustomers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return creditCustomers.filter((customer) =>
      [customer.name, customer.phone]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    );
  }, [creditCustomers, search]);

  const collectPayment = () => {
    if (!selectedCustomer || Number(payment || 0) <= 0) {
      alert("Enter payment amount");
      return;
    }

    const amount = Number(payment);
    const updatedCustomers = customers.map((customer) => {
      if (customer.id !== selectedCustomer.id) return customer;
      return {
        ...customer,
        credit: String(Math.max(Number(customer.credit || 0) - amount, 0)),
      };
    });

    const history = [
      {
        id: makeId("payment"),
        customerId: selectedCustomer.id,
        customer: selectedCustomer.name,
        amount,
        date: new Date().toLocaleString(),
      },
      ...readStore("payments"),
    ];

    writeStore("customers", updatedCustomers);
    writeStore("payments", history);
    setCustomers(updatedCustomers);
    setSelectedCustomer(null);
    setPayment("");
    alert("Payment collected successfully");
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
          Ledger
        </p>
        <h1 className="text-3xl font-bold text-slate-950">Credit Collection</h1>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Search credit customer..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white py-4 pl-12 pr-4 shadow-sm outline-none focus:border-green-600"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="grid gap-4 md:grid-cols-2">
          {filteredCustomers.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white p-6 text-slate-500 shadow-sm">
              No pending credit customers.
            </div>
          ) : (
            filteredCustomers.map((customer) => (
              <button
                key={customer.id}
                onClick={() => setSelectedCustomer(customer)}
                className={`rounded-lg border p-5 text-left shadow-sm transition ${
                  selectedCustomer?.id === customer.id
                    ? "border-green-600 bg-green-50"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <h2 className="text-xl font-bold text-slate-950">{customer.name}</h2>
                <p className="text-slate-500">{customer.phone || "No phone"}</p>
                <p className="mt-3 text-lg font-bold text-red-700">Due Rs. {money(customer.credit)}</p>
              </button>
            ))
          )}
        </section>

        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-950">
            <Banknote size={22} />
            Collect Payment
          </h2>

          {selectedCustomer ? (
            <>
              <p className="font-semibold text-slate-800">{selectedCustomer.name}</p>
              <p className="mb-4 text-red-700">Current Due: Rs. {money(selectedCustomer.credit)}</p>
              <input
                type="number"
                placeholder="Payment Amount"
                value={payment}
                onChange={(event) => setPayment(event.target.value)}
                className="input mb-4 w-full"
              />
              <button onClick={collectPayment} className="w-full rounded-lg bg-green-700 p-4 font-bold text-white hover:bg-green-800">
                Collect Payment
              </button>
            </>
          ) : (
            <p className="text-slate-500">Select a customer to collect payment.</p>
          )}
        </aside>
      </div>
    </div>
  );
}

export default Credit;
