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

  // PER/PBR 전용 정렬 상태 ("top" 또는 "bottom")
  const [perDirection, setPerDirection] = useState("top");
  const [pbrDirection, setPbrDirection] = useState("top");

  // 데이터 가져오기
  const fetchTopStocksByMetric = () => {
    if (!currentMetric) return;

    const apiUrl =
      "https://port-0-stockter-back-m5or7nt39f4a0f5c.sel4.cloudtype.app/quarterly-financial"; // 백엔드 URL
    // 기본 params: quarter, metric
    const params = { quarter: selectedQuarter, metric: currentMetric };

    // PER/PBR일 경우 order 파라미터 추가
    if (currentMetric === "PER") {
      params.order = perDirection;
    } else if (currentMetric === "PBR") {
      params.order = pbrDirection;
    }
    // 다른 지표의 경우 백엔드에서는 별도의 order 처리를 하지 않으므로 order는 보내지 않아도 됩니다.

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
    // PER 버튼 클릭: 기존이 PER일 경우 토글, 아니면 초기화
    if (metric === "PER") {
      if (currentMetric === "PER") {
        setPerDirection((prev) => (prev === "top" ? "bottom" : "top"));
      } else {
        setPerDirection("top");
      }
    }
    // PBR 버튼 클릭: 기존이 PBR일 경우 토글, 아니면 초기화
    else if (metric === "PBR") {
      if (currentMetric === "PBR") {
        setPbrDirection((prev) => (prev === "top" ? "bottom" : "top"));
      } else {
        setPbrDirection("top");
      }
    }

    setCurrentMetric(metric);
    setShowQuarterButtons(true); // 분기 버튼 표시
    setSelectedQuarter("2024-Q1"); // 기본 분기 설정
  };

  // 분기 버튼 클릭 동작
  const handleQuarterButtonClick = (quarter) => {
    setSelectedQuarter(quarter);
  };

  // 데이터 요청 트리거 (selectedQuarter, currentMetric, perDirection, pbrDirection 변경 시)
  useEffect(() => {
    if (currentMetric && selectedQuarter) {
      fetchTopStocksByMetric();
    }
    // perDirection 또는 pbrDirection이 변경되었을 때도 재요청
  }, [selectedQuarter, currentMetric, perDirection, pbrDirection]);

  return (
    <div className="financial-statements-container">
      <h2 style={{ color: "#007bff", marginBottom: "20px" }}>분기별 재무제표</h2>

      {/* 정렬기준 버튼 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "10px",
        }}
      >
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
            style={{
              backgroundColor: currentMetric === metric ? "#007bff" : "#fff",
              color: currentMetric === metric ? "#fff" : "#000",
              border: "1px solid #007bff",
              borderRadius: "4px",
              padding: "5px 10px",
            }}
          >
            {/* PER, PBR인 경우 방향 표시 (↑: top, ↓: bottom) */}
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
          columnTitle={`${currentMetric} (${selectedQuarter})`} // 동적 제목
        />
      )}
    </div>
  );
};

export default QuarterlyFinancialPage;
