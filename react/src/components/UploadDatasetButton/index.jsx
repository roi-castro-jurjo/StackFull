import React, { useState } from 'react';
import { ClipLoader } from 'react-spinners';

export function UploadDatasetButton() {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
        setMessage('');
    };

    const handleUpload = async () => {
        if (!file) {
            setMessage('Please select a file first.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setLoading(true);
        try {
            const response = await fetch('http://localhost:8000/datasets/upload-dataset/', {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();
            if (response.ok) {
                setMessage('File uploaded and data inserted successfully.');
            } else {
                setMessage(`Error: ${result.error}`);
            }
        } catch (error) {
            setMessage(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4 text-center">
            <p className="mb-4 text-lg">Upload your dataset...</p>
            <input 
                type="file" 
                onChange={handleFileChange} 
                className="mb-4 p-2 border rounded w-full"
            />
            <button 
                onClick={handleUpload} 
                className="bg-blue-500 text-white px-4 py-2 rounded w-full"
                disabled={loading}
            >
                {loading ? 'Uploading...' : 'Upload Dataset'}
            </button>
            {message && <p className="mt-4 text-red-500">{message}</p>}
            {loading && (
                <div className="mt-4">
                    <ClipLoader color={"#123abc"} loading={loading} size={50} />
                    <p>Uploading, please wait...</p>
                </div>
            )}
        </div>
    );
}