const id = new URLSearchParams(window.location.search).get("id");

if (id) {
  db.collection("qr_links").doc(id).get().then(doc => {
    if (doc.exists) {
      const data = doc.data();
      const companyName = data.companyName || "Company";
      const links = data.links;
      const logoUrl = data.logoUrl || null;
      
      // Set the company name in the title and heading
      document.title = `${companyName} - Links`;
      document.getElementById("pageTitle").textContent = "Links Preview";
      document.getElementById("companyName").textContent = companyName;
      
      // Create logo container
      const headerContainer = document.querySelector('.header-container');
      const logoContainer = document.createElement('div');
      logoContainer.className = 'logo-container';
      
      // If we have a logo URL, use it; otherwise create a text logo
      if (logoUrl) {
        const logoImg = document.createElement('img');
        logoImg.src = logoUrl;
        logoImg.alt = companyName;
        logoImg.style.width = '100%';
        logoImg.style.height = '100%';
        logoImg.style.borderRadius = '50%';
        logoImg.style.objectFit = 'cover';
        logoContainer.appendChild(logoImg);
      } else {
        // Create text logo with first letter of company name
        const logo = document.createElement('div');
        logo.className = 'logo';
        logo.textContent = companyName.charAt(0).toUpperCase();
        logoContainer.appendChild(logo);
      }
      
      headerContainer.insertBefore(logoContainer, document.getElementById('pageTitle'));
      
      // Add company description
      const description = document.createElement('p');
      description.className = 'company-description';
      description.textContent = `${companyName} is a premier business providing quality services and products. We prioritize customer satisfaction and work to deliver exceptional value.`;
      headerContainer.appendChild(description);
      
      // Render links
      const ul = document.getElementById("linkList");
      ul.innerHTML = ''; // Clear existing content
      
      links.forEach((link, index) => {
        const li = document.createElement("li");
        
        // Create icon container
        const iconContainer = document.createElement('div');
        iconContainer.className = 'link-icon';
        
        // Add map icon image
        const icon = document.createElement('img');
        icon.src = 'https://maps.google.com/mapfiles/ms/icons/red-dot.png';
        icon.alt = 'Location';
        icon.style.width = '100%';
        icon.style.height = '100%';
        iconContainer.appendChild(icon);
        
        // Create link element
        const linkEl = document.createElement('a');
        linkEl.href = link;
        linkEl.target = "_blank";
        linkEl.textContent = link.includes('maps.google.com') ? `Location ${index + 1}` : link;
        
        // Create arrow icon
        const arrow = document.createElement('span');
        arrow.className = 'arrow-icon';
        arrow.innerHTML = '→';
        
        // Create hidden span for link number (preserving original functionality)
        const linkNumber = document.createElement('span');
        linkNumber.className = 'link-number';
        linkNumber.textContent = index + 1;
        
        // Assemble elements
        li.appendChild(linkNumber);
        li.appendChild(iconContainer);
        li.appendChild(linkEl);
        li.appendChild(arrow);
        
        ul.appendChild(li);
      });
      
      // Add footer
      const footer = document.createElement('div');
      footer.className = 'footer';
      footer.textContent = `© ${new Date().getFullYear()} ${companyName}. All rights reserved.`;
      document.body.appendChild(footer);
      
    } else {
      document.body.innerHTML = "<p style='color: white; text-align: center; padding: 20px;'>Invalid or expired QR code.</p>";
    }
  });
} else {
  document.body.innerHTML = "<p style='color: white; text-align: center; padding: 20px;'>No QR ID provided.</p>";
}