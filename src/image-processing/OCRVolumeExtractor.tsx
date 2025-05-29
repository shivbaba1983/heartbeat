import React, { useState } from 'react';
import Tesseract from 'tesseract.js';

const OCRVolumeExtractor = () => {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState({ callVolume: 0, putVolume: 0 });
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
      extractVolumes(imageUrl);
    }
  };

const extractVolumes = async (imageSrc) => {
  setLoading(true);
  try {
    const { data: { text } } = await Tesseract.recognize(imageSrc, 'eng');
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

    let callVolume = 0;
    let putVolume = 0;
    let inTable = false;

    for (const line of lines) {
      // Activate only when inside the table range
      if (line.includes('May-28-25')) {
        inTable = true;
        continue;
      }

      if (inTable) {
        const parts = line.split(/\s+/);
        if (parts.length < 6) continue;

        // Try to get call volume (first column)
        const callVolStr = parts[0];
        const callVol = parseVolume(callVolStr);
        if (!isNaN(callVol)) {
          callVolume += callVol;
        }

        // Try to get put volume (last column)
        const putVolStr = parts[parts.length - 1];
        const putVol = parseVolume(putVolStr);
        if (!isNaN(putVol)) {
          putVolume += putVol;
        }
      }
    }

    setResult({ callVolume, putVolume });
  } catch (err) {
    console.error('OCR Error:', err);
  } finally {
    setLoading(false);
  }
};

// Converts "3.1K" -> 3100, "4800" -> 4800
const parseVolume = (volStr) => {
  if (!volStr) return 0;
  volStr = volStr.replace(',', '').toUpperCase();
  if (volStr.endsWith('K')) {
    return parseFloat(volStr.replace('K', '')) * 1000;
  }
  return parseInt(volStr);
};

  return (
    <div className="p-4 max-w-lg mx-auto bg-gray-50 rounded shadow-md">
      <h1 className="text-xl font-semibold mb-4">SPX Volume OCR Extractor</h1>
      <input type="file" accept="image/*" onChange={handleImageUpload} className="mb-4" />
      {loading && <p>Processing image...</p>}
      {image && <img src={image} alt="Uploaded" className="mb-4 max-h-96" />}
      {!loading && (result.callVolume || result.putVolume) && (
        <div className="text-lg">
          <p><strong>Call Volume:</strong> {result.callVolume.toLocaleString()}</p>
          <p><strong>Put Volume:</strong> {result.putVolume.toLocaleString()}</p>
        </div>
      )}
    </div>
  );
};

export default OCRVolumeExtractor;
