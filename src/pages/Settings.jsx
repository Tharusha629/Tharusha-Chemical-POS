import { useEffect, useState } from "react";
import defaultLogo from "../assets/logo.png";
import { defaultSettings, readSettings, writeStore } from "../utils/storage";

function Settings() {
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    setSettings(readSettings());
  }, []);

  const handleChange = (event) => {
    const value =
      event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setSettings((current) => ({
      ...current,
      [event.target.name]: value,
    }));
  };

  const saveSettings = () => {
    writeStore("shopSettings", settings);
    alert("Settings saved successfully");
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
          System
        </p>
        <h1 className="text-3xl font-bold text-slate-950">Shop Settings</h1>
      </div>

      <section className="grid gap-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm xl:grid-cols-[1fr_320px]">
        <div className="grid gap-4 md:grid-cols-2">
          <input name="shopName" placeholder="Shop Name" value={settings.shopName} onChange={handleChange} className="input" />
          <input name="phone" placeholder="Phone Number" value={settings.phone} onChange={handleChange} className="input" />
          <input name="address" placeholder="Shop Address" value={settings.address} onChange={handleChange} className="input md:col-span-2" />
          <input name="logo" placeholder="Logo URL or absolute file path" value={settings.logo} onChange={handleChange} className="input md:col-span-2" />
          <textarea name="billFooter" placeholder="Bill Footer Message" value={settings.billFooter} onChange={handleChange} className="input min-h-28 md:col-span-2" />
          <label className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 md:col-span-2">
            <span>
              <span className="block font-semibold text-slate-900">Duplicate bill print</span>
              <span className="text-sm text-slate-500">On කළොත් receipt copies 2ක් print වෙයි.</span>
            </span>
            <input
              type="checkbox"
              name="duplicateBillPrint"
              checked={Boolean(settings.duplicateBillPrint)}
              onChange={handleChange}
              className="h-5 w-5 accent-green-700"
            />
          </label>
          <button onClick={saveSettings} className="rounded-lg bg-green-700 p-4 font-bold text-white hover:bg-green-800 md:col-span-2">
            Save Settings
          </button>
        </div>

        <aside className="rounded-lg bg-slate-50 p-5">
          <img
            src={settings.logo || defaultLogo}
            alt="Shop Logo"
            className="mx-auto h-28 w-28 rounded-lg bg-white object-contain p-2 shadow-sm"
            onError={(event) => {
              event.currentTarget.src = defaultLogo;
            }}
          />
          <div className="mt-5 text-center">
            <h2 className="text-2xl font-bold text-slate-950">{settings.shopName}</h2>
            <p className="text-slate-500">{settings.address}</p>
            <p className="text-slate-500">{settings.phone}</p>
            <hr className="my-4 border-slate-200" />
            <p className="text-sm text-slate-600">{settings.billFooter}</p>
          </div>
        </aside>
      </section>
    </div>
  );
}

export default Settings;
