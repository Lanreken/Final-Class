exports.verificationPage = (title, message) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f9;
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: flex-start;
              height: 100vh;
          }
          .container {
              margin-top: 50px;
              background: #fff;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 4px 10px rgba(0,0,0,0.1);
              text-align: center;
              width: 400px;
          }
          h1 {
              color: #4CAF50;
              margin-bottom: 20px;
          }
          p {
              color: #555;
              font-size: 16px;
          }
          .error h1 {
              color: #e74c3c;
          }
          .warning h1 {
              color: #f39c12;
          }
      </style>
  </head>
  <body>
      <div class="container ${title.includes("not found") ? "error" : title.includes("already") ? "warning" : ""}">
          <h1>${title}</h1>
          <p>${message}</p>
      </div>
  </body>
  </html>
  `;
}
