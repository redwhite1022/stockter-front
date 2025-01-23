// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SearchPage from "./components/SearchPage";
import FinancialStatementsPage from "./components/FinancialStatementsPage";
import QuarterlyFinancialPage from "./components/QuarterlyFinancialPage"; 
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
                        {/* 종목 검색 */}
                        <Route path="/" element={<SearchPage />} />
                        
                        {/* 연간 재무 데이터 */}
                        <Route path="/financial-statements" element={<FinancialStatementsPage />} />
                        
                        {/* 분기별 재무 데이터 */}
                        <Route path="/quarterly-financial-statements" element={<QuarterlyFinancialPage />} />

                        {/* 차트 이미지 분석 */}
                        {/* <Route path="/image-analysis" element={<ImageAnalysisPage />} /> */}

                    </Routes>
                </main>
            </div>
        </Router>
    );
};

export default App;
