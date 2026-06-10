import type { ReactNode } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <Sidebar />
      <Header />

      <div style={{
        marginLeft: "200px",  
        marginTop: "53px",    
        padding: "20px",
      }}>
        {children}
      </div>
    </div>
  );
}

export default MainLayout;