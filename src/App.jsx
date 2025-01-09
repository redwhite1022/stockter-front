// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SearchPage from "./components/SearchPage";
import FinancialStatementsPage from "./components/FinancialStatementsPage";
import Navbar from "./components/Navbar";
import './styles/Common.css';


const App = () => {
    return (
        <Router>
            <div className="container">
                {/* 상단 헤더 */}
                <header className="header">
                    Stockter
                </header>

                {/* 내비게이션 바 */}
                <Navbar />

                {/* 메인 콘텐츠 영역 */}
                <main className="content">
                    <Routes>
                        <Route path="/" element={<SearchPage />} />
                        <Route path="/financial-statements" element={<FinancialStatementsPage />} />
                        <Route path="/" element={<components />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
};

export default App;
