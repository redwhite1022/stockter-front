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
  const [showYearButtons, setShowYearButtons] = useState(false);

  // PER/PBR 방향 (오름차순/내림차순)
  const [perDirection, setPerDirection] = useState("asc");
  const [pbrDirection, setPbrDirection] = useState("asc");

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
    } else if (currentMetric === "매출액") {
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
    } else if (currentMetric === "영업이익") {
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
    } else if (currentMetric === "영업이익률") {
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
    } else if (currentMetric === "순이익률") {
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
    } else if (currentMetric === "EPS") {
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
    } else if (currentMetric === "PER") {
      const perEndpoint =
        perDirection === "desc"
          ? "https://port-0-stockter-back-m5or7nt39f4a0f5c.sel4.cloudtype.app/top-per"
          : "https://port-0-stockter-back-m5or7nt39f4a0f5c.sel4.cloudtype.app/bottom-per";
      axios
        .get(perEndpoint, { params: { year: selectedYear } })
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
      const pbrEndpoint =
        pbrDirection === "desc"
          ? "https://port-0-stockter-back-m5or7nt39f4a0f5c.sel4.cloudtype.app/top-pbr"
          : "https://port-0-stockter-back-m5or7nt39f4a0f5c.sel4.cloudtype.app/bottom-pbr";
      axios
        .get(pbrEndpoint, { params: { year: selectedYear } })
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
    } else if (currentMetric === "시가배당률") {
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
    } else if (currentMetric === "ROE") {
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
    } else {
      setError(`"${currentMetric}" 기능은 아직 구현되지 않았습니다.`);
      setStocks([]);
    }
  };

  const handleButtonClick = (metric) => {
    if (metric === "PER") {
      if (currentMetric === "PER") {
        setPerDirection((prevDirection) => (prevDirection === "asc" ? "desc" : "asc"));
      } else {
        setPerDirection("asc");
      }
    } else if (metric === "PBR") {
      if (currentMetric === "PBR") {
        setPbrDirection((prevDirection) => (prevDirection === "asc" ? "desc" : "asc"));
      } else {
        setPbrDirection("asc");
      }
    }
    setCurrentMetric(metric);
    if (metric !== "시가총액") {
      setShowYearButtons(true);
      setSelectedYear("2024");
    } else {
      setShowYearButtons(false);
      setSelectedYear(null);
    }
  };

  const handleYearButtonClick = (year) => {
    setSelectedYear(year);
  };

  useEffect(() => {
    if (currentMetric) {
      fetchTopStocksByMetric();
    }
  }, [selectedYear, currentMetric, perDirection, pbrDirection]);

  return (
    <div className="financial-statements-container">
      <h2 className="financial-statements-title">재무제표</h2>

      <div className="button-group">
        <button onClick={() => handleButtonClick("시가총액")}
                className={currentMetric === "시가총액" ? "active" : ""}>
          시가총액
        </button>

        <button onClick={() => handleButtonClick("매출액")}
                className={currentMetric === "매출액" ? "active" : ""}>
          매출액
        </button>

        <button onClick={() => handleButtonClick("영업이익")}
                className={currentMetric === "영업이익" ? "active" : ""}>
          영업이익
        </button>

        <button onClick={() => handleButtonClick("영업이익률")}
                className={currentMetric === "영업이익률" ? "active" : ""}>
          영업이익률
        </button>

        <button onClick={() => handleButtonClick("순이익률")}
                className={currentMetric === "순이익률" ? "active" : ""}>
          순이익률
        </button>

        <button onClick={() => handleButtonClick("ROE")}
                className={currentMetric === "ROE" ? "active" : ""}>
          ROE
        </button>

        <button onClick={() => handleButtonClick("EPS")}
                className={currentMetric === "EPS" ? "active" : ""}>
          EPS
        </button>

        <button onClick={() => handleButtonClick("PER")}
                className={currentMetric === "PER" ? "active" : ""}>
          PER {currentMetric === "PER" ? (perDirection === "asc" ? "↑" : "↓") : ""}
        </button>

        <button onClick={() => handleButtonClick("PBR")}
                className={currentMetric === "PBR" ? "active" : ""}>
          PBR {currentMetric === "PBR" ? (pbrDirection === "asc" ? "↑" : "↓") : ""}
        </button>

        <button onClick={() => handleButtonClick("시가배당률")}
                className={currentMetric === "시가배당률" ? "active" : ""}>
          시가배당률
        </button>
      </div>

      {showYearButtons && (
        <div className="year-buttons">
          {["2021", "2022", "2023", "2024"].map((year) => (
            <button key={year}
                    onClick={() => handleYearButtonClick(year)}
                    className={selectedYear === year ? "active" : ""}>
              {year}
            </button>
          ))}
        </div>
      )}

      {error && <p className="error-message">{error}</p>}

      {stocks.length > 0 && (
        <SimpleTable stocks={stocks} columnTitle={currentMetric} />
      )}
    </div>
  );
};

export default FinancialStatementsPage;
