import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Download,
  PackageSearch,
  Printer,
  ReceiptText,
  WalletCards,
} from "lucide-react";
import {
  downloadCsv,
  getDateRange,
  isInsideDateRange,
  money,
  readSettings,
  readStore,
} from "../utils/storage";

const filterOptions = [
  ["today", "Today"],
  ["yesterday", "Yesterday"],
  ["week", "Week"],
  ["month", "Month"],
  ["year", "Year"],
  ["all", "All"],
  ["custom", "Custom"],
];

function Reports() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [sales, setSales] = useState([]);
  const [dateFilter, setDateFilter] = useState("today");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [historySearch, setHistorySearch] = useState("");
  const [reportPreview, setReportPreview] = useState(null);

  useEffect(() => {
    const load = () => {
      setProducts(readStore("products"));
      setCustomers(readStore("customers"));
      setPayments(readStore("payments"));
      setSales(readStore("sales"));
    };
    load();
    window.addEventListener("pos-data-change", load);
    return () => window.removeEventListener("pos-data-change", load);
  }, []);

  const range = useMemo(
    () => getDateRange(dateFilter, customFrom, customTo),
    [customFrom, customTo, dateFilter]
  );

  const filteredSales = useMemo(
    () => sales.filter((sale) => isInsideDateRange(sale.date, range)),
    [range, sales]
  );

  const filteredPayments = useMemo(
    () => payments.filter((payment) => isInsideDateRange(payment.date, range)),
    [payments, range]
  );

  const billHistory = useMemo(() => {
    const keyword = historySearch.trim().toLowerCase();
    if (!keyword) return filteredSales;
    return filteredSales.filter((sale) =>
      [sale.invoiceNo, sale.customerName, sale.date, sale.isCredit ? "credit" : "cash"]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    );
  }, [filteredSales, historySearch]);

  const summary = useMemo(() => {
    const totalSales = filteredSales.reduce((sum, sale) => sum + Number(sale.total || 0), 0);
    const totalCreditSales = filteredSales
      .filter((sale) => sale.isCredit)
      .reduce((sum, sale) => sum + Number(sale.creditBalance || 0), 0);
    const totalCashSales = filteredSales
      .filter((sale) => !sale.isCredit)
      .reduce((sum, sale) => sum + Number(sale.total || 0), 0);
    const pendingCredit = customers.reduce((sum, customer) => sum + Number(customer.credit || 0), 0);
    const totalCollected = filteredPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const lowStock = products.filter((product) => Number(product.stock || 0) <= Number(product.minStock || 0));
    const expired = products.filter((product) => product.expiry && new Date(product.expiry) < new Date());

    return {
      totalSales,
      totalCreditSales,
      totalCashSales,
      pendingCredit,
      totalCollected,
      lowStock,
      expired,
    };
  }, [customers, filteredPayments, filteredSales, products]);

  const cards = [
    { label: "Sales", value: `Rs. ${money(summary.totalSales)}`, icon: ReceiptText, color: "text-blue-700" },
    { label: "Cash Sales", value: `Rs. ${money(summary.totalCashSales)}`, icon: ReceiptText, color: "text-green-700" },
    { label: "Credit Sales", value: `Rs. ${money(summary.totalCreditSales)}`, icon: WalletCards, color: "text-red-700" },
    { label: "Collected", value: `Rs. ${money(summary.totalCollected)}`, icon: ReceiptText, color: "text-amber-700" },
  ];

  const exportSales = () => {
    downloadCsv("sales-report.csv", [
      ["Invoice", "Customer", "Type", "Date", "Total", "Paid", "Credit"],
      ...filteredSales.map((sale) => [
        sale.invoiceNo,
        sale.customerName,
        sale.isCredit ? "Credit" : "Cash",
        sale.date,
        sale.total,
        sale.cash,
        sale.creditBalance,
      ]),
    ]);
  };

  const exportStock = () => {
    downloadCsv("stock-report.csv", [
      ["Product", "Sinhala", "Category", "Brand", "Batch", "Stock", "Min Stock", "Expiry"],
      ...products.map((product) => [
        product.name,
        product.sinhala,
        product.category,
        product.brand,
        product.batch,
        product.stock,
        product.minStock,
        product.expiry,
      ]),
    ]);
  };

  const exportCredit = () => {
    downloadCsv("credit-report.csv", [
      ["Customer", "Phone", "NIC", "Address", "Due"],
      ...customers.map((customer) => [
        customer.name,
        customer.phone,
        customer.nic,
        customer.address,
        customer.credit,
      ]),
    ]);
  };

  const stockReportRows = [
    ["Product", "Category", "Brand", "Batch", "Stock", "Min Stock", "Expiry"],
    ...products.map((product) => [
      product.name,
      product.category,
      product.brand,
      product.batch,
      product.stock,
      product.minStock,
      product.expiry,
    ]),
  ];

  const creditReportRows = [
    ["Customer", "Phone", "NIC", "Address", "Due"],
    ...customers.map((customer) => [
      customer.name,
      customer.phone,
      customer.nic,
      customer.address,
      `Rs. ${money(customer.credit)}`,
    ]),
  ];

  const openReportPreview = (title, rows) => {
    setReportPreview({ title, rows, settings: readSettings(), generatedAt: new Date().toLocaleString() });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
            Analytics
          </p>
          <h1 className="text-3xl font-bold text-slate-950">Reports</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportSales} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800">
            <Download size={17} />
            Sales CSV
          </button>
          <button onClick={exportStock} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800">
            <Download size={17} />
            Stock CSV
          </button>
          <button onClick={exportCredit} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800">
            <Download size={17} />
            Credit CSV
          </button>
          <button onClick={() => openReportPreview("Stock Report", stockReportRows)} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50">
            <Printer size={17} />
            Stock PDF
          </button>
          <button onClick={() => openReportPreview("Credit Report", creditReportRows)} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50">
            <Printer size={17} />
            Credit PDF
          </button>
        </div>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-3 xl:grid-cols-[1fr_auto_auto] xl:items-end">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Date filter</label>
            <div className="flex flex-wrap gap-2">
              {filterOptions.map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setDateFilter(value)}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                    dateFilter === value
                      ? "bg-green-700 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {dateFilter === "custom" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <input type="date" value={customFrom} onChange={(event) => setCustomFrom(event.target.value)} className="input" />
              <input type="date" value={customTo} onChange={(event) => setCustomTo(event.target.value)} className="input" />
            </div>
          )}

          <button
            onClick={() =>
              openReportPreview("Sales Report", [
                ["Invoice", "Customer", "Type", "Date", "Total"],
                ...filteredSales.map((sale) => [
                  sale.invoiceNo,
                  sale.customerName,
                  sale.isCredit ? "Credit" : "Cash",
                  sale.date,
                  `Rs. ${money(sale.total)}`,
                ]),
              ])
            }
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-800 hover:bg-slate-50"
          >
            <Printer size={17} />
            PDF / Print
          </button>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <section key={card.label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <Icon className={card.color} size={26} />
              <p className="mt-3 text-sm font-semibold text-slate-500">{card.label}</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-950">{card.value}</h2>
            </section>
          );
        })}
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-950">Bill History</h2>
            <p className="text-sm text-slate-500">Cash Customer සහ credit customers දෙකම මෙතැනින් filter කරලා බලන්න පුළුවන්.</p>
          </div>
          <input
            value={historySearch}
            onChange={(event) => setHistorySearch(event.target.value)}
            placeholder="Invoice, customer, cash, credit..."
            className="input w-full sm:w-80"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-3">Invoice</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Date</th>
                <th>Items</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {billHistory.length === 0 ? (
                <tr><td className="py-4 text-slate-500" colSpan="6">No bills for this filter.</td></tr>
              ) : (
                billHistory.map((sale) => (
                  <tr key={sale.id} className="border-b border-slate-100 align-top">
                    <td className="py-3 font-semibold text-slate-950">{sale.invoiceNo}</td>
                    <td>{sale.customerName}</td>
                    <td>{sale.isCredit ? "Credit" : "Cash"}</td>
                    <td>{sale.date}</td>
                    <td>
                      <div className="max-w-sm space-y-1">
                        {sale.cart?.map((item) => (
                          <p key={item.id || `${sale.id}-${item.name}`} className="text-slate-600">
                            {item.name} - {item.qty} x {item.unitLabel}
                          </p>
                        ))}
                      </div>
                    </td>
                    <td className="text-right font-bold">Rs. {money(sale.total)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-slate-950">Payment History</h2>
          <div className="space-y-3">
            {filteredPayments.length === 0 ? (
              <p className="text-slate-500">No payment history for this filter.</p>
            ) : (
              filteredPayments.slice(0, 12).map((payment) => (
                <div key={payment.id} className="flex justify-between rounded-lg border border-slate-100 p-3">
                  <div>
                    <h3 className="font-bold text-slate-950">{payment.customer}</h3>
                    <p className="text-sm text-slate-500">{payment.date}</p>
                  </div>
                  <p className="font-bold text-green-700">Rs. {money(payment.amount)}</p>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-red-700">
            <AlertTriangle size={22} />
            Expired Products
          </h2>
          <div className="space-y-3">
            {summary.expired.length === 0 ? (
              <p className="text-slate-500">No expired products.</p>
            ) : (
              summary.expired.map((product) => (
                <div key={product.id} className="flex justify-between rounded-lg border border-slate-100 p-3">
                  <div>
                    <h3 className="font-bold text-slate-950">{product.name}</h3>
                    <p className="text-sm text-slate-500">{product.sinhala}</p>
                  </div>
                  <p className="font-bold text-red-700">{product.expiry}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-amber-700">
          <PackageSearch size={22} />
          Low Stock
        </h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {summary.lowStock.length === 0 ? (
            <p className="text-slate-500">No low stock products.</p>
          ) : (
            summary.lowStock.map((product) => (
              <div key={product.id} className="rounded-lg border border-slate-100 p-3">
                <h3 className="font-bold text-slate-950">{product.name}</h3>
                <p className="text-sm text-slate-500">{product.category || "Uncategorized"}</p>
                <p className="font-bold text-amber-700">Stock {money(product.stock)}</p>
              </div>
            ))
          )}
        </div>
      </section>

      {reportPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-auto rounded-lg bg-white p-5 shadow-2xl">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <h2 className="text-xl font-bold text-slate-950">Report Preview</h2>
              <div className="flex gap-2">
                <button onClick={() => window.print()} className="rounded-lg bg-green-700 px-4 py-2 font-semibold text-white hover:bg-green-800">
                  Print / Save PDF
                </button>
                <button onClick={() => setReportPreview(null)} className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50">
                  Close
                </button>
              </div>
            </div>

            <div id="report-print" className="bg-white p-6 text-slate-950">
              <div className="mb-6 flex items-center gap-4 border-b-4 border-green-700 pb-4">
                {reportPreview.settings.logo && (
                  <img src={reportPreview.settings.logo} alt="Logo" className="h-16 w-16 rounded-lg object-contain" />
                )}
                <div>
                  <h1 className="text-3xl font-bold text-green-800">{reportPreview.settings.shopName}</h1>
                  <p>{reportPreview.settings.address}</p>
                  <p>{reportPreview.settings.phone}</p>
                </div>
              </div>
              <div className="mb-5 flex flex-wrap justify-between gap-3">
                <h2 className="text-2xl font-bold">{reportPreview.title}</h2>
                <p className="text-sm text-slate-500">Generated: {reportPreview.generatedAt}</p>
              </div>
              <table className="w-full border-collapse text-sm">
                <tbody>
                  {reportPreview.rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className={rowIndex === 0 ? "bg-green-700 text-white" : "even:bg-green-50"}>
                      {row.map((cell, cellIndex) => (
                        <td key={`${rowIndex}-${cellIndex}`} className="border border-slate-200 p-2">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;
