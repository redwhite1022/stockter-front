import React, { useState, useEffect } from "react";
import axios from "axios";
import SimpleTable from "./SimpleTable";
import "../styles/Common.css";
import "../styles/FinancialStatementsPage.css";

const QuarterlyFinancialPage = () => {
    const [stocks, setStocks] = useState([]);
    const [error, setError] = useState("");
    const [selectedQuarter, setSelectedQuarter] = useState(null);
    const [currentMetric, setCurrentMetric] = useState(null);
    const [showQuarterButtons, setShowQuarterButtons] = useState(false); // 분기 버튼 표시 여부

    // 데이터 가져오기
    const fetchTopStocksByMetric = () => {
        if (!currentMetric) return;

        const apiUrl = `https://port-0-stockter-back-m5or7nt39f4a0f5c.sel4.cloudtype.app/quarterly-financial`; // 로컬 서버 URL
        const params = { quarter: selectedQuarter, metric: currentMetric };

        axios
            .get(apiUrl, { params })
            .then((response) => {
                if (response.data.error || response.data.stocks.length === 0) {
                    setError(`${currentMetric} 데이터가 없습니다.`);
                    setStocks([]);
                } else {
                    setStocks(response.data.stocks);
                    setError("");
                }
            })
            .catch((error) => {
                console.error("데이터 로드 중 오류 발생:", error);
                setError("서버와 연결할 수 없습니다.");
                setStocks([]);
            });
    };

    // 버튼 클릭 동작
    const handleButtonClick = (metric) => {
        setCurrentMetric(metric);
        setShowQuarterButtons(true); // 분기 버튼 표시
        setSelectedQuarter("2024-Q1"); // 기본 분기 설정
    };

    // 분기 버튼 클릭 동작
    const handleQuarterButtonClick = (quarter) => {
        setSelectedQuarter(quarter);
    };

    // 데이터 요청 트리거
    useEffect(() => {
        if (currentMetric && selectedQuarter) {
            fetchTopStocksByMetric();
        }
    }, [selectedQuarter, currentMetric]);

    return (
        <div className="financial-statements-container">
            <h2 style={{ color: "#007bff", marginBottom: "20px" }}>분기별 재무제표</h2>

            {/* 정렬기준 버튼 */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                {["매출액", "영업이익", "영업이익률", "순이익률", "ROE", "EPS", "PER", "PBR", "시가배당률"].map((metric) => (
                    <button
                        key={metric}
                        onClick={() => handleButtonClick(metric)}
                        style={{
                            backgroundColor: currentMetric === metric ? "#007bff" : "#fff",
                            color: currentMetric === metric ? "#fff" : "#000",
                            border: "1px solid #007bff",
                            borderRadius: "4px",
                            padding: "5px 10px",
                        }}
                    >
                        {metric}
                    </button>
                ))}
            </div>

            {/* 분기 버튼들 */}
            {showQuarterButtons && (
                <div style={{ display: "flex", gap: "5px", marginBottom: "20px" }}>
                    {["2023-Q3", "2023-Q4", "2024-Q1", "2024-Q2", "2024-Q3", "2024-Q4"].map((quarter) => (
                        <button
                            key={quarter}
                            onClick={() => handleQuarterButtonClick(quarter)}
                            style={{
                                backgroundColor: selectedQuarter === quarter ? "#007bff" : "#fff",
                                color: selectedQuarter === quarter ? "#fff" : "#000",
                                border: "1px solid #007bff",
                                borderRadius: "4px",
                                padding: "5px 10px",
                            }}
                        >
                            {quarter}
                        </button>
                    ))}
                </div>
            )}

            {error && <p className="error-message">{error}</p>}

            {/* 데이터 테이블 */}
            {stocks.length > 0 && (
                <SimpleTable
                    stocks={stocks}
                    columnTitle={`${currentMetric} (${selectedQuarter})`} // 동적으로 제목 변경
                />
            )}
        </div>
    );
};

export default QuarterlyFinancialPage;
