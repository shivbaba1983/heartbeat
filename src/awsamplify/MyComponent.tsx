import React, { useEffect, useState } from "react";

const MyComponent = () => {
  const [data, setData] = useState('');

        useEffect(() => {
          const fetchFiles = async () => {
            try {
              const res = await fetch(`https://main.d1rin969pdam05.amplifyapp.com/`);
              const temp = await res.text();
              //const fileNamesList = temp.files || [];
               // const fileNamesList = (temp.files || []).map(file => {
              //   const parts = file.split(".");
              //   parts.pop(); // remove the extension
              //   return parts.join("."); // in case filename had dots in name
              // });

  //       const respData=      await fetch('https://main.d1rin969pdam05.amplifyapp.com/')
  // .then(res => {
  //   console.log("Raw response:", res);
    
  //   return res.text(); // try text to see what the raw body looks like
  // })
  // .then(text => console.log("Response text:", text));


              setData(temp);
            } catch (err) {
              console.error('AWS Amplify API error:', err);
            }
          };
          fetchFiles();
        }, []);


  // useEffect(() => {
  //   fetch("https://main.d1rin969pdam05.amplifyapp.com/")
  //     .then((res) => res.json())
  //     .then((json) => setData(json))
  //     .catch((err) => console.error("API error:", err));
  // }, []);

  return (
    <div>
      <h2>API Response:</h2>
      <pre>{JSON.stringify(data)}</pre>
    </div>
  );
};

export default MyComponent;
