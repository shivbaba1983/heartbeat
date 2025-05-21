// src/components/OCRReader.tsx

import React, { useState } from 'react';
import Tesseract from 'tesseract.js';


const OCRReader = () => {
    const [imageData, setImageData] = useState();
    const [text, setText] = useState('');

    //const [volumes, setVolumes] = useState<{ call: number, put: number } | null>(null);

    const [callVolumes, setCallVolumes] = useState(0);
    const [putVolumes, setPutVolumes] = useState(0);
    const [loading, setLoading] = useState(false);

    const handleImageUpload = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageData(file);
        }
    };

    const extractVolumes = (ocrText) => {
        const lines = ocrText.split('\n');
        let callVolume = 0;
        let putVolume = 0;

        lines.forEach((line) => {
            const numbers = line.trim().split(/\s+/).map(Number).filter(n => !isNaN(n));

            // Check if line contains Call Volume and Put Volume
            if (numbers.length >= 6) {
                callVolume += numbers[0];  // Call Volume is the first number
                putVolume += numbers[5];   // Put Volume is the 9th number in each row
            }
        });

        //setVolumes({ call: callVolume, put: putVolume });
        setCallVolumes(callVolume);
        setPutVolumes(putVolume);
    };

    const handleOCR = async () => {
        if (!imageData) return;
        setLoading(true);

        const result = await Tesseract.recognize(imageData, 'eng', {
            logger: m => console.log(m),
        });

        const rawText = result.data.text;
        setText(rawText);
        //extractVolumes(rawText);
        parseAndSumVolumes(rawText);
        setLoading(false);
    };

    const parseAndSumVolumes = (rawText) => {
        const lines = rawText.split('\n');
        let totalCall = 0;
        let totalPut = 0;

        const parseVolume = (value)  => {
            const num = value.replace(/[^0-9.]/g, '');
            const multiplier = value.includes('K') ? 1000 : 1;
            return parseFloat(num) * multiplier;
        };

        for (let line of lines) {
            const match = line.match(/([0-9.]+[Kk]?)\s+[\d.]+\s+[\d.]+\s+[\d,]+\s+[\d.]+\s+[\d.]+\s+([0-9.]+[Kk]?)/);
            if (match) {
                const callVolume = parseVolume(match[1]);
                const putVolume = parseVolume(match[2]);
                totalCall += callVolume;
                totalPut += putVolume;
            }
        }

        setCallVolumes(Math.round(totalCall));
        setPutVolumes(Math.round(totalPut));
    };

    return (
        <div>
            <h2>SPX Option Volume Reader</h2>
            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e)} />
            <button onClick={handleOCR} disabled={!imageData || loading}>
                {loading ? 'Processing...' : 'Extract Volume'}
            </button>

            {callVolumes && (
                <div>
                    <h3>Results</h3>
                    <p style={{ color: 'green' }}>Total Call Volume: {callVolumes}</p>
                    <p style={{ color: 'red' }}>Total Put Volume: {putVolumes}</p>
                </div>
            )}

            {text && (
                <pre style={{ whiteSpace: 'pre-wrap', marginTop: 20 }}>
                    OCR Text Output:
                    {"\n"}
                    {text}
                </pre>
            )}
        </div>
    );
};

export default OCRReader;
