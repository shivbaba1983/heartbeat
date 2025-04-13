import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

//const OptionTable = ({ data, title }) => (
  const OptionTable = ({ data, title }) => {

  const [tempTableData, setTempTableData] = useState(data);

  useEffect(() => {
    setTempTableData(data);
  }, [data]);


   return (<div>
    <h3>{title}</h3>
    <table border="1" cellPadding={4} cellSpacing={0}>
      <thead>
        <tr>
          <th>Strike</th>
          <th>Last Price</th>
          <th>Bid</th>
          <th>Ask</th>
          <th>Volume</th>
          <th>Open Interest</th>
          <th>Expiry</th>
        </tr>
      </thead>
      <tbody>
        {tempTableData.map((item, i) => (
          <tr key={i}>
            <td>{item.strike}</td>
            <td>{item.c_Last}</td>
            <td>{item.c_Bid}</td>
            <td>{item.c_Ask}</td>
            <td>{item.c_Volume}</td>
            <td>{item.c_Openinterest}</td>
            <td>{item.expiryDate}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>)
  }

export default OptionTable;