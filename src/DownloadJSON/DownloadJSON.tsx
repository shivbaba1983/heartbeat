import React, { useState } from "react";

function DownloadJSON({writeData, headers}) {
//   const [tableData, setTableData] = useState([
//     { id: 1, name: "Alice", age: 25 },
//     { id: 2, name: "Bob", age: 30 },
//     { id: 3, name: "Charlie", age: 22 },
//   ]);

  const downloadJSON = () => {
    const jsonString = JSON.stringify(writeData, null, 2); // Convert to JSON format
    const blob = new Blob([jsonString], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "writeData.json";
    link.click();
  };

  return (
    <div>
      <h2>Write Table Data</h2>
      {/* <table border="1">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Age</th>
          </tr>
        </thead>
        <tbody>
          {writeData.map((row) => (
            <tr key={row.id}>
              <td>{row.id}</td>
              <td>{row.name}</td>
              <td>{row.age}</td>
            </tr>
          ))}
        </tbody>
      </table> */}

      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                    <tr>
                        <th>Expiry Group</th>
                        {Object.entries(headers).map(([key, label]) => (
                            <th key={key}>{key}</th>
                        ))}
                    </tr>
                </thead>
                {/* <tbody>
                    {writeData?.map((row, index) => (
                        <tr key={index}>
                            <td>{row.expirygroup || "-"}</td>
                            {Object.keys(headers).map((key) => (
                                <td key={key} style={{ color: row[`${key}_colour`] ? "green" : "black" }}>
                                    {row[key] !== null ? row[key] : "-"}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody> */}
            </table>
      <br />
      <button onClick={downloadJSON}>Download JSON</button>
    </div>
  );
}

export default DownloadJSON;
