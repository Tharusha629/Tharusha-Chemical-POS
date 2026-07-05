import { useEffect, useMemo, useState } from "react";
import { Minus, Plus, Printer, Search, ShoppingCart } from "lucide-react";
import BillPrint from "../components/BillPrint";
import {
  getCartLineTotal,
  getCartStockQty,
  getProductUnitOptions,
  makeId,
  matchesSearch,
  money,
  readSettings,
  readStore,
  writeStore,
} from "../utils/storage";

function Billing() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [cash, setCash] = useState("");
  const [isCredit, setIsCredit] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [lastInvoice, setLastInvoice] = useState(null);
  const [previewInvoice, setPreviewInvoice] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setProducts(readStore("products"));
    setCustomers(readStore("customers"));
  };

  const filteredProducts = useMemo(
    () => products.filter((product) => matchesSearch(product, search)).slice(0, 8),
    [products, search]
  );

  const subtotal = cart.reduce((sum, item) => sum + getCartLineTotal(item), 0);
  const change = Math.max(Number(cash || 0) - subtotal, 0);
  const creditBalance = isCredit ? subtotal - Number(cash || 0) : 0;

  const getReservedStock = (productId, cartItemId = "") =>
    cart
      .filter((item) => item.productId === productId && item.id !== cartItemId)
      .reduce((sum, item) => sum + getCartStockQty(item), 0);

  const addToCart = (product, unit) => {
    const available = Number(product.stock || 0) - getReservedStock(product.id);
    if (available < unit.stockQty) {
      alert("Not enough stock for this unit");
      return;
    }

    const existing = cart.find(
      (item) => item.productId === product.id && item.unitLabel === unit.label
    );

    if (existing) {
      increaseQty(existing.id);
      return;
    }

    setCart((current) => [
      ...current,
      {
        id: makeId("cart"),
        productId: product.id,
        name: product.name,
        sinhala: product.sinhala,
        unitLabel: unit.label,
        stockQty: unit.stockQty,
        unitPrice: unit.price,
        qty: 1,
      },
    ]);
    setSearch("");
  };

  const increaseQty = (cartItemId) => {
    setCart((current) =>
      current.map((item) => {
        if (item.id !== cartItemId) return item;
        const product = products.find((entry) => entry.id === item.productId);
        const available = Number(product?.stock || 0) - getReservedStock(item.productId, item.id);
        const nextStockQty = (Number(item.qty) + 1) * Number(item.stockQty);

        if (nextStockQty > available) {
          alert("Not enough stock");
          return item;
        }

        return { ...item, qty: item.qty + 1 };
      })
    );
  };

  const decreaseQty = (cartItemId) => {
    setCart((current) =>
      current
        .map((item) =>
          item.id === cartItemId ? { ...item, qty: item.qty - 1 } : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const buildPrintableInvoice = (invoice = lastInvoice) =>
    invoice || {
      invoiceNo: "PREVIEW",
      cart,
      total: subtotal,
      cash,
      change,
      isCredit,
      customerName: customerName || "Cash Customer",
      creditBalance,
      date: new Date().toLocaleString(),
    };

  const openPreview = (invoice = lastInvoice) => {
    setPreviewInvoice(buildPrintableInvoice(invoice));
  };

  const printBill = async (invoice = lastInvoice) => {
    const printable = invoice || {
      invoiceNo: "PREVIEW",
      cart,
      total: subtotal,
      cash,
      change,
      isCredit,
      customerName,
      creditBalance,
      date: new Date().toLocaleString(),
    };
    const settings = readSettings();
    const copies = settings.duplicateBillPrint ? 2 : 1;

    if (window.printerAPI?.printBill) {
      for (let copy = 0; copy < copies; copy += 1) {
        const result = await window.printerAPI.printBill({
          ...settings,
          ...printable,
          duplicateCopy: copy === 1,
        });
        if (result && result.ok === false) {
          alert(`Printer not ready: ${result.message}. Opening print preview instead.`);
          openPreview(printable);
          return;
        }
      }
    } else {
      openPreview(printable);
    }
  };

  const completeSale = () => {
    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }

    if (isCredit && !customerName.trim()) {
      alert("Customer name is required for credit sale");
      return;
    }

    if (!isCredit && Number(cash || 0) < subtotal) {
      alert("Cash amount is lower than total");
      return;
    }

    const currentProducts = readStore("products");
    const updatedProducts = currentProducts.map((product) => {
      const soldQty = cart
        .filter((item) => item.productId === product.id)
        .reduce((sum, item) => sum + getCartStockQty(item), 0);
      return soldQty > 0
        ? { ...product, stock: String(Number(product.stock || 0) - soldQty) }
        : product;
    });

    const invoice = {
      id: makeId("sale"),
      invoiceNo: `TC-${String(readStore("sales").length + 1).padStart(5, "0")}`,
      cart,
      total: subtotal,
      cash: Number(cash || 0),
      change,
      isCredit,
      customerName: customerName.trim() || "Cash Customer",
      creditBalance: Math.max(creditBalance, 0),
      date: new Date().toLocaleString(),
    };

    writeStore("products", updatedProducts);
    writeStore("sales", [invoice, ...readStore("sales")]);

    if (isCredit) {
      const currentCustomers = readStore("customers");
      const customerIndex = currentCustomers.findIndex(
        (item) => item.name.toLowerCase() === customerName.trim().toLowerCase()
      );
      const updatedCustomers = [...currentCustomers];

      if (customerIndex >= 0) {
        updatedCustomers[customerIndex] = {
          ...updatedCustomers[customerIndex],
          credit: String(Number(updatedCustomers[customerIndex].credit || 0) + invoice.creditBalance),
        };
      } else {
        updatedCustomers.unshift({
          id: crypto.randomUUID(),
          name: customerName.trim(),
          phone: "",
          address: "",
          credit: String(invoice.creditBalance),
        });
      }

      writeStore("customers", updatedCustomers);
    }

    setLastInvoice(invoice);
    setCart([]);
    setCash("");
    setIsCredit(false);
    setCustomerName("");
    loadData();
    alert(`Sale completed: ${invoice.invoiceNo}`);
    printBill(invoice);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
            Billing
          </p>
          <h1 className="text-3xl font-bold text-slate-950">New Sale</h1>
        </div>
        <button onClick={() => openPreview()} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-800 shadow-sm hover:bg-slate-50">
          <Printer size={18} />
          Print Preview
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search product by Sinhala, Singlish, English..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-lg border border-slate-200 py-4 pl-12 pr-4 outline-none focus:border-green-600"
            />
          </div>

          {search && (
            <div className="mb-5 overflow-hidden rounded-lg border border-slate-200">
              {filteredProducts.length === 0 && (
                <p className="p-4 text-slate-500">No matching products</p>
              )}
              {filteredProducts.map((product) => (
                <div key={product.id} className="border-b border-slate-100 p-4 last:border-b-0">
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-bold text-slate-950">{product.name}</h2>
                      <p className="text-sm text-slate-500">{product.sinhala}</p>
                    </div>
                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                      Stock {money(product.stock)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {getProductUnitOptions(product).map((unit) => (
                      <button
                        key={unit.label}
                        onClick={() => addToCart(product, unit)}
                        className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700"
                      >
                        {unit.label} - Rs. {money(unit.price)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-3">
            {cart.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 text-center text-slate-500">
                <ShoppingCart size={42} className="mb-3 text-slate-300" />
                <p className="font-semibold">Cart is empty</p>
                <p className="text-sm">Search and select a product unit to start billing.</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="grid gap-3 rounded-lg border border-slate-200 p-4 md:grid-cols-[1fr_auto_auto] md:items-center">
                  <div>
                    <h2 className="font-bold text-slate-950">{item.name}</h2>
                    <p className="text-sm text-slate-500">{item.unitLabel} | stock deduct {money(getCartStockQty(item))}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => decreaseQty(item.id)} className="icon-button bg-red-50 text-red-700 hover:bg-red-100"><Minus size={16} /></button>
                    <span className="w-10 text-center font-bold">{item.qty}</span>
                    <button onClick={() => increaseQty(item.id)} className="icon-button bg-green-50 text-green-700 hover:bg-green-100"><Plus size={16} /></button>
                  </div>
                  <p className="text-right text-lg font-bold text-slate-950">Rs. {money(getCartLineTotal(item))}</p>
                </div>
              ))
            )}
          </div>
        </section>

        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <span className="font-semibold text-slate-800">Credit Sale</span>
            <input type="checkbox" checked={isCredit} onChange={() => setIsCredit((value) => !value)} className="h-5 w-5 accent-green-700" />
          </div>

          {isCredit && (
            <>
              <input
                list="customer-list"
                placeholder="Customer Name"
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                className="input mb-4 w-full"
              />
              <datalist id="customer-list">
                {customers.map((customer) => (
                  <option key={customer.id || customer.name} value={customer.name} />
                ))}
              </datalist>
            </>
          )}

          <div className="space-y-3 rounded-lg bg-slate-50 p-4">
            <div className="flex justify-between text-slate-600">
              <span>Items</span>
              <span>{cart.length}</span>
            </div>
            <div className="flex justify-between text-2xl font-bold text-slate-950">
              <span>Total</span>
              <span>Rs. {money(subtotal)}</span>
            </div>
          </div>

          <input
            type="number"
            placeholder={isCredit ? "Paid Amount (optional)" : "Cash Given"}
            value={cash}
            onChange={(event) => setCash(event.target.value)}
            className="input mt-4 w-full"
          />

          <div className="my-5 space-y-2 text-lg font-semibold">
            {!isCredit && <p className="text-blue-700">Change: Rs. {money(change)}</p>}
            {isCredit && <p className="text-red-700">Credit Balance: Rs. {money(Math.max(creditBalance, 0))}</p>}
          </div>

          <button onClick={completeSale} className="mb-3 w-full rounded-lg bg-green-700 p-4 font-bold text-white hover:bg-green-800">
            Complete Sale
          </button>
          <button onClick={() => setCart([])} className="w-full rounded-lg border border-slate-300 p-4 font-bold text-slate-700 hover:bg-slate-50">
            Clear Cart
          </button>
        </aside>
      </div>

      {previewInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-auto rounded-lg bg-white p-5 shadow-2xl">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-950">Print Preview</h2>
                <p className="text-sm text-slate-500">{previewInvoice.invoiceNo}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => window.print()} className="rounded-lg bg-green-700 px-4 py-2 font-semibold text-white hover:bg-green-800">
                  Print
                </button>
                <button onClick={() => printBill(previewInvoice)} className="rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-800">
                  Thermal Print
                </button>
                <button onClick={() => setPreviewInvoice(null)} className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50">
                  Close
                </button>
              </div>
            </div>

            <div className="flex justify-center bg-slate-100 p-6">
              <BillPrint
                invoice={previewInvoice}
                cart={previewInvoice.cart}
                total={previewInvoice.total}
                cash={previewInvoice.cash}
                change={previewInvoice.change}
                isCredit={previewInvoice.isCredit}
                customerName={previewInvoice.customerName}
                creditBalance={previewInvoice.creditBalance}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Billing;
