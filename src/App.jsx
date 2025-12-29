import MobileMenu from "./components/MobileMenu";
import useIsDesktop from "./hooks/useIsDesktop";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Groups from "./pages/Groups";
import GroupDetail from "./pages/GroupDetail";
import Insights from "./pages/Insights";

export default function App() {
  const isDesktop = useIsDesktop(900);

  const topbar = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    padding: "12px 14px",
    borderRadius: 16,
    background: "rgba(17, 24, 39, 0.55)",
    border: "1px solid rgba(255,255,255,0.10)",
    boxShadow: "0 12px 30px rgba(0,0,0,0.30)",
    backdropFilter: "blur(8px)",
    color: "#E5E7EB",
  };

  const nav = { display: "flex", gap: 14, alignItems: "center" };

  const navLink = {
    textDecoration: "none",
    color: "#E5E7EB",
    fontWeight: 800,
    padding: "8px 10px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.06)",
  };

  return (
    <BrowserRouter>
      {/* ✅ Desktop navbar */}
      {isDesktop ? (
        <div style={{ padding: 24 }}>
          <div style={topbar}>
            <div style={{ fontWeight: 900, letterSpacing: 0.2 }}>SplitMate</div>

            <nav style={nav}>
              <Link to="/" style={navLink}>Home</Link>
              <Link to="/groups" style={navLink}>Groups</Link>
              <Link to="/insights" style={navLink}>Insights</Link>
            </nav>
          </div>

          <div style={{ marginTop: 12 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/groups" element={<Groups />} />
              <Route path="/group/:id" element={<GroupDetail />} />
              <Route path="/insights" element={<Insights />} />
            </Routes>
          </div>
        </div>
      ) : (
        <>
          {/* ✅ Mobile hamburger */}
          <MobileMenu />
          <div style={{ padding: 24, marginTop: 12 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/groups" element={<Groups />} />
              <Route path="/group/:id" element={<GroupDetail />} />
              <Route path="/insights" element={<Insights />} />
            </Routes>
          </div>
        </>
      )}
    </BrowserRouter>
  );
}
