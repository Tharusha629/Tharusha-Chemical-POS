const escpos = require("escpos");
escpos.USB = require("escpos-usb");

const money = (value) => Number(value || 0).toFixed(2);

function printBill(data) {
  return new Promise((resolve, reject) => {
    try {
      const device = new escpos.USB();
      const printer = new escpos.Printer(device, { encoding: "GB18030" });

      device.open((error) => {
        if (error) {
          reject(error);
          return;
        }

        try {
          printer
            .align("CT")
            .style("B")
            .size(1, 1)
            .text(data.shopName || "Tharusha Chemical")
            .style("NORMAL")
            .size(0, 0)
            .text(data.address || "")
            .text(data.phone || "")
            .drawLine();

          if (data.duplicateCopy) {
            printer
              .align("CT")
              .style("B")
              .text("DUPLICATE COPY")
              .style("NORMAL")
              .align("LT")
              .drawLine();
          }

          printer
            .align("LT")
            .text(`Invoice: ${data.invoiceNo || "PREVIEW"}`)
            .text(`Date: ${data.date || new Date().toLocaleString()}`)
            .text(`Customer: ${data.customerName || "Cash Customer"}`)
            .drawLine();

          data.cart.forEach((item) => {
            const lineTotal = Number(item.qty || 0) * Number(item.unitPrice || 0);
            printer
              .text(item.name || "")
              .text(`${item.qty} x ${item.unitLabel || "Unit"} x ${money(item.unitPrice)} = Rs.${money(lineTotal)}`);
          });

          printer
            .drawLine()
            .text(`Total : Rs. ${money(data.total)}`)
            .text(`Paid  : Rs. ${money(data.cash)}`);

          if (data.isCredit) {
            printer.text(`Credit: Rs. ${money(data.creditBalance)}`);
          } else {
            printer.text(`Change: Rs. ${money(data.change)}`);
          }

          printer
            .drawLine()
            .align("CT")
            .text(data.billFooter || "Thank you, come again!")
            .cut()
            .close(() => resolve({ ok: true }));
        } catch (printError) {
          reject(printError);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { printBill };
