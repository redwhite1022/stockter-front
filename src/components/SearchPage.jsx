import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import StockTable from "./StockTable";
import "../styles/Common.css";
import "../styles/SearchPage.css";
import { Bar } from "react-chartjs-2";
import "chart.js/auto"; // 자동 등록

const SearchPage = () => {
    const [stocks, setStocks] = useState([]);
    const [query, setQuery] = useState("");
    const [highlightedStock, setHighlightedStock] = useState(null); // 상단 정보용 상태
    const [filteredStocks, setFilteredStocks] = useState([]);
    const [error, setError] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // ========== (1) 연간 데이터 관련 상태 ==========
    const [annualData, setAnnualData] = useState([]);                // 연간 데이터 배열
    const [annualLoading, setAnnualLoading] = useState(false);       // 연간 데이터 로딩 상태
    const [annualError, setAnnualError] = useState("");              // 연간 데이터 오류 메시지
    const [annualSelectedButton, setAnnualSelectedButton] = useState(""); // 현재 선택된 연간 버튼

    // ========== (2) 분기 데이터 관련 상태 ==========
    const [quarterlyData, setQuarterlyData] = useState([]);          // 분기별 데이터 배열
    const [quarterlyLoading, setQuarterlyLoading] = useState(false); // 분기 데이터 로딩 상태
    const [quarterlyError, setQuarterlyError] = useState("");        // 분기 데이터 오류 메시지
    const [quarterlySelectedButton, setQuarterlySelectedButton] = useState(""); // 현재 선택된 분기 버튼


    // 분기 라벨 매핑 객체 
    const quarterLabelMap = {
        "2023.Q1": "2023-Q3",
        "2023.Q2": "2023-Q4",
        "2023.Q3": "2024-Q1",
        "2023.Q4": "2024-Q2",
        "2023.Q5": "2024-Q3",
        "2023.Q6": "2024-Q4",
    };

    // 각각의 차트에 대한 ref (스크롤 용도)
    const annualChartRef = useRef(null);
    const quarterlyChartRef = useRef(null);

    // 공백/쉼표 제거
    const cleanValue = (value) => {
        if (typeof value === "string") {
            return value.replace(/[\s,]+/g, "");
        }
        if (value === null || value === undefined) {
            return "N/A";
        }
        return value;
    };

    // 퍼센트 단위인지 확인하는 함수
    const isPercentage = (buttonName) => {
        const percentageButtons = ["영업이익률", "부채비율"];
        return percentageButtons.includes(buttonName);
    };

    // ---------------------------
    // 1) 검색 함수
    // ---------------------------
    const fetchData = useCallback(
        (searchQuery = query) => {
            if (!searchQuery.trim()) {
                setError("검색어를 입력하세요.");
                return;
            }
            setError("");
            setFilteredStocks([]);
            setIsDropdownOpen(false);

            axios
                .get("https://port-0-stockter-back-m5or7nt39f4a0f5c.sel4.cloudtype.app/data", {
                    params: { query: searchQuery },
                })
                .then((response) => {
                    if (response.data.error || response.data.stocks.length === 0) {
                        setError("검색 결과가 없습니다.");
                        setStocks([]);
                    } else {
                        const mappedData = response.data.stocks.map((stock) => ({
                            ...stock,
                            매출액: cleanValue(stock["매출액"]),
                            영업이익: cleanValue(stock["영업이익"]),
                            영업이익률: cleanValue(stock["영업이익률"]),
                            시가배당률: cleanValue(stock["시가배당률(%)"]),
                            부채비율: cleanValue(stock["부채비율"]),
                        }));

                        setStocks(mappedData);
                        setHighlightedStock(mappedData[0] || null);
                    }
                })
                .catch((error) => {
                    console.error("데이터 로드 오류:", error);
                    setError("서버와 연결할 수 없습니다.");
                });
        },
        [query]
    );

    // ---------------------------
    // 2) 자동완성 로직
    // ---------------------------
    const handleQueryChange = useCallback((e) => {
        const input = e.target.value;
        setQuery(input);

        if (input.trim() === "") {
            setFilteredStocks([]);
            setIsDropdownOpen(false);
        } else {
            axios
                .get("https://port-0-stockter-back-m5or7nt39f4a0f5c.sel4.cloudtype.app/data", {
                    params: { query: input },
                })
                .then((response) => {
                    if (response.data.stocks) {
                        const lowercasedInput = input.toLowerCase();
                        const filtered = response.data.stocks.filter((stock) => {
                            const stockCode = stock["종목코드"].toString().toLowerCase();
                            const stockName = stock["종목명"].toLowerCase();
                            return (
                                stockCode.includes(lowercasedInput) ||
                                stockName.includes(lowercasedInput)
                            );
                        });

                        // 입력값으로 시작하는 종목 우선 정렬
                        const startsWithQuery = filtered.filter((stock) => {
                            const stockCode = stock["종목코드"].toString().toLowerCase();
                            const stockName = stock["종목명"].toLowerCase();
                            return (
                                stockCode.startsWith(lowercasedInput) ||
                                stockName.startsWith(lowercasedInput)
                            );
                        });
                        const others = filtered.filter((stock) => {
                            const stockCode = stock["종목코드"].toString().toLowerCase();
                            const stockName = stock["종목명"].toLowerCase();
                            return (
                                !stockCode.startsWith(lowercasedInput) &&
                                !stockName.startsWith(lowercasedInput)
                            );
                        });

                        // 최대 10개까지만
                        setFilteredStocks([...startsWithQuery, ...others].slice(0, 10));
                        setIsDropdownOpen(true);
                    }
                })
                .catch((error) => {
                    console.error("자동완성 데이터 로드 오류:", error);
                });
        }
    }, []);

    const handleSuggestionClick = useCallback(
        (stock) => {
            setQuery(stock["종목명"]);
            setIsDropdownOpen(false);
            setHighlightedStock(stock);
            fetchData(stock["종목명"]);
        },
        [fetchData]
    );

    const handleKeyPress = useCallback(
        (e) => {
            if (e.key === "Enter") {
                fetchData();
                setIsDropdownOpen(false);
            }
        },
        [fetchData]
    );

    // ---------------------------
    // 3) 기타 이벤트
    // ---------------------------
    const resetState = useCallback(() => {
        setQuery("");
        setStocks([]);
        setFilteredStocks([]);
        setError("");
        setIsDropdownOpen(false);
        setHighlightedStock(null);

        // 연간 / 분기 데이터도 모두 초기화
        setAnnualData([]);
        setAnnualLoading(false);
        setAnnualError("");
        setAnnualSelectedButton("");

        setQuarterlyData([]);
        setQuarterlyLoading(false);
        setQuarterlyError("");
        setQuarterlySelectedButton("");
    }, []);

    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleOutsideClick);
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, []);

    const highlightMatch = useCallback((text, query) => {
        if (!query) return text;
        const regex = new RegExp(`(${query})`, "gi");
        return text.replace(regex, (match) => `<span class="highlight">${match}</span>`);
    }, []);

    // ---------------------------
    // 4) 연간 재무데이터 버튼 핸들러
    // ---------------------------
    const handleAnnualButtonClick = useCallback(
        async (buttonName) => {
            if (annualLoading) {
                console.warn("연간 데이터 로딩 중입니다. 잠시만 기다려주세요.");
                return;
            }

            if (!highlightedStock) {
                setAnnualError("종목을 선택하지 않았습니다. 검색 후 선택해주세요.");
                return;
            }

            setAnnualLoading(true);
            setAnnualError("");
            setAnnualData([]);
            setAnnualSelectedButton(buttonName);

            // 엔드포인트 결정
            let endpoint = "";
            if (buttonName === "매출액") {
                endpoint = "financial-annual-sales";
            } else if (buttonName === "영업이익") {
                endpoint = "financial-operating-profit";
            } else if (buttonName === "영업이익률") {
                endpoint = "financial-operating-income-rate";
            } else if (buttonName === "순이익") {
                endpoint = "financial-net-income";
            } else if (buttonName === "부채비율") {
                endpoint = "financial-debt-ratio";
            } else {
                console.warn("지원되지 않는 버튼입니다(연간).");
                setAnnualLoading(false);
                return;
            }

            try {
                const response = await axios.get(
                    `https://port-0-stockter-back-m5or7nt39f4a0f5c.sel4.cloudtype.app/${endpoint}`,
                    { params: { stock_name: highlightedStock["종목명"] } }
                );

                let data = null;
                if (buttonName === "매출액" && response.data.annual_sales) {
                    data = response.data.annual_sales;
                } else if (buttonName === "영업이익" && response.data.operating_profit) {
                    data = response.data.operating_profit;
                } else if (buttonName === "영업이익률" && response.data.operating_income_rate) {
                    data = response.data.operating_income_rate;
                } else if (buttonName === "순이익" && response.data.net_income) {
                    data = response.data.net_income;
                } else if (buttonName === "부채비율" && response.data.debt_ratio) {
                    data = response.data.debt_ratio;
                }

                if (data && data.length > 0) {
                    setAnnualData(data);
                } else {
                    setAnnualError(`"${buttonName}" 데이터가 없습니다.`);
                }
            } catch (error) {
                console.error("연간 데이터 로드 오류:", error);
                setAnnualError(`"${buttonName}" 데이터를 가져오는 중 오류가 발생했습니다.`);
            } finally {
                setAnnualLoading(false);
            }
        },
        [highlightedStock, annualLoading]
    );

    // ---------------------------
    // 5) 분기별 재무데이터 버튼 핸들러
    // ---------------------------
    const handleQuarterlyButtonClick = useCallback(
        async (buttonName) => {
            if (quarterlyLoading) {
                console.warn("분기별 데이터 로딩 중입니다. 잠시만 기다려주세요.");
                return;
            }

            if (!highlightedStock) {
                setQuarterlyError("종목을 선택하지 않았습니다. 검색 후 선택해주세요.");
                return;
            }

            setQuarterlyLoading(true);
            setQuarterlyError("");
            setQuarterlyData([]);
            setQuarterlySelectedButton(buttonName);

            // 엔드포인트 결정 (분기별)
            let endpoint = "";
            if (buttonName === "매출액") {
                endpoint = "financial-quarterly-sales";
            } else if (buttonName === "영업이익") {
                endpoint = "financial-quarterly-operating-profit";
            } else if (buttonName === "영업이익률") {
                endpoint = "financial-quarterly-operating-income-rate";
            } else if (buttonName === "순이익") {
                endpoint = "financial-quarterly-net-income";
            } else if (buttonName === "부채비율") {
                endpoint = "financial-quarterly-debt-ratio";
            } else {
                console.warn("지원되지 않는 버튼입니다(분기).");
                setQuarterlyLoading(false);
                return;
            }

            try {
                const response = await axios.get(
                    `http://localhost:8000/${endpoint}`,
                    { params: { stock_name: highlightedStock["종목명"] } }
                );

                let data = null;
                // 예: 백엔드에서 quarterly_xxx 형태로 응답한다고 가정
                if (buttonName === "매출액" && response.data.quarterly_sales) {
                    data = response.data.quarterly_sales;
                } else if (buttonName === "영업이익" && response.data.quarterly_operating_profit) {
                    data = response.data.quarterly_operating_profit;
                } else if (buttonName === "영업이익률" && response.data.quarterly_operating_income_rate) {
                    data = response.data.quarterly_operating_income_rate;
                } else if (buttonName === "순이익" && response.data.quarterly_net_income) {
                    data = response.data.quarterly_net_income;
                } else if (buttonName === "부채비율" && response.data.quarterly_debt_ratio) {
                    data = response.data.quarterly_debt_ratio;
                }

                if (data && data.length > 0) {
                    setQuarterlyData(data);
                } else {
                    setQuarterlyError(`"${buttonName}" 분기별 데이터가 없습니다.`);
                }
            } catch (error) {
                console.error("분기별 데이터 로드 오류:", error);
                setQuarterlyError(`"${buttonName}" 분기별 데이터를 가져오는 중 오류가 발생했습니다.`);
            } finally {
                setQuarterlyLoading(false);
            }
        },
        [highlightedStock, quarterlyLoading]
    );

    // ---------------------------
    // 6) 자동 스크롤 useEffect (연간/분기 차트 각각)
    // ---------------------------
    // 연간 데이터가 새로 생기면 연간 차트 위치로 스크롤
    useEffect(() => {
        if (annualData.length > 0 && annualChartRef.current) {
            annualChartRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, [annualData]);

    // 분기 데이터가 새로 생기면 분기 차트 위치로 스크롤
    useEffect(() => {
        if (quarterlyData.length > 0 && quarterlyChartRef.current) {
            quarterlyChartRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, [quarterlyData]);

    // ---------------------------
    // (A) 연간 차트 데이터 구성
    // ---------------------------
    const annualChartData = {
        labels: annualData.map((item) => item.연도 || item.label || "N/A"),
        datasets: [
            {
                label: isPercentage(annualSelectedButton)
                    ? `${annualSelectedButton} (%)`
                    : `${annualSelectedButton} (억)`,
                data: annualData.map((item) => item[annualSelectedButton]),
                backgroundColor:
                    annualSelectedButton === "매출액"
                        ? "rgba(75, 192, 192, 0.6)"
                        : annualSelectedButton === "영업이익"
                        ? "rgba(255, 159, 64, 0.6)"
                        : annualSelectedButton === "영업이익률"
                        ? "rgba(54, 162, 235, 0.6)"
                        : annualSelectedButton === "순이익"
                        ? "rgba(153, 102, 255, 0.6)"
                        : annualSelectedButton === "부채비율"
                        ? "rgba(255, 206, 86, 0.6)"
                        : "rgba(75, 192, 192, 0.6)",
                borderColor:
                    annualSelectedButton === "매출액"
                        ? "rgba(75, 192, 192, 1)"
                        : annualSelectedButton === "영업이익"
                        ? "rgba(255, 159, 64, 1)"
                        : annualSelectedButton === "영업이익률"
                        ? "rgba(54, 162, 235, 1)"
                        : annualSelectedButton === "순이익"
                        ? "rgba(153, 102, 255, 1)"
                        : annualSelectedButton === "부채비율"
                        ? "rgba(255, 206, 86, 1)"
                        : "rgba(75, 192, 192, 1)",
                borderWidth: 1,
            },
        ],
    };

    // ---------------------------
    // (B) 분기 차트 데이터 구성
    // ---------------------------
    const quarterlyChartData = {
        labels: quarterlyData.map((item) => item.분기 || item.label || "N/A"),
        datasets: [
            {
                label: isPercentage(quarterlySelectedButton)
                    ? `${quarterlySelectedButton} (%)`
                    : `${quarterlySelectedButton} (억)`,
                data: quarterlyData.map((item) => item[quarterlySelectedButton]),
                backgroundColor:
                    quarterlySelectedButton === "매출액"
                        ? "rgba(75, 192, 192, 0.6)"
                        : quarterlySelectedButton === "영업이익"
                        ? "rgba(255, 159, 64, 0.6)"
                        : quarterlySelectedButton === "영업이익률"
                        ? "rgba(54, 162, 235, 0.6)"
                        : quarterlySelectedButton === "순이익"
                        ? "rgba(153, 102, 255, 0.6)"
                        : quarterlySelectedButton === "부채비율"
                        ? "rgba(255, 206, 86, 0.6)"
                        : "rgba(75, 192, 192, 0.6)",
                borderColor:
                    quarterlySelectedButton === "매출액"
                        ? "rgba(75, 192, 192, 1)"
                        : quarterlySelectedButton === "영업이익"
                        ? "rgba(255, 159, 64, 1)"
                        : quarterlySelectedButton === "영업이익률"
                        ? "rgba(54, 162, 235, 1)"
                        : quarterlySelectedButton === "순이익"
                        ? "rgba(153, 102, 255, 1)"
                        : quarterlySelectedButton === "부채비율"
                        ? "rgba(255, 206, 86, 1)"
                        : "rgba(75, 192, 192, 1)",
                borderWidth: 1,
            },
        ],
    };

    // ---------------------------
    // 7) JSX 반환
    // ---------------------------
    return (
        <div className="search-page-container">
            <h2
                onClick={resetState}
                style={{ cursor: "pointer", color: "#007bff", marginBottom: "20px" }}
            >
                종목검색
            </h2>

            {/* 검색창 */}
            <div
                style={{
                    position: "relative",
                    width: "100%",
                    maxWidth: "600px",
                    marginBottom: "20px",
                }}
            >
                <div style={{ display: "flex" }}>
                    <input
                        type="text"
                        placeholder="종목명 또는 종목코드 입력"
                        value={query}
                        onChange={handleQueryChange}
                        onKeyPress={handleKeyPress}
                    />
                    <button className="search-button" onClick={() => fetchData()}>
                        종목 검색
                    </button>
                </div>
                {isDropdownOpen && (
                    <div ref={dropdownRef} className="dropdown">
                        {filteredStocks.map((stock, index) => (
                            <div
                                key={index}
                                className="dropdown-item"
                                onClick={() => handleSuggestionClick(stock)}
                            >
                                <span
                                    dangerouslySetInnerHTML={{
                                        __html: highlightMatch(stock["종목명"] || "", query),
                                    }}
                                ></span>
                                <span style={{ marginLeft: "10px", color: "gray" }}>
                                    {stock["종목코드"] || ""}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {error && <p className="error-message">{error}</p>}

            {/* 상단 종목 정보 */}
            {highlightedStock && (
                <div className="highlighted-stock">
                    <h3>종목 정보</h3>
                    <p>시장: {highlightedStock["시장"] || "N/A"}</p>
                    <p>종목코드: {highlightedStock["종목코드"] || "N/A"}</p>
                    <p>종목명: {highlightedStock["종목명"] || "N/A"}</p>
                    <p>업종명: {highlightedStock["업종명"] || "N/A"}</p>
                    <p>시가총액: {highlightedStock["시가총액"] || "N/A"}</p>
                </div>
            )}

            {/* 기본 주가 정보 테이블 */}
            {stocks.length > 0 && (
                <StockTable
                    stocks={stocks}
                    excludeKeys={[
                        "시장",
                        "종목코드",
                        "종목명",
                        "업종명",
                        "시가총액",
                        "시가총액(숫자형)",
                        "종목명_lower",
                        "종목코드_str",
                        "부채비율", // 필요시 제외
                    ]}
                />
            )}

            {/* ========== (A) 연간 재무데이터 영역 ========== */}
            {stocks.length > 0 && (
                <>
                    <h3 style={{ marginTop: "30px", marginBottom: "10px", color: "#333" }}>
                        연간 재무데이터
                    </h3>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px" }}>
                        <button
                            onClick={() => handleAnnualButtonClick("매출액")}
                            disabled={annualLoading && annualSelectedButton === "매출액"}
                        >
                            {annualLoading && annualSelectedButton === "매출액"
                                ? "매출액 로딩 중..."
                                : "매출액"}
                        </button>
                        <button
                            onClick={() => handleAnnualButtonClick("영업이익")}
                            disabled={annualLoading && annualSelectedButton === "영업이익"}
                        >
                            {annualLoading && annualSelectedButton === "영업이익"
                                ? "영업이익 로딩 중..."
                                : "영업이익"}
                        </button>
                        <button
                            onClick={() => handleAnnualButtonClick("영업이익률")}
                            disabled={annualLoading && annualSelectedButton === "영업이익률"}
                        >
                            {annualLoading && annualSelectedButton === "영업이익률"
                                ? "영업이익률 로딩 중..."
                                : "영업이익률"}
                        </button>
                        <button
                            onClick={() => handleAnnualButtonClick("순이익")}
                            disabled={annualLoading && annualSelectedButton === "순이익"}
                        >
                            {annualLoading && annualSelectedButton === "순이익"
                                ? "순이익 로딩 중..."
                                : "순이익"}
                        </button>
                        <button
                            onClick={() => handleAnnualButtonClick("부채비율")}
                            disabled={annualLoading && annualSelectedButton === "부채비율"}
                        >
                            {annualLoading && annualSelectedButton === "부채비율"
                                ? "부채비율 로딩 중..."
                                : "부채비율"}
                        </button>
                    </div>

                    {/* 연간 데이터 로딩/오류 메시지 */}
                    {annualLoading && <p>연간 데이터를 로드 중입니다...</p>}
                    {annualError && <p className="error-message">{annualError}</p>}

                    {/* 연간 차트 (annualData가 존재할 때만 표시) */}
                    {annualData && annualData.length > 0 && (
                        <div
                            className="financial-data-chart"
                            ref={annualChartRef}
                            style={{ marginBottom: "30px", height: "400px" }}
                        >
                            <Bar
                                data={annualChartData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { position: "top" },
                                        title: {
                                            display: true,
                                            text: `${highlightedStock?.종목명 || ""} 연간 ${annualSelectedButton}`,
                                        },
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: false,
                                            ticks: {
                                                callback: function (value) {
                                                    if (isPercentage(annualSelectedButton)) {
                                                        return value.toFixed(1) + "%";
                                                    }
                                                    return value.toLocaleString() + "억";
                                                },
                                            },
                                        },
                                    },
                                }}
                            />
                        </div>
                    )}
                </>
            )}

            {/* ========== (B) 분기별 재무데이터 영역 ========== */}
            {stocks.length > 0 && (
                <>
                    <h3 style={{ marginTop: "30px", marginBottom: "10px", color: "#333" }}>
                        분기별 재무데이터
                    </h3>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px" }}>
                        <button
                            onClick={() => handleQuarterlyButtonClick("매출액")}
                            disabled={quarterlyLoading && quarterlySelectedButton === "매출액"}
                        >
                            {quarterlyLoading && quarterlySelectedButton === "매출액"
                                ? "매출액 로딩 중..."
                                : "매출액"}
                        </button>
                        <button
                            onClick={() => handleQuarterlyButtonClick("영업이익")}
                            disabled={quarterlyLoading && quarterlySelectedButton === "영업이익"}
                        >
                            {quarterlyLoading && quarterlySelectedButton === "영업이익"
                                ? "영업이익 로딩 중..."
                                : "영업이익"}
                        </button>
                        <button
                            onClick={() => handleQuarterlyButtonClick("영업이익률")}
                            disabled={quarterlyLoading && quarterlySelectedButton === "영업이익률"}
                        >
                            {quarterlyLoading && quarterlySelectedButton === "영업이익률"
                                ? "영업이익률 로딩 중..."
                                : "영업이익률"}
                        </button>
                        <button
                            onClick={() => handleQuarterlyButtonClick("순이익")}
                            disabled={quarterlyLoading && quarterlySelectedButton === "순이익"}
                        >
                            {quarterlyLoading && quarterlySelectedButton === "순이익"
                                ? "순이익 로딩 중..."
                                : "순이익"}
                        </button>
                        <button
                            onClick={() => handleQuarterlyButtonClick("부채비율")}
                            disabled={quarterlyLoading && quarterlySelectedButton === "부채비율"}
                        >
                            {quarterlyLoading && quarterlySelectedButton === "부채비율"
                                ? "부채비율 로딩 중..."
                                : "부채비율"}
                        </button>
                    </div>

                    {/* 분기별 데이터 로딩/오류 메시지 */}
                    {quarterlyLoading && <p>분기별 데이터를 로드 중입니다...</p>}
                    {quarterlyError && <p className="error-message">{quarterlyError}</p>}

                    {/* 분기별 차트 (quarterlyData가 존재할 때만 표시) */}
                    {quarterlyData && quarterlyData.length > 0 && (
                        <div
                            className="financial-data-chart"
                            ref={quarterlyChartRef}
                            style={{ marginBottom: "30px", height: "400px" }}
                        >
                            <Bar
                                data={quarterlyChartData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { position: "top" },
                                        title: {
                                            display: true,
                                            text: `${highlightedStock?.종목명 || ""} 분기별 ${quarterlySelectedButton}`,
                                        },
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: false,
                                            ticks: {
                                                callback: function (value) {
                                                    if (isPercentage(quarterlySelectedButton)) {
                                                        return value.toFixed(1) + "%";
                                                    }
                                                    return value.toLocaleString() + "억";
                                                },
                                            },
                                        },
                                    },
                                }}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default SearchPage;
