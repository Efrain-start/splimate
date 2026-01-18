import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { startGroupsListener } from "./features/groups/groupsSlice";

import MobileMenu from "./components/MobileMenu";
import useIsDesktop from "./hooks/useIsDesktop";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Home from "./pages/Home";
import Groups from "./pages/Groups";
import GroupDetail from "./pages/GroupDetail";
import Insights from "./pages/Insights";


export default function App() {
  const isDesktop = useIsDesktop(900);

  const dispatch = useDispatch();
  
  useEffect(() => {
    dispatch(startGroupsListener());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <div className="appShell">
        {isDesktop ? (
          <header className="topbar">
            <div className="brand">SplitMate</div>

            <nav className="nav">
              <NavLink to="/" end className={({isActive}) => `navLink ${isActive ? "active" : ""}`}>
                Home
              </NavLink>
              <NavLink to="/groups" className={({isActive}) => `navLink ${isActive ? "active" : ""}`}>
                Groups
              </NavLink>
              <NavLink to="/insights" className={({isActive}) => `navLink ${isActive ? "active" : ""}`}>
                Insights
              </NavLink>
            </nav>
          </header>
        ) : (
          <MobileMenu />
        )}

        <main className="pageWrap">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/group/:id" element={<GroupDetail />} />
            <Route path="/insights" element={<Insights />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
