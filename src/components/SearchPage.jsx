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

    // 재무 데이터 상태 (매출액, 영업이익, 순이익 등)
    const [financialData, setFinancialData] = useState(null);
    const [loadingFinancialData, setLoadingFinancialData] = useState(false);
    const [financialError, setFinancialError] = useState("");
    const [selectedButton, setSelectedButton] = useState("매출액"); // 현재 선택된 버튼 상태

    // 차트 컨테이너에 대한 참조 생성
    const chartRef = useRef(null);

    const cleanValue = (value) => {
        if (typeof value === "string") {
            return value.replace(/[\s,]+/g, ""); // 공백과 쉼표 제거
        }
        if (value === null || value === undefined) {
            return "N/A"; // 빈 값 처리
        }
        return value; // 나머지는 그대로 반환
    };

    // 단위 결정 함수
    const getUnit = (buttonName) => {
        const percentageButtons = ["영업이익률", "부채비율"];
        if (percentageButtons.includes(buttonName)) {
            return "%";
        }
        return "억";
    };

    // 퍼센트 단위인지 확인하는 함수
    const isPercentage = (buttonName) => {
        const percentageButtons = ["영업이익률", "부채비율"];
        return percentageButtons.includes(buttonName);
    };

    // ---------------------------
    // 1) 검색 함수
    // ---------------------------
    const fetchData = useCallback((searchQuery = query) => {
        if (!searchQuery.trim()) {
            setError("검색어를 입력하세요.");
            return;
        }
        setError("");
        setFilteredStocks([]);
        setIsDropdownOpen(false);
    
        axios
            .get("https://port-0-stockter-back-m5or7nt39f4a0f5c.sel4.cloudtype.app/data", { params: { query: searchQuery } })
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
    }, [query]);

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
                .get("https://port-0-stockter-back-m5or7nt39f4a0f5c.sel4.cloudtype.app/data", { params: { query: input } })
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

    const handleSuggestionClick = useCallback((stock) => {
        setQuery(stock["종목명"]);
        setIsDropdownOpen(false);
        setHighlightedStock(stock);
        fetchData(stock["종목명"]);
    }, [fetchData]);

    const handleKeyPress = useCallback((e) => {
        if (e.key === "Enter") {
            fetchData();
            setIsDropdownOpen(false);
        }
    }, [fetchData]);

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
        setFinancialData(null);
        setFinancialError("");
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
    // 4) 매출액, 영업이익, 영업이익률, 순이익, 부채비율 버튼 핸들러
    // ---------------------------
    const handleButtonClick = useCallback(
        async (buttonName) => {
            if (loadingFinancialData) {
                console.warn(`${buttonName} 데이터 로드 중입니다. 잠시만 기다려주세요.`);
                return;
            }
    
            console.log(`${buttonName} 버튼이 클릭되었습니다.`);
    
            let endpoint = "";
            if (buttonName === "매출액") {
                endpoint = "financial-annual-sales";
            } else if (buttonName === "영업이익") {
                endpoint = "financial-operating-profit";
            } else if (buttonName === "영업이익률") {
                endpoint = "financial-operating-income-rate"; // 백엔드 엔드포인트 수정
            } else if (buttonName === "순이익") {
                endpoint = "financial-net-income";
            } else if (buttonName === "부채비율") {
                endpoint = "financial-debt-ratio"; // 새로운 엔드포인트 추가
            } else {
                console.warn("지원되지 않는 버튼입니다.");
                return;
            }
    
            if (!highlightedStock) {
                setFinancialError("종목을 선택하지 않았습니다. 검색 후 선택해주세요.");
                return;
            }
    
            setLoadingFinancialData(true);
            setFinancialError("");
            setFinancialData(null);
            setSelectedButton(buttonName); // 현재 버튼 상태 저장
    
            try {
                const response = await axios.get(`https://port-0-stockter-back-m5or7nt39f4a0f5c.sel4.cloudtype.app/${endpoint}`, {
                    params: { stock_name: highlightedStock["종목명"] },
                });
                console.log(`${buttonName} API 응답 데이터:`, response.data);
    
                let data = null;
                if (buttonName === "매출액" && response.data.annual_sales) {
                    data = response.data.annual_sales;
                } else if (buttonName === "영업이익" && response.data.operating_profit) {
                    data = response.data.operating_profit;
                } else if (buttonName === "영업이익률" && response.data.operating_income_rate) {
                    data = response.data.operating_income_rate; // 숫자형 데이터
                } else if (buttonName === "순이익" && response.data.net_income) {
                    data = response.data.net_income;
                } else if (buttonName === "부채비율" && response.data.debt_ratio) { // 새로운 데이터 필드
                    data = response.data.debt_ratio;
                }
    
                if (data) {
                    setFinancialData(data);
                } else {
                    setFinancialError(`${buttonName} 데이터가 없습니다.`);
                }
            } catch (error) {
                console.error(`${buttonName} 데이터 로드 중 오류 발생:`, error);
                setFinancialError(`${buttonName} 데이터를 가져오는 중 오류가 발생했습니다.`);
            } finally {
                setLoadingFinancialData(false);
            }
        },
        [highlightedStock, loadingFinancialData]
    );

    // ---------------------------
    // 5) 자동 스크롤 useEffect
    // ---------------------------
    useEffect(() => {
        if (financialData && financialData.length > 0 && chartRef.current) {
            chartRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, [financialData]);

    // ---------------------------
    // 6) JSX 반환
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
            <div style={{ position: "relative", width: "100%", maxWidth: "600px", marginBottom: "20px" }}>
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

            {/* 데이터 테이블 */}
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
                        "부채비율", // 부채비율 컬럼 제외 (필요 시)
                    ]}
                />
            )}

            {/* 버튼들 */}
            {stocks.length > 0 && (
                <div
                    className="sort-buttons"
                    style={{ marginTop: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}
                >
                    <button
                        onClick={() => handleButtonClick('매출액')}
                        disabled={loadingFinancialData && selectedButton === '매출액'}
                    >
                        {loadingFinancialData && selectedButton === '매출액' ? "매출액 로딩 중..." : "매출액"}
                    </button>
                    <button
                        onClick={() => handleButtonClick('영업이익')}
                        disabled={loadingFinancialData && selectedButton === '영업이익'}
                    >
                        {loadingFinancialData && selectedButton === '영업이익' ? "영업이익 로딩 중..." : "영업이익"}
                    </button>
                    <button
                        onClick={() => handleButtonClick('영업이익률')}
                        disabled={loadingFinancialData && selectedButton === '영업이익률'}
                    >
                        {loadingFinancialData && selectedButton === '영업이익률' ? "영업이익률 로딩 중..." : "영업이익률"}
                    </button>
                    <button
                        onClick={() => handleButtonClick('순이익')}
                        disabled={loadingFinancialData && selectedButton === '순이익'}
                    >
                        {loadingFinancialData && selectedButton === '순이익' ? "순이익 로딩 중..." : "순이익"}
                    </button>
                    <button
                        onClick={() => handleButtonClick('부채비율')}
                        disabled={loadingFinancialData && selectedButton === '부채비율'}
                    >
                        {loadingFinancialData && selectedButton === '부채비율' ? "부채비율 로딩 중..." : "부채비율"}
                    </button>
                </div>
            )}

            {/* 데이터 로딩 및 오류 메시지 */}
            {loadingFinancialData && <p>데이터를 로드 중입니다...</p>}
            {financialError && <p className="error-message">{financialError}</p>}

            {/* 데이터 차트 표시 */}
            {financialData && financialData.length > 0 && (
                <div className="financial-data-chart" style={{ marginTop: "20px" }}>
                    {/* 차트를 테이블과 같은 너비로 설정 */}
                    <div className="chart-container" ref={chartRef} style={{ height: "400px" }}>
                        <Bar
                            data={{
                                labels: financialData.map((item) => item.연도),
                                datasets: [
                                    {
                                        // 레이블 수정: 영업이익률과 부채비율은 (%) 추가
                                        label: isPercentage(selectedButton) ? `${selectedButton} (%)` : `${selectedButton} (억)`,
                                        data: financialData.map((item) =>
                                            isPercentage(selectedButton)
                                                ? item[selectedButton === "영업이익률" ? "영업이익률" : "부채비율"]
                                                : item[selectedButton]
                                        ),
                                        backgroundColor:
                                            selectedButton === "매출액"
                                                ? "rgba(75, 192, 192, 0.6)"
                                                : selectedButton === "영업이익"
                                                    ? "rgba(255, 159, 64, 0.6)"
                                                    : selectedButton === "영업이익률"
                                                        ? "rgba(54, 162, 235, 0.6)"
                                                        : selectedButton === "순이익"
                                                            ? "rgba(153, 102, 255, 0.6)"
                                                            : selectedButton === "부채비율"
                                                                ? "rgba(255, 206, 86, 0.6)"
                                                                : "rgba(75, 192, 192, 0.6)",
                                        borderColor:
                                            selectedButton === "매출액"
                                                ? "rgba(75, 192, 192, 1)"
                                                : selectedButton === "영업이익"
                                                    ? "rgba(255, 159, 64, 1)"
                                                    : selectedButton === "영업이익률"
                                                        ? "rgba(54, 162, 235, 1)"
                                                        : selectedButton === "순이익"
                                                            ? "rgba(153, 102, 255, 1)"
                                                            : selectedButton === "부채비율"
                                                                ? "rgba(255, 206, 86, 1)"
                                                                : "rgba(75, 192, 192, 1)",
                                        borderWidth: 1,
                                    },
                                ],
                            }}
                            options={{
                                responsive: true, // 반응형 활성화
                                maintainAspectRatio: false, // 비율 유지
                                plugins: {
                                    legend: {
                                        position: "top",
                                    },
                                    title: {
                                        display: true,
                                        text: `${highlightedStock["종목명"]} 연간 ${selectedButton}`,
                                    },
                                },
                                scales: {
                                    y: {
                                        beginAtZero: false,
                                        ticks: {
                                            callback: function (value) {
                                                if (isPercentage(selectedButton)) {
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
                </div>
            )}
        </div>
    );

};

export default SearchPage;
