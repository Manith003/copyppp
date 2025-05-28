const id = new URLSearchParams(window.location.search).get("id");

if (id) {
  db.collection("qr_links").doc(id).get().then(doc => {
    if (doc.exists) {
      const data = doc.data();
      const companyName = data.companyName || "Company";
      const description = data.description || "";
      const links = data.links;
      const logoUrl = data.logoUrl;
      
      // Set the company name in the title and heading
      document.title = `${companyName} - Links`;
      document.getElementById("pageTitle").textContent = "Links Preview";
      document.getElementById("companyName").textContent = companyName;
      
      // Set the description if available
      if (description) {
        document.getElementById("companyDescription").textContent = description;
        document.getElementById("companyDescription").style.display = "block";
      } else {
        document.querySelector(".description-container").style.display = "none";
      }
      
      // Set the company logo if available
      if (logoUrl) {
        document.getElementById("companyLogo").src = logoUrl; // This works with both URLs and base64
        document.getElementById("companyLogo").alt = `${companyName} logo`;
        document.querySelector(".logo-container").style.display = "flex";
      } else {
        document.querySelector(".logo-container").style.display = "none";
      }
      
      // Create links list
      const ul = document.getElementById("linkList");
      links.forEach((link, index) => {
        const li = document.createElement("li");
        li.innerHTML = `<span class="link-number">${index + 1}</span><a href="${link}" target="_blank">${link}</a>`;
        ul.appendChild(li);
      });
    } else {
      document.body.innerHTML = "<p>Invalid or expired QR code.</p>";
    }
  }).catch(error => {
    console.error("Error loading QR data:", error);
    document.body.innerHTML = "<p>Error loading QR data. Please try again.</p>";
  });
} else {
  document.body.innerHTML = "<p>No QR ID provided.</p>";
}