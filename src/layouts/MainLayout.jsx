import Sidebar from "../components/Sidebar";

function MainLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <main className="flex-1 bg-gray-100 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}

export default MainLayout;