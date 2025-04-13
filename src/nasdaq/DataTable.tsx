import React, { useState, useEffect } from "react";
import optData from './../data/OptData.json';
import DownloadJSON from './../DownloadJSON/DownloadJson';


const DataTable = () => {
    const [tableData, setTableData] = useState(optData.data.table);
    const [writeData, setWriteData] = useState();


    useEffect(() => {
        fetch("./../data/OptData.json") // Ensure the JSON file is inside the 'public' folder
            .then((response) => response.json())
            .then((json) => setTableData(json.data.table))
            .catch((error) => console.error("Error loading JSON:", error));
    }, []);

    if (!tableData) {
        return <p>Loading data...</p>;
    }

    const headers = tableData.headers;
    const rows = tableData.rows;

    function writeToJsonFile() {

        //const filteredData = tableData?.filter((person) => person.c_Volume > 1000);
        setWriteData(tableData)
    }
    return (
        <div>
            <h2>Options Data Table</h2>
            {/* <p><strong>{json.data.lastTrade}</strong></p> */}
            <button onClick={() => writeToJsonFile()}>WriteData</button>
            {writeData? (<DownloadJSON writeData={writeData} headers={headers} />): (<div/>)}
            <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                    <tr>
                        <th>Expiry Group</th>
                        {Object.entries(headers).map(([key, label]) => (
                            <th key={key}>{key}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, index) => (
                        <tr key={index}>
                            <td>{row.expirygroup || "-"}</td>
                            {Object.keys(headers).map((key) => (
                                <td key={key} style={{ color: row[`${key}_colour`] ? "green" : "black" }}>
                                    {row[key] !== null ? row[key] : "-"}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>

        </div>
    );
};

export default DataTable;
