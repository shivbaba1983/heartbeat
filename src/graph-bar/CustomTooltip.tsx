const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border rounded shadow p-2">
          <p><strong>Strike:</strong> {label}</p>
          <p><strong>Volume:</strong> {data.volume}</p>
          <p><strong>Bid:</strong> {data.bid}</p>
          <p><strong>Expiry:</strong> {data.expiry}</p>
          <p><strong>Open Interest:</strong> {data.openInterest}</p>
        </div>
      );
    }
    return null;
  };

  export default CustomTooltip;