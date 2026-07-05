export const defaultSettings = {
  shopName: "Tharusha Chemical",
  logo: "",
  address: "Tissamaharama",
  phone: "",
  billFooter: "Thank you, come again!",
  duplicateBillPrint: false,
};

const safeParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

export const readStore = (key, fallback = []) =>
  safeParse(localStorage.getItem(key), fallback);

export const writeStore = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event("pos-data-change"));
};

export const readSettings = () => ({
  ...defaultSettings,
  ...readStore("shopSettings", defaultSettings),
});

export const money = (value) =>
  new Intl.NumberFormat("en-LK", {
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

export const makeId = (prefix) =>
  `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const parseCustomUnits = (value) => {
  if (Array.isArray(value)) return value;
  return String(value || "")
    .split("\n")
    .map((line) => {
      const [label, stockQty, price] = line.split(",").map((part) => part?.trim());
      return {
        label,
        stockQty: Number(stockQty || 1),
        price: Number(price || 0),
      };
    })
    .filter((unit) => unit.label && unit.stockQty > 0 && unit.price > 0);
};

export const getProductUnitOptions = (product) => {
  const options = [];

  if (product.type === "fertilizer") {
    [
      ["50KG Bag", 50, product.bag50],
      ["25KG Bag", 25, product.bag25],
      ["10KG Bag", 10, product.bag10],
      ["5KG Loose", 5, Number(product.loosePrice || 0) * 5],
      ["2KG Loose", 2, Number(product.loosePrice || 0) * 2],
      ["1KG Loose", 1, product.loosePrice],
    ].forEach(([label, stockQty, price]) => {
      if (Number(price) > 0) {
        options.push({ label, stockQty, price: Number(price) });
      }
    });
  }

  if (product.type === "packet") {
    [
      ["50g Packet", 1, product.packet50g],
      ["100g Packet", 1, product.packet100g],
      ["200g Packet", 1, product.packet200g],
      ["500g Packet", 1, product.packet500g],
      ["1KG Packet", 1, product.packet1kg],
    ].forEach(([label, stockQty, price]) => {
      if (Number(price) > 0) {
        options.push({ label, stockQty, price: Number(price) });
      }
    });
  }

  if (product.type === "bottle") {
    [
      ["50ml Bottle", 1, product.bottle50ml],
      ["100ml Bottle", 1, product.bottle100ml],
      ["200ml Bottle", 1, product.bottle200ml],
      ["500ml Bottle", 1, product.bottle500ml],
      ["1L Bottle", 1, product.bottle1l],
    ].forEach(([label, stockQty, price]) => {
      if (Number(price) > 0) {
        options.push({ label, stockQty, price: Number(price) });
      }
    });
  }

  options.push(...parseCustomUnits(product.customUnits));

  const labeledPrice = Number(product.labeledPrice || 0);
  const discount = Number(product.discount || 0);
  const sellingPrice = labeledPrice - (labeledPrice * discount) / 100;

  if (options.length === 0) {
    options.push({
      label: "Unit",
      stockQty: 1,
      price: Math.max(sellingPrice, 0),
    });
  }

  return options;
};

export const getCartLineTotal = (item) =>
  Number(item.qty || 0) * Number(item.unitPrice || 0);

export const getCartStockQty = (item) =>
  Number(item.qty || 0) * Number(item.stockQty || 1);

export const matchesSearch = (item, search) => {
  const keyword = search.trim().toLowerCase();
  if (!keyword) return true;

  return [
    item.name,
    item.sinhala,
    item.aliases,
    item.brand,
    item.category,
    item.batch,
    item.nic,
  ]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(keyword));
};

const startOfDay = (date) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

const endOfDay = (date) => {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
};

export const getDateRange = (filter, customFrom = "", customTo = "") => {
  const now = new Date();
  const from = startOfDay(now);
  const to = endOfDay(now);

  if (filter === "yesterday") {
    from.setDate(from.getDate() - 1);
    to.setDate(to.getDate() - 1);
  }

  if (filter === "week") {
    from.setDate(from.getDate() - 6);
  }

  if (filter === "month") {
    from.setDate(1);
  }

  if (filter === "year") {
    from.setMonth(0, 1);
  }

  if (filter === "custom") {
    return {
      from: customFrom ? startOfDay(customFrom) : null,
      to: customTo ? endOfDay(customTo) : null,
    };
  }

  if (filter === "all") {
    return { from: null, to: null };
  }

  return { from, to };
};

export const isInsideDateRange = (dateText, range) => {
  if (!dateText) return false;
  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) return false;
  if (range.from && date < range.from) return false;
  if (range.to && date > range.to) return false;
  return true;
};

export const downloadCsv = (filename, rows) => {
  const csv = rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`)
        .join(",")
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
