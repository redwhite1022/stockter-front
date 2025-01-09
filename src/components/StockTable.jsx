const StockTable = ({ stocks }) => {
    if (stocks.length === 0) {
        return <p className="error-message">표시할 데이터가 없습니다.</p>;
    }

    const years = ["2021", "2022", "2023", "2024"];
    const financialKeys = [
        "매출액",
        "영업이익",
        "영업이익률",
        "순이익률",
        "EPS",
        "PER",
        "PBR",
        "주당배당금",
        "시가배당률",
    ];

    const unitMap = {
        "EPS": "(원)",
        "PER": "(배)",
        "PBR": "(배)",
        "주당배당금": "(원)",
        "시가배당률": "(%)",
        "영업이익률": "(%)",
        "순이익률": "(%)",
    };

    const cleanValue = (value, key) => {
        if (!value || value === "-" || value === "N/A" || value === "") return "N/A";

        const numericValue = parseFloat(value.toString().replace(/,/g, ""));

        // 매출액과 영업이익은 조 단위와 억 단위로 표시
        if (key === "매출액" || key === "영업이익") {
            const trillionPart = Math.floor(numericValue / 10000); // 조 단위
            const billionPart = numericValue % 10000; // 억 단위

            if (trillionPart > 0) {
                return `${trillionPart}조 ${billionPart}억`;
            }
            return `${billionPart}억`; // 억 단위만 있을 경우
        }

        // 비율 값(%)
        if (key === "영업이익률" || key === "순이익률" || key === "시가배당률") {
            return `${numericValue}%`;
        }

        // 원 단위
        if (key === "EPS" || key === "주당배당금") {
            return `${numericValue}원`;
        }

        // 배 단위
        if (key === "PER" || key === "PBR") {
            return `${numericValue}배`;
        }

        return value.toString().replace(/,/g, ""); // 기본값: 쉼표 제거 후 반환
    };

    const transformedData = financialKeys.map((key) => {
        const rowData = { key };

        years.forEach((year) => {
            const columnNameWithUnit = `${year}.12 ${key}${unitMap[key] || ""}`;
            const columnNameWithoutUnit = `${year}.12 ${key}`;
            const value =
                columnNameWithUnit in stocks[0]
                    ? stocks[0][columnNameWithUnit]
                    : columnNameWithoutUnit in stocks[0]
                    ? stocks[0][columnNameWithoutUnit]
                    : "N/A";

            rowData[year] = cleanValue(value, key);
        });

        return rowData;
    });

    console.log("Transformed Data for Row-Based Table:", transformedData);

    return (
        <div className="table-container">
            <table>
                <thead>
                    <tr>
                        <th>항목</th>
                        {years.map((year, index) => (
                            <th key={index}>{year}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {transformedData.map((row, index) => (
                        <tr key={index}>
                            <td>{row.key}</td>
                            {years.map((year, idx) => (
                                <td key={idx}>{row[year]}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default StockTable;
