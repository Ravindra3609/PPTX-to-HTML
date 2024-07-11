const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { exec } = require('child_process');

const app = express();
const port = 3001;

// Enable CORS
app.use(cors());

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

// Endpoint to handle file upload and conversion
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const filePath = req.file.path;
  const pdfFileName = `${req.file.filename}.pdf`;
  const pdfFilePath = path.join(__dirname, 'public', pdfFileName);

  exec(`unoconv -f pdf -o ${pdfFilePath} ${filePath}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error during PPTX conversion: ${error.message}`);
      return res.status(500).send(`Error converting PPTX to PDF: ${error.message}`);
    }

    if (stderr) {
      console.error(`Conversion stderr: ${stderr}`);
    }

    console.log(`Conversion stdout: ${stdout}`);
    console.log(`PDF file saved to ${pdfFilePath}`);
    res.json({ url: `http://localhost:3001/${pdfFileName}` });
  });
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
