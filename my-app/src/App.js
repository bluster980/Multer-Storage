import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function App() {
  const [file, setFile] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [downloadFileName, setDownloadFileName] = useState('');
  const [deleteFileName, setDeleteFileName] = useState('');
  const [successMessage, setSuccessMessage] = useState(null);
  
  // Use the useRef hook to create a ref for the file input
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchUploadedFiles();
  }, []);

  const handleChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post('http://localhost:3000/upload', formData);

      // Clear the file input field and file name
      fileInputRef.current.value = null;
      setFile(null);

      setSuccessMessage('File uploaded successfully');

      // Refresh the list of uploaded files after a successful upload
      fetchUploadedFiles();
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file');
    }
  };

  const fetchUploadedFiles = async () => {
    try {
      const response = await axios.get('http://localhost:3000/list-uploads');
      setUploadedFiles(response.data.files);
    } catch (error) {
      console.error('Error fetching uploaded files:', error);
    }
  };

  const handleDownload = async (e) => {
    e.preventDefault();
  
    if (!downloadFileName) {
      alert('Please enter a filename.');
      return;
    }
  
    try {
      const response = await axios.get(`http://localhost:3000/download/${encodeURIComponent(downloadFileName)}`, {
        responseType: 'blob', // This ensures the response is treated as a binary blob
      });
  
      // Create a temporary URL for the blob and trigger a download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', downloadFileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  
      // Clear the input box by resetting the downloadFileName state
      setDownloadFileName('');
    } catch (error) {
      alert('File not found or an error occurred while downloading.');
      console.error('Error downloading file:', error);
    }
  };
  
  const handleDelete = async (e) => {
    e.preventDefault();

    if (!deleteFileName) {
      alert('Please enter a filename to delete.');
      return;
    }

    try {
      // Send a DELETE request to your server to delete the file
      await axios.delete(`http://localhost:3000/delete/${encodeURIComponent(deleteFileName)}`);
      setSuccessMessage(`File '${deleteFileName}' has been deleted.`);

      // Clear the input box for file deletion
      setDeleteFileName('');

      // Refresh the list of uploaded files after deletion
      fetchUploadedFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Error deleting file');
    }
  };


  return (
    <div className="container">
      <form onSubmit={handleUpload}>
        <input type="file" onChange={handleChange} ref={fileInputRef} className="file-input" />
        <button type="submit" className="button">
          Upload
        </button>
      </form>

      <h2>Uploaded Files:</h2>
      <ul className="ul">
        {uploadedFiles.map((fileName, index) => (
          <li key={index} className="li">
            {fileName}
            {' '}
            <a href={`http://localhost:3000/download/${encodeURIComponent(fileName)}`} download>
              Download
            </a>
          </li>
        ))}
      </ul>

      <h2>Download File:</h2>
      <div>
        <input
          type="text"
          placeholder="Enter filename"
          value={downloadFileName}
          onChange={(e) => setDownloadFileName(e.target.value)}
        />
        <button onClick={handleDownload} className="button">
          Download
        </button>
      </div>

      <h2>Delete File:</h2>
      <div>
        <input
          type="text"
          placeholder="Enter filename to delete"
          value={deleteFileName}
          onChange={(e) => setDeleteFileName(e.target.value)} // Capture input for deletion
        />
        <button onClick={handleDelete} className="button">
          Delete
        </button>
      </div>

      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}
    </div>
  );
}

export default App;