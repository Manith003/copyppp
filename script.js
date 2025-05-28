// Initialize Firebase Storage
const storage = firebase.storage();

// Logo upload functionality
let uploadedLogoUrl = null;

document.getElementById("uploadLogoBtn").addEventListener("click", function() {
  document.getElementById("companyLogo").click();
});

document.getElementById("companyLogo").addEventListener("change", function(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const preview = document.getElementById("logoPreview");
  const reader = new FileReader();
  
  reader.onload = function(e) {
    preview.innerHTML = `<img src="${e.target.result}" alt="Company Logo">`;
    
    // Store the file for later upload
    uploadedLogoUrl = e.target.result;
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
  
  const links = Array.from(document.getElementsByClassName("link-input"))
    .map(i => i.value.trim())
    .filter(Boolean);

  if (!links.length) return alert("Please enter at least one link");

  try {
    // Create document data
    const docData = {
      companyName,
      links
    };
    
    // If we have a logo, add it to the data
    if (uploadedLogoUrl) {
      // Upload logo to Firebase Storage (if using Firebase Storage)
      // For this example, we'll just store the data URL in Firestore
      // In a production app, you'd upload this to Firebase Storage first
      docData.logoUrl = uploadedLogoUrl;
    }
    
    const docRef = await db.collection("qr_links").add(docData);
    const previewUrl = `https://manith003.github.io/copyppp/preview.html?id=${docRef.id}`;

    // Generate QR as PNG
    QRCode.toDataURL(previewUrl, { width: 256 }, (err, url) => {
      if (err) return console.error(err);
      document.getElementById("qrPreview").src = url;
      document.getElementById("qrPreview").style.display = "block";
      document.getElementById("downloadBtns").style.display = "block";

      // Download PNG
      document.getElementById("downloadPng").onclick = () => {
        const a = document.createElement("a");
        a.href = url;
        a.download = `${companyName}-qr-code.png`;
        a.click();
      };
    });

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

  } catch (error) {
    console.error("Error saving links to Firebase:", error);
  }
};