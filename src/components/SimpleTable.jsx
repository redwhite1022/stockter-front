import React from "react";
import "../styles/FinancialStatementsPage.css";

const SimpleTable = ({ stocks, columnTitle }) => {
    return (
        <div className="table-container">
            <table>
                <thead>
                    <tr>
                        <th>순위</th>
                        <th>종목명</th>
                        <th>{columnTitle}</th> {/* 동적으로 제목 표시 */}
                    </tr>
                </thead>
                <tbody>
                    {stocks.map((stock, index) => (
                        <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{stock["종목명"]}</td>
                            {/* columnTitle에 해당하는 데이터 동적 가져오기 */}
                            <td>{stock[columnTitle] !== undefined ? stock[columnTitle] : "데이터 없음"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default SimpleTable;
