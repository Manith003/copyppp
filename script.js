// Logo preview functionality
document.getElementById("logoUpload").addEventListener("change", function(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  // Check file size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    alert("File size must be less than 2MB");
    this.value = "";
    return;
  }
  
  const reader = new FileReader();
  reader.onload = function(event) {
    document.getElementById("logoPreviewImg").src = event.target.result;
    document.getElementById("logoPreviewImg").style.display = "block";
  };
  reader.readAsDataURL(file);
});

document.getElementById("addLink").onclick = () => {
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Enter another link";
  input.classList.add("link-input");
  document.getElementById("linkForm").insertBefore(input, document.getElementById("addLink"));
};

document.getElementById("linkForm").onsubmit = async (e) => {
  e.preventDefault();

  const companyName = document.getElementById("companyName").value.trim();
  if (!companyName) return alert("Please enter a company name");
  
  const description = document.getElementById("companyDescription").value.trim();
  const links = Array.from(document.getElementsByClassName("link-input"))
    .map(i => i.value.trim())
    .filter(Boolean);

  if (!links.length) return alert("Please enter at least one link");

  // Show loading indicator
  const submitButton = document.getElementById("linkForm").querySelector("button[type=submit]");
  submitButton.textContent = "Generating...";
  submitButton.disabled = true;
  
  try {
    // Handle logo upload - convert to base64 instead of Firebase Storage
    let logoBase64 = "";
    const logoFile = document.getElementById("logoUpload").files[0];
    
    if (logoFile) {
      // Convert file to base64 string
      logoBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(logoFile);
      });
    }
    
    // Save data to Firestore with base64 logo
    const docRef = await db.collection("qr_links").add({ 
      companyName,
      description,
      links,
      logoUrl: logoBase64, // Store as base64 string
      createdAt: new Date()
    });
    
    const previewUrl = `https://manith003.github.io/multi-qr/preview.html?id=${docRef.id}`;

    // Generate QR as PNG
    QRCode.toDataURL(previewUrl, { width: 256 }, (err, url) => {
      if (err) {
        console.error(err);
        submitButton.textContent = "Generate QR";
        submitButton.disabled = false;
        alert("Error generating QR code. Please try again.");
        return;
      }
      
      document.getElementById("qrPreview").src = url;
      document.getElementById("qrPreview").style.display = "block";
      document.getElementById("downloadBtns").style.display = "block";
      document.getElementById("qrCanvas").style.display = "none";

      // Reset button state
      submitButton.textContent = "Generate QR";
      submitButton.disabled = false;

      // Download PNG
      document.getElementById("downloadPng").onclick = () => {
        const a = document.createElement("a");
        a.href = url;
        a.download = `${companyName}-qr-code.png`;
        a.click();
      };
      
      // Generate SVG
      QRCode.toString(previewUrl, { type: 'svg' }, (err, svg) => {
        if (err) return console.error(err);

        document.getElementById("downloadSvg").onclick = () => {
          const blob = new Blob([svg], { type: "image/svg+xml" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${companyName}-qr-code.svg`;
          a.click();
          URL.revokeObjectURL(url);
        };
      });
    });

  } catch (error) {
    console.error("Error saving to Firebase:", error);
    alert("Error generating QR code: " + error.message);
    // Reset button state
    submitButton.textContent = "Generate QR";
    submitButton.disabled = false;
  }
};