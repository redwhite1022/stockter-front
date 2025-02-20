import React, { useState, useEffect } from "react";
import axios from "axios";
import SimpleTable from "./SimpleTable";
import "../styles/QuarterlyFinancialPage.css"; // 수정된 CSS 파일만 import

const QuarterlyFinancialPage = () => {
  const [stocks, setStocks] = useState([]);
  const [error, setError] = useState("");
  const [selectedQuarter, setSelectedQuarter] = useState(null);
  const [currentMetric, setCurrentMetric] = useState(null);
  const [showQuarterButtons, setShowQuarterButtons] = useState(false);

  // PER/PBR 전용 정렬 상태 ("top" 또는 "bottom")
  const [perDirection, setPerDirection] = useState("top");
  const [pbrDirection, setPbrDirection] = useState("top");

  // 데이터 가져오기
  const fetchTopStocksByMetric = () => {
    if (!currentMetric) return;

    const apiUrl =
      "https://port-0-stockter-back-m5or7nt39f4a0f5c.sel4.cloudtype.app/quarterly-financial";
    const params = { quarter: selectedQuarter, metric: currentMetric };

    if (currentMetric === "PER") {
      params.order = perDirection;
    } else if (currentMetric === "PBR") {
      params.order = pbrDirection;
    }

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
    if (metric === "PER") {
      setPerDirection((prev) => (prev === "top" ? "bottom" : "top"));
    } else if (metric === "PBR") {
      setPbrDirection((prev) => (prev === "top" ? "bottom" : "top"));
    }

    setCurrentMetric(metric);
    setShowQuarterButtons(true);
    setSelectedQuarter("2024-Q1");
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
  }, [selectedQuarter, currentMetric, perDirection, pbrDirection]);

  return (
    <div className="financial-statements-container">
      <h2>분기별 재무제표</h2>

      {/* 정렬 기준 버튼 */}
      <div className="button-group">
        {[
          "매출액",
          "영업이익",
          "영업이익률",
          "순이익률",
          "ROE",
          "EPS",
          "PER",
          "PBR",
          "시가배당률",
        ].map((metric) => (
          <button
            key={metric}
            onClick={() => handleButtonClick(metric)}
            className={currentMetric === metric ? "active" : ""}
          >
            {metric === "PER" && currentMetric === "PER"
              ? `PER ${perDirection === "top" ? "↑" : "↓"}`
              : metric === "PBR" && currentMetric === "PBR"
              ? `PBR ${pbrDirection === "top" ? "↑" : "↓"}`
              : metric}
          </button>
        ))}
      </div>

      {/* 분기 버튼들 */}
      {showQuarterButtons && (
        <div className="quarter-buttons">
          {["2023-Q3", "2023-Q4", "2024-Q1", "2024-Q2", "2024-Q3", "2024-Q4"].map((quarter) => (
            <button
              key={quarter}
              onClick={() => handleQuarterButtonClick(quarter)}
              className={selectedQuarter === quarter ? "active" : ""}
            >
              {quarter}
            </button>
          ))}
        </div>
      )}

      {error && <p className="error-message">{error}</p>}

      {/* 데이터 테이블 */}
      {stocks.length > 0 && (
        <div className="table-container">
          <SimpleTable
            stocks={stocks}
            columnTitle={`${currentMetric} (${selectedQuarter})`} // 동적 제목
          />
        </div>
      )}
    </div>
  );
};

export default QuarterlyFinancialPage;
