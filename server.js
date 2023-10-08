const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const fsExtra = require('fs-extra');

const app = express();
const upload = multer({ dest: 'uploads/' });
app.use(cors()); // Enable CORS for all routes

app.post('/upload', upload.single('file'), async (req, res) => {
    const uploadedFile = req.file;
  
    if (!uploadedFile) {
      return res.status(400).send('No file uploaded.');
    }
  
    const originalFileName = uploadedFile.originalname;
    const fileExtension = path.extname(originalFileName); // Get the file extension
  
    // Generate a unique filename with the original extension
    const newFileName = `${originalFileName.slice(0, -fileExtension.length)}_${Date.now()}${fileExtension}`;
    const filePath = path.join('uploads', newFileName);
  
    // Move the uploaded file to the new location with the new filename
    fs.renameSync(uploadedFile.path, filePath);
  
    // Notify the user that the file is being uploaded
    res.status(200).send(`File '${originalFileName}' is being uploaded...`);
  
    const workbook = new exceljs.Workbook();
    await workbook.xlsx.readFile(filePath);
  
    // ... Rest of your code for Excel operations ...
  
    // Generate the filename for the downloaded file with the same extension
    const downloadedFileName = newFileName;
    const downloadedFilePath = path.join('downloads', downloadedFileName);
  
    await workbook.xlsx.writeFile(downloadedFilePath);
  
    // Cleanup: Delete the temporary uploaded file and the temporary downloaded file after sending it
    fs.unlinkSync(filePath);
    fs.unlinkSync(downloadedFilePath);
  
    // Notify the user that the file is ready for download
    res.status(200).send(`File '${originalFileName}' uploaded and ready for download.`);
  });
  

  app.get('/list-uploads', (req, res) => {
    const uploadsFolder = 'uploads';
  
    // Use fs-extra to get a list of files in the 'uploads' folder
    fsExtra.readdir(uploadsFolder, (err, files) => {
      if (err) {
        return res.status(500).send('Error listing files.');
      }
  
      // Send the list of files as JSON
      res.json({ files });
    });
  });


  // Add this route to your Express server
app.get('/download/:fileName', (req, res) => {
  const fileName = req.params.fileName;
  const filePath = path.join(__dirname, 'uploads', fileName);

  // Check if the file exists
  if (fs.existsSync(filePath)) {
    // Set the appropriate headers for the response
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.setHeader('Content-Type', 'application/octet-stream');

    // Create a readable stream from the file and pipe it to the response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } else {
    res.status(404).send('File not found');
  }
});

// Add this route to your Express server
app.delete('/delete/:fileName', (req, res) => {
    const fileName = req.params.fileName;
    const filePath = path.join(__dirname, 'uploads', fileName);
  
    // Check if the file exists
    if (fs.existsSync(filePath)) {
      // Delete the file
      fs.unlinkSync(filePath);
      res.status(200).send(`File '${fileName}' has been deleted.`);
    } else {
      res.status(404).send('File not found');
    }
  });
  
app.listen(3000, () => console.log('Server started on port 3000'));