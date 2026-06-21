import AdminSidebar from "@/components/layout/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-ids-gray">
      <AdminSidebar />
      <main className="flex-1 ml-0 lg:ml-64 transition-all duration-300">
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}