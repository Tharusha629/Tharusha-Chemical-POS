import { getCartLineTotal, money, readSettings } from "../utils/storage";

function BillPrint({
  invoice,
  cart,
  total,
  cash,
  change,
  isCredit,
  customerName,
  creditBalance,
  duplicateCopy = false,
}) {
  const settings = readSettings();

  return (
    <div id="bill-print" className="w-[300px] bg-white p-4 font-mono text-sm text-black">
      <div className="mb-3 text-center">
        <h1 className="text-lg font-bold">{settings.shopName}</h1>
        <p>{settings.address}</p>
        <p>{settings.phone}</p>
        {duplicateCopy && (
          <p className="mt-2 border border-black py-1 text-xs font-bold">
            DUPLICATE COPY
          </p>
        )}
      </div>

      <hr className="mb-3 border-dashed border-black" />

      <div className="mb-3 text-xs">
        <p>Invoice: {invoice?.invoiceNo || "PREVIEW"}</p>
        <p>Date: {invoice?.date || new Date().toLocaleString()}</p>
        <p>Customer: {customerName || "Cash Customer"}</p>
      </div>

      <hr className="mb-3 border-dashed border-black" />

      {cart.map((item) => (
        <div key={item.id || `${item.name}-${item.unitLabel}`} className="mb-2">
          <p>{item.name}</p>
          {item.sinhala && <p className="text-xs">{item.sinhala}</p>}
          <div className="flex justify-between">
            <span>{item.qty} x {item.unitLabel} x {money(item.unitPrice)}</span>
            <span>{money(getCartLineTotal(item))}</span>
          </div>
        </div>
      ))}

      <hr className="my-3 border-dashed border-black" />

      <div className="space-y-1">
        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span>Rs. {money(total)}</span>
        </div>
        <div className="flex justify-between">
          <span>Paid</span>
          <span>Rs. {money(cash)}</span>
        </div>
        {!isCredit && (
          <div className="flex justify-between">
            <span>Change</span>
            <span>Rs. {money(change)}</span>
          </div>
        )}
        {isCredit && (
          <div className="flex justify-between">
            <span>Credit</span>
            <span>Rs. {money(creditBalance)}</span>
          </div>
        )}
      </div>

      <hr className="my-3 border-dashed border-black" />

      <p className="text-center">{settings.billFooter}</p>
    </div>
  );
}

export default BillPrint;
