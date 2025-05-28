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
  document.getElementById("linkForm").querySelector("button[type=submit]").textContent = "Generating...";
  document.getElementById("linkForm").querySelector("button[type=submit]").disabled = true;
  
  try {
    // Handle logo upload if selected
    let logoUrl = "";
    const logoFile = document.getElementById("logoUpload").files[0];
    
    if (logoFile) {
      const storageRef = firebase.storage().ref();
      const logoRef = storageRef.child(`logos/${Date.now()}_${logoFile.name}`);
      await logoRef.put(logoFile);
      logoUrl = await logoRef.getDownloadURL();
    }
    
    const docRef = await db.collection("qr_links").add({ 
      companyName,
      description,
      links,
      logoUrl,
      createdAt: new Date()
    });
    
    const previewUrl = `https://manith003.github.io/multi-qr/preview.html?id=${docRef.id}`;

    // Generate QR as PNG
    QRCode.toDataURL(previewUrl, { width: 256 }, (err, url) => {
      if (err) return console.error(err);
      document.getElementById("qrPreview").src = url;
      document.getElementById("qrPreview").style.display = "block";
      document.getElementById("downloadBtns").style.display = "block";
      document.getElementById("qrCanvas").style.display = "none";

      // Reset button state
      document.getElementById("linkForm").querySelector("button[type=submit]").textContent = "Generate QR";
      document.getElementById("linkForm").querySelector("button[type=submit]").disabled = false;

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
    alert("Error generating QR code. Please try again.");
    // Reset button state
    document.getElementById("linkForm").querySelector("button[type=submit]").textContent = "Generate QR";
    document.getElementById("linkForm").querySelector("button[type=submit]").disabled = false;
  }
};