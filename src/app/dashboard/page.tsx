// src/app/dashboard/page.tsx
import dynamic from "next/dynamic";
import BottomNav from "../components/BottomNav";

const DashboardContent = dynamic(
  () => import("../components/DashboardContent"),
  {
    ssr: false,
  }
);

export default function DashboardPage() {
  return (
    <>
      <DashboardContent />
      <BottomNav />
    </>
  );
}
