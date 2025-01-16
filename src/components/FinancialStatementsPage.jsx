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

    // PER/PBR 방향 (위/아래) 상태
    const [perDirection, setPerDirection] = useState("top");
    const [pbrDirection, setPbrDirection] = useState("top");

    // ---------------------------
    // 1) 데이터 가져오기 함수
    // ---------------------------
    const fetchTopStocksByMetric = () => {
        if (currentMetric === "시가총액") {
            axios
                .get("https://port-0-stockter-back-m5or7nt39f4a0f5c.sel4.cloudtype.app/top-marketcap")
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
        } 
        else if (currentMetric === "매출액") {
            axios
                .get("https://port-0-stockter-back-m5or7nt39f4a0f5c.sel4.cloudtype.app/top-revenue", { params: { year: selectedYear } })
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
        }
        else if (currentMetric === "영업이익") {
            axios
                .get("https://port-0-stockter-back-m5or7nt39f4a0f5c.sel4.cloudtype.app/top-operating-income", { params: { year: selectedYear } })
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
        }
        else if (currentMetric === "영업이익률") {
            axios
                .get("https://port-0-stockter-back-m5or7nt39f4a0f5c.sel4.cloudtype.app/top-operating-income-rate", { params: { year: selectedYear } })
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
        }
        else if (currentMetric === "순이익률") {
            axios
                .get("https://port-0-stockter-back-m5or7nt39f4a0f5c.sel4.cloudtype.app/top-net-income", { params: { year: selectedYear } })
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
        }
        else if (currentMetric === "EPS") {
            axios
                .get("https://port-0-stockter-back-m5or7nt39f4a0f5c.sel4.cloudtype.app/top-eps", { params: { year: selectedYear } })
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
        }
        if (currentMetric === "PER") {
            // 화살표가 아래라면(perDirection === "desc") 내림차순 정렬,
            // 화살표가 위라면(perDirection === "asc") 오름차순 정렬
            const perEndpoint =
                perDirection === "desc"
                    ? "https://port-0-stockter-back-m5or7nt39f4a0f5c.sel4.cloudtype.app/top-per"
                    : "https://port-0-stockter-back-m5or7nt39f4a0f5c.sel4.cloudtype.app/bottom-per";
        
            axios
                .get(perEndpoint, {
                    params: { year: selectedYear }
                })
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
        } else if (currentMetric === "PBR") {
            // 화살표가 아래라면(pbrDirection === "desc") 내림차순 정렬,
            // 화살표가 위라면(pbrDirection === "asc") 오름차순 정렬
            const pbrEndpoint =
                pbrDirection === "desc"
                    ? "https://port-0-stockter-back-m5or7nt39f4a0f5c.sel4.cloudtype.app/top-pbr"
                    : "https://port-0-stockter-back-m5or7nt39f4a0f5c.sel4.cloudtype.app/bottom-pbr";
        
            axios
                .get(pbrEndpoint, {
                    params: { year: selectedYear }
                })
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
        }
        
        
        
        else if (currentMetric === "시가배당률") {
            axios
                .get("https://port-0-stockter-back-m5or7nt39f4a0f5c.sel4.cloudtype.app/top-dividend-yield", { params: { year: selectedYear } })
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
        }
        // ★ 추가: ROE
        else if (currentMetric === "ROE") {
            // 백엔드에 /top-roe 라우트가 있다고 가정 (연도별 "ROE(지배주주)" 컬럼 정렬)
            axios
                .get("https://port-0-stockter-back-m5or7nt39f4a0f5c.sel4.cloudtype.app/top-roe", { params: { year: selectedYear } })
                .then((response) => {
                    if (response.data.error || response.data.stocks.length === 0) {
                        setError("ROE 데이터가 없습니다.");
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
        }
        else {
            setError(`"${currentMetric}" 기능은 아직 구현되지 않았습니다.`);
            setStocks([]);
        }
    };

    // ---------------------------
    // 2) 버튼 클릭 동작
    // ---------------------------
    const handleButtonClick = (metric) => {
        // PER 위/아래 토글
        if (metric === "PER") {
            if (currentMetric === "PER") {
                setPerDirection((prev) => (prev === "top" ? "bottom" : "top"));
            } else {
                setPerDirection("top");
            }
        }
        // PBR 위/아래 토글
        else if (metric === "PBR") {
            if (currentMetric === "PBR") {
                setPbrDirection((prev) => (prev === "top" ? "bottom" : "top"));
            } else {
                setPbrDirection("top");
            }
        }

        setCurrentMetric(metric);

        // 시가총액은 연도가 필요 없음
        if (metric !== "시가총액") {
            setShowYearButtons(true);
            setSelectedYear("2024");
        } else {
            setShowYearButtons(false);
            setSelectedYear(null);
        }
    };

    // ---------------------------
    // 3) 연도 버튼 클릭
    // ---------------------------
    const handleYearButtonClick = (year) => {
        setSelectedYear(year);
    };

    // ---------------------------
    // 4) useEffect: metric/연도 바뀔 때마다 호출
    // ---------------------------
    useEffect(() => {
        if (currentMetric) {
            fetchTopStocksByMetric();
        }
    }, [selectedYear, currentMetric, perDirection, pbrDirection]);

    // ---------------------------
    // 5) JSX
    // ---------------------------
    return (
        <div className="financial-statements-container">
            <h2 style={{ color: "#007bff", marginBottom: "20px" }}>재무제표</h2>

            {/* 정렬기준 버튼 */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
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
                                {/* ★ 추가: ROE 버튼 */}
                                <button
                    onClick={() => handleButtonClick("ROE")}
                    style={{
                        backgroundColor: currentMetric === "ROE" ? "#007bff" : "#fff",
                        color: currentMetric === "ROE" ? "#fff" : "#000",
                        border: "1px solid #007bff",
                        borderRadius: "4px",
                        padding: "5px 10px",
                    }}
                >
                    ROE
                </button>

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

            {/* 연도 버튼들 (시가총액 제외) */}
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
                    columnTitle={currentMetric}
                />
            )}
        </div>
    );
};

export default FinancialStatementsPage;
