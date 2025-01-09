import React, { useState, useEffect } from "react";
import axios from "axios";
import SimpleTable from "./SimpleTable";
import "../styles/Common.css";
import "../styles/FinancialStatementsPage.css";

const FinancialStatementsPage = () => {
    const [stocks, setStocks] = useState([]);
    const [error, setError] = useState("");
    const [selectedYear, setSelectedYear] = useState(null);
    const [currentMetric, setCurrentMetric] = useState(null);
    const [showYearButtons, setShowYearButtons] = useState(false); // 연도 버튼 표시 여부
    const [perDirection, setPerDirection] = useState("top"); // PER 방향 상태
    const [pbrDirection, setPbrDirection] = useState("top"); // PBR 방향 상태

    // 데이터 가져오기
    const fetchTopStocksByMetric = () => {
        if (currentMetric === "시가총액") {
            axios
                .get("http://127.0.0.1:8000/top-marketcap")
                .then((response) => {
                    if (response.data.error || response.data.stocks.length === 0) {
                        setError("시가총액 데이터가 없습니다.");
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
        } else if (currentMetric === "매출액") {
            axios
                .get("http://127.0.0.1:8000/top-revenue", { params: { year: selectedYear } })
                .then((response) => {
                    if (response.data.error || response.data.stocks.length === 0) {
                        setError("매출액 데이터가 없습니다.");
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
        } else if (currentMetric === "영업이익") {
            axios
                .get("http://127.0.0.1:8000/top-operating-income", { params: { year: selectedYear } })
                .then((response) => {
                    if (response.data.error || response.data.stocks.length === 0) {
                        setError("영업이익 데이터가 없습니다.");
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
        } else if (currentMetric === "영업이익률") {
            axios
                .get("http://127.0.0.1:8000/top-operating-income-rate", { params: { year: selectedYear } })
                .then((response) => {
                    if (response.data.error || response.data.stocks.length === 0) {
                        setError("영업이익률 데이터가 없습니다.");
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
        } else if (currentMetric === "순이익률") {
            axios
                .get("http://127.0.0.1:8000/top-net-income", { params: { year: selectedYear } })
                .then((response) => {
                    if (response.data.error || response.data.stocks.length === 0) {
                        setError("순이익률 데이터가 없습니다.");
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
        } else if (currentMetric === "EPS") {
            axios
                .get("http://127.0.0.1:8000/top-eps", { params: { year: selectedYear } })
                .then((response) => {
                    if (response.data.error || response.data.stocks.length === 0) {
                        setError("EPS 데이터가 없습니다.");
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
        } else if (currentMetric === "PER") {
            const endpoint = perDirection === "top" ? "top-per" : "bottom-per";
            axios
                .get(`http://127.0.0.1:8000/${endpoint}`, { params: { year: selectedYear } })
                .then((response) => {
                    if (response.data.error || response.data.stocks.length === 0) {
                        setError("PER 데이터가 없습니다.");
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
        } else if (currentMetric === "PBR") { // PBR 조건 추가
            const endpoint = pbrDirection === "top" ? "top-pbr" : "bottom-pbr";
            axios
                .get(`http://127.0.0.1:8000/${endpoint}`, { params: { year: selectedYear } })
                .then((response) => {
                    if (response.data.error || response.data.stocks.length === 0) {
                        setError("PBR 데이터가 없습니다.");
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
        } else if (currentMetric === "시가배당률") { // 시가배당률 조건 추가
            axios
                .get("http://127.0.0.1:8000/top-dividend-yield", { params: { year: selectedYear } }) // 적절한 엔드포인트 사용
                .then((response) => {
                    if (response.data.error || response.data.stocks.length === 0) {
                        setError("시가배당률 데이터가 없습니다.");
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
        } else {
            setError(`"${currentMetric}" 기능은 아직 구현되지 않았습니다.`);
            setStocks([]);
        }
    };

    // 버튼 클릭 동작
    const handleButtonClick = (metric) => {
        if (metric === "PER") {
            if (currentMetric === "PER") {
                // PER 방향 토글
                setPerDirection((prevDirection) => (prevDirection === "top" ? "bottom" : "top"));
            } else {
                setPerDirection("top"); // 기본 방향 설정
            }
        } else if (metric === "PBR") {
            if (currentMetric === "PBR") {
                // PBR 방향 토글
                setPbrDirection((prevDirection) => (prevDirection === "top" ? "bottom" : "top"));
            } else {
                setPbrDirection("top"); // 기본 방향 설정
            }
        }

        setCurrentMetric(metric);
        if (metric !== "시가총액") {
            setShowYearButtons(true); // 시가총액 제외 모든 버튼 클릭 시 연도 버튼 표시
            setSelectedYear("2024"); // 기본 연도 설정
        } else {
            setShowYearButtons(false); // 시가총액 클릭 시 연도 버튼 숨기기
            setSelectedYear(null);
        }
    };

    // 연도 버튼 클릭 동작
    const handleYearButtonClick = (year) => {
        setSelectedYear(year);
    };

    // 데이터 요청 트리거
    useEffect(() => {
        if (currentMetric) {
            fetchTopStocksByMetric();
        }
    }, [selectedYear, currentMetric, perDirection, pbrDirection]); // pbrDirection 추가

    return (
        <div className="financial-statements-container">
            <h2 style={{ color: "#007bff", marginBottom: "20px" }}>재무제표</h2>

            {/* 정렬기준 버튼 */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                {/* 시가총액 버튼 */}
                <button
                    onClick={() => handleButtonClick("시가총액")}
                    style={{
                        backgroundColor: currentMetric === "시가총액" ? "#007bff" : "#fff",
                        color: currentMetric === "시가총액" ? "#fff" : "#000",
                        border: "1px solid #007bff",
                        borderRadius: "4px",
                        padding: "5px 10px",
                    }}
                >
                    시가총액
                </button>

                {/* 매출액 버튼 */}
                <button
                    onClick={() => handleButtonClick("매출액")}
                    style={{
                        backgroundColor: currentMetric === "매출액" ? "#007bff" : "#fff",
                        color: currentMetric === "매출액" ? "#fff" : "#000",
                        border: "1px solid #007bff",
                        borderRadius: "4px",
                        padding: "5px 10px",
                    }}
                >
                    매출액
                </button>

                {/* 영업이익 버튼 */}
                <button
                    onClick={() => handleButtonClick("영업이익")}
                    style={{
                        backgroundColor: currentMetric === "영업이익" ? "#007bff" : "#fff",
                        color: currentMetric === "영업이익" ? "#fff" : "#000",
                        border: "1px solid #007bff",
                        borderRadius: "4px",
                        padding: "5px 10px",
                    }}
                >
                    영업이익
                </button>

                {/* 영업이익률 버튼 */}
                <button
                    onClick={() => handleButtonClick("영업이익률")}
                    style={{
                        backgroundColor: currentMetric === "영업이익률" ? "#007bff" : "#fff",
                        color: currentMetric === "영업이익률" ? "#fff" : "#000",
                        border: "1px solid #007bff",
                        borderRadius: "4px",
                        padding: "5px 10px",
                    }}
                >
                    영업이익률
                </button>

                {/* 순이익률 버튼 */}
                <button
                    onClick={() => handleButtonClick("순이익률")}
                    style={{
                        backgroundColor: currentMetric === "순이익률" ? "#007bff" : "#fff",
                        color: currentMetric === "순이익률" ? "#fff" : "#000",
                        border: "1px solid #007bff",
                        borderRadius: "4px",
                        padding: "5px 10px",
                    }}
                >
                    순이익률
                </button>

                {/* EPS 버튼 */}
                <button
                    onClick={() => handleButtonClick("EPS")}
                    style={{
                        backgroundColor: currentMetric === "EPS" ? "#007bff" : "#fff",
                        color: currentMetric === "EPS" ? "#fff" : "#000",
                        border: "1px solid #007bff",
                        borderRadius: "4px",
                        padding: "5px 10px",
                    }}
                >
                    EPS
                </button>

                {/* PER 버튼 */}
                <button
                    onClick={() => handleButtonClick("PER")}
                    style={{
                        backgroundColor: currentMetric === "PER" ? "#007bff" : "#fff",
                        color: currentMetric === "PER" ? "#fff" : "#000",
                        border: "1px solid #007bff",
                        borderRadius: "4px",
                        padding: "5px 10px",
                    }}
                >
                    PER {currentMetric === "PER" ? (perDirection === "top" ? "↑" : "↓") : ""}
                </button>

                {/* PBR 버튼 */}
                <button
                    onClick={() => handleButtonClick("PBR")}
                    style={{
                        backgroundColor: currentMetric === "PBR" ? "#007bff" : "#fff",
                        color: currentMetric === "PBR" ? "#fff" : "#000",
                        border: "1px solid #007bff",
                        borderRadius: "4px",
                        padding: "5px 10px",
                    }}
                >
                    PBR {currentMetric === "PBR" ? (pbrDirection === "top" ? "↑" : "↓") : ""}
                </button>

                {/* 시가배당률 버튼 */}
                <button
                    onClick={() => handleButtonClick("시가배당률")}
                    style={{
                        backgroundColor: currentMetric === "시가배당률" ? "#007bff" : "#fff",
                        color: currentMetric === "시가배당률" ? "#fff" : "#000",
                        border: "1px solid #007bff",
                        borderRadius: "4px",
                        padding: "5px 10px",
                    }}
                >
                    시가배당률
                </button>
            </div>

            {/* 연도 버튼들 (시가총액을 제외한 모든 버튼 클릭 시 표시) */}
            {showYearButtons && (
                <div style={{ display: "flex", gap: "5px", marginBottom: "20px" }}>
                    {["2021", "2022", "2023", "2024"].map((year) => (
                        <button
                            key={year}
                            onClick={() => handleYearButtonClick(year)}
                            style={{
                                backgroundColor: selectedYear === year ? "#007bff" : "#fff",
                                color: selectedYear === year ? "#fff" : "#000",
                                border: "1px solid #007bff",
                                borderRadius: "4px",
                                padding: "5px 10px",
                            }}
                        >
                            {year}
                        </button>
                    ))}
                </div>
            )}

            {error && <p className="error-message">{error}</p>}

            {/* 데이터 테이블 */}
            {stocks.length > 0 && (
                <SimpleTable
                    stocks={stocks}
                    columnTitle={currentMetric} // 동적으로 제목 변경
                />
            )}
        </div>
    );

};

export default FinancialStatementsPage;
