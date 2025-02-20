import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import StockTable from "./StockTable";
import "../styles/Common.css";
import "../styles/SearchPage.css";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

const SearchPage = () => {
  const [stocks, setStocks] = useState([]);
  const [query, setQuery] = useState("");
  const [highlightedStock, setHighlightedStock] = useState(null);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [error, setError] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // (1) 연간 데이터 관련 상태
  const [annualData, setAnnualData] = useState([]);
  const [annualLoading, setAnnualLoading] = useState(false);
  const [annualError, setAnnualError] = useState("");
  const [annualSelectedButton, setAnnualSelectedButton] = useState("");

  // (2) 분기 데이터 관련 상태
  const [quarterlyData, setQuarterlyData] = useState([]);
  const [quarterlyLoading, setQuarterlyLoading] = useState(false);
  const [quarterlyError, setQuarterlyError] = useState("");
  const [quarterlySelectedButton, setQuarterlySelectedButton] = useState("");

  // (3) 최신 뉴스 관련 상태
  const [newsData, setNewsData] = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState("");

  const quarterLabelMap = {
    "2023.Q1": "2023-Q1",
    "2023.Q2": "2023-Q2",
    "2023.Q3": "2023-Q3",
    "2023.Q4": "2023-Q4",
  };

  const annualChartRef = useRef(null);
  const quarterlyChartRef = useRef(null);

  const cleanValue = (value) => {
    if (typeof value === "string") {
      return value.replace(/[\s,]+/g, "");
    }
    if (value === null || value === undefined) {
      return "N/A";
    }
    return value;
  };

  const isPercentage = (buttonName) => {
    const percentageButtons = ["영업이익률", "부채비율"];
    return percentageButtons.includes(buttonName);
  };

  // 1) 검색 함수
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
            setHighlightedStock(null);
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

  // 2) 자동완성 로직
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

  // 3) 기타 이벤트 (리셋 등)
  const resetState = useCallback(() => {
    setQuery("");
    setStocks([]);
    setFilteredStocks([]);
    setError("");
    setIsDropdownOpen(false);
    setHighlightedStock(null);

    setAnnualData([]);
    setAnnualLoading(false);
    setAnnualError("");
    setAnnualSelectedButton("");

    setQuarterlyData([]);
    setQuarterlyLoading(false);
    setQuarterlyError("");
    setQuarterlySelectedButton("");

    setNewsData([]);
    setNewsLoading(false);
    setNewsError("");
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

  // 4) 연간 재무데이터 버튼 핸들러
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
          setAnnualError(`${buttonName} 데이터가 없습니다.`);
        }
      } catch (error) {
        console.error("연간 데이터 로드 오류:", error);
        setAnnualError(`${buttonName} 데이터를 가져오는 중 오류가 발생했습니다.`);
      } finally {
        setAnnualLoading(false);
      }
    },
    [highlightedStock, annualLoading]
  );

  // 5) 분기별 재무데이터 버튼 핸들러
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
          `https://port-0-stockter-back-m5or7nt39f4a0f5c.sel4.cloudtype.app/${endpoint}`,
          { params: { stock_name: highlightedStock["종목명"] } }
        );

        let data = null;
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
          setQuarterlyError(`${buttonName} 분기별 데이터가 없습니다.`);
        }
      } catch (error) {
        console.error("분기별 데이터 로드 오류:", error);
        setQuarterlyError(`${buttonName} 분기별 데이터를 가져오는 중 오류가 발생했습니다.`);
      } finally {
        setQuarterlyLoading(false);
      }
    },
    [highlightedStock, quarterlyLoading]
  );

  // 6) 최신 뉴스 API 호출 함수
  const fetchLatestNews = async () => {
    if (!highlightedStock) {
      setNewsError("종목을 선택하지 않았습니다. 검색 후 선택해주세요.");
      return;
    }
    setNewsLoading(true);
    setNewsError("");
    setNewsData([]);
    try {
      const response = await axios.get(
        "https://port-0-stockter-back-m5or7nt39f4a0f5c.sel4.cloudtype.app/latest-news",
        { params: { stock_name: highlightedStock["종목명"] } }
      );
      if (response.data.latest_news && response.data.latest_news.length > 0) {
        setNewsData(response.data.latest_news);
      } else {
        setNewsError("최신 뉴스 데이터가 없습니다.");
      }
    } catch (error) {
      console.error("최신 뉴스 로드 오류:", error);
      setNewsError("최신 뉴스 데이터를 가져오는 중 오류가 발생했습니다.");
    } finally {
      setNewsLoading(false);
    }
  };

  // 7) 자동 스크롤 (연간/분기)
  useEffect(() => {
    if (annualData.length > 0 && annualChartRef.current) {
      annualChartRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [annualData]);

  useEffect(() => {
    if (quarterlyData.length > 0 && quarterlyChartRef.current) {
      quarterlyChartRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [quarterlyData]);

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

  return (
    <div className="search-page-container">
      <h2 onClick={resetState} className="search-page-title">
        종목검색
      </h2>

      <div className="search-input-container">
        <div className="search-input-wrapper">
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
                <span className="dropdown-code">
                  {stock["종목코드"] || ""}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <p className="error-message">{error}</p>}

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
            "부채비율",
          ]}
        />
      )}

      {stocks.length > 0 && (
        <>
          <h3 className="annual-data-title">연간 재무데이터</h3>
          <div className="annual-buttons-container">
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

          {annualLoading && <p>연간 데이터를 로드 중입니다...</p>}
          {annualError && <p className="error-message">{annualError}</p>}

          {annualData && annualData.length > 0 && (
            <div
              className="financial-data-chart financial-chart"
              ref={annualChartRef}
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

      {stocks.length > 0 && (
        <>
          <h3 className="quarterly-data-title">분기별 재무데이터</h3>
          <div className="quarterly-buttons-container">
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

          {quarterlyLoading && <p>분기별 데이터를 로드 중입니다...</p>}
          {quarterlyError && <p className="error-message">{quarterlyError}</p>}

          {quarterlyData && quarterlyData.length > 0 && (
            <div
              className="financial-data-chart financial-chart"
              ref={quarterlyChartRef}
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

      {highlightedStock && (
        <div className="latest-news-section">
          <h3>최신 뉴스</h3>
          <button onClick={fetchLatestNews} disabled={newsLoading}>
            {newsLoading ? "뉴스 로딩 중..." : "최신 뉴스 가져오기"}
          </button>
          {newsError && <p className="error-message">{newsError}</p>}
          {newsData && newsData.length > 0 && (
            <ul className="news-list">
              {newsData.map((newsItem, index) => (
                <li key={index}>
                  <a href={newsItem.link} target="_blank" rel="noopener noreferrer">
                    {newsItem.title}
                  </a>
                  <p>{newsItem.summary}</p>
                  <span>{newsItem.date}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
