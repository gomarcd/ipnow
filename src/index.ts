export default {
	async fetch(request: Request): Promise<Response> {
		const { headers } = request;
		const ip = headers.get("cf-connecting-ip") || "IP not available";
		const acceptHeader = headers.get("accept") || "";
		const userAgent = headers.get("user-agent") || "";

		// Parse the request URL and check for robots.txt
		const url = new URL(request.url);

		if (url.pathname === "/robots.txt") {
			const robotsTxt = `
		User-agent: Googlebot
		Disallow: /private/
		Allow: /

		User-agent: Bingbot
		Disallow: /not-for-bing/
		Allow: /

		User-agent: *
		Disallow: /sensitive-data/
		Allow: /
			`;
			
		return new Response(robotsTxt, {
		  headers: { "Content-Type": "text/plain" }
		});
	  }
  	  
		// Return plain text to curl requests and send Cronitor heartbeat
		if (userAgent.includes("curl") || acceptHeader.includes("text/plain")) {		
		return new Response(`${ip}\n`, {
			headers: { "Content-Type": "text/plain" }
		});
		}

	  const html = `
	  <!DOCTYPE html>
	  <html lang="en">
		  <head>
			  <script defer data-domain="myip.fail" src="https://plausible.io/js/script.js"></script>
			  <meta charset="UTF-8">
			  <meta name="viewport" content="width=device-width, initial-scale=1.0">
			  <meta name="description" content="Quickly find your public IP address using myip.fail. Instantly see and copy your IP with no extra steps!" />
			  <meta name="keywords" content="What is my IP, IP address lookup, find my IP address, check my IP, IP location" />				
			  <title>Instant IP Lookup | myip.fail</title>
			  <style>
				  body { 
					  background-color: #f4f4f4;
					  color: #000;
					  font-family: Arial, sans-serif;
					  display: flex;
					  justify-content: center;
				  }
				  h1 { font-size: 24px; }
				  .ip {
					  overflow-wrap: break-word;
					  word-wrap: break-word;
					  cursor: pointer;
					  background-color: white;
					  padding: 30px;
					  margin-top: 45px;
					  border-radius: 10px;
					  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
					  text-align: center;
					  width: 280px;
				  }
				  .notification {
					  display: none;
					  background-color: #4CAF50;
					  color: white;
					  padding: 10px;
					  position: fixed;
					  bottom: 20px;
					  right: 20px;
					  z-index: 1000;
					  border-radius: 5px;
				  }
				  
				  svg {
					  cursor: pointer;
					  padding: 4px;
					  border-radius: 5px;
					  width: 18px;
					  height: 18px;
					  vertical-align: -4px;
					  transition: transform 0.1s ease, fill 0.1s ease;
				  }

				  /* Apply hover effects only on devices that support hover (desktops/laptops) */
				  @media (hover: hover) {
					  .card svg:hover {
						  background-color: #e0e0e0;
						  fill: #4e5256;
					  }

					  .social-links svg:hover {
						  background-color: #e0e0e0;
					  }

					  .card svg:active {
						  transform: scale(0.95);
					  }
				  }

				  @media (prefers-color-scheme: dark) {
					  body {
						  background-color: #121212;
						  color: #f0f0f0;
					  }

					  .ip {
						  background-color: #1e1e1e;
						  color: #f0f0f0;
						  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.7);
					  }

					  svg {
						  fill: #f0f0f0;
					  }

					  /* Dark mode hover effects (only for hover-enabled devices) */
					  @media (hover: hover) {
						  .card svg:hover {
							  background-color: #333;
							  fill: #ffffff;
						  }

						  .social-links svg:hover {
							  background-color: #333;
							  fill: #f0f0f0;
						  }
					  }
				  }

				  .social-links {
					  position: fixed;
					  bottom: 20px;
					  right: 20px;
					  display: flex;
					  gap: 10px;
				  }

				  .social-links {
					  font-size: 24px;
					  text-decoration: none;
				  }
			  </style>

		  </head>
		<body>
		  <div onclick="copyToClipboard()" class="ip card" id="ip">
			  <h1>${ip} 
			  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M760-200H320q-33 0-56.5-23.5T240-280v-560q0-33 23.5-56.5T320-920h280l240 240v400q0 33-23.5 56.5T760-200ZM560-640v-200H320v560h440v-360H560ZM160-40q-33 0-56.5-23.5T80-120v-560h80v560h440v80H160Zm160-800v200-200 560-560Z"/></svg>
			  </h1>
		  </div>
		  <div class="notification" id="notification">
			IP address copied to clipboard!
		  </div>

		  <div class="social-links">
			  <a href="https://twitter.com/gomarcd" target="_blank" aria-label="Twitter">
				  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M459.4 151.7c.3 4.5 .3 9.1 .3 13.6 0 138.7-105.6 298.6-298.6 298.6-59.5 0-114.7-17.2-161.1-47.1 8.4 1 16.6 1.3 25.3 1.3 49.1 0 94.2-16.6 130.3-44.8-46.1-1-84.8-31.2-98.1-72.8 6.5 1 13 1.6 19.8 1.6 9.4 0 18.8-1.3 27.6-3.6-48.1-9.7-84.1-52-84.1-103v-1.3c14 7.8 30.2 12.7 47.4 13.3-28.3-18.8-46.8-51-46.8-87.4 0-19.5 5.2-37.4 14.3-53 51.7 63.7 129.3 105.3 216.4 109.8-1.6-7.8-2.6-15.9-2.6-24 0-57.8 46.8-104.9 104.9-104.9 30.2 0 57.5 12.7 76.7 33.1 23.7-4.5 46.5-13.3 66.6-25.3-7.8 24.4-24.4 44.8-46.1 57.8 21.1-2.3 41.6-8.1 60.4-16.2-14.3 20.8-32.2 39.3-52.6 54.3z"/></svg>
			  </a>
			  <a href="https://github.com/gomarcd" target="_blank" aria-label="GitHub">
				  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512"><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3 .3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5 .3-6.2 2.3zm44.2-1.7c-2.9 .7-4.9 2.6-4.6 4.9 .3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3 .7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3 .3 2.9 2.3 3.9 1.6 1 3.6 .7 4.3-.7 .7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3 .7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3 .7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"/></svg>
			  </a>
			  <a href="https://buymeacoffee.com/gomarcd" target="_blank" aria-label="Buy me a coffee">
				  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M127.1 146.5c1.3 7.7 8 13.5 16 13.5h16.5c9.8 0 17.6-8.5 16.3-18-3.8-28.2-16.4-54.2-36.6-74.7-14.4-14.7-23.6-33.3-26.4-53.5C111.8 5.9 105 0 96.8 0H80.4C70.6 0 63 8.5 64.1 18c3.9 31.9 18 61.3 40.6 84.4 12 12.2 19.7 27.5 22.4 44.1zm112 0c1.3 7.7 8 13.5 16 13.5h16.5c9.8 0 17.6-8.5 16.3-18-3.8-28.2-16.4-54.2-36.6-74.7-14.4-14.7-23.6-33.3-26.4-53.5C223.8 5.9 217 0 208.8 0h-16.4c-9.8 0-17.5 8.5-16.3 18 3.9 31.9 18 61.3 40.6 84.4 12 12.2 19.7 27.5 22.4 44.1zM400 192H32c-17.7 0-32 14.3-32 32v192c0 53 43 96 96 96h192c53 0 96-43 96-96h16c61.8 0 112-50.2 112-112s-50.2-112-112-112zm0 160h-16v-96h16c26.5 0 48 21.5 48 48s-21.5 48-48 48z"/></svg>
			  </a>
		  </div>
		  
		  <script>
			function copyToClipboard() {
			  const ipText = document.getElementById('ip').innerText;
			  navigator.clipboard.writeText(ipText).then(function() {
				const notification = document.getElementById('notification');
				notification.style.display = 'block';
				setTimeout(() => {
				  notification.style.display = 'none';
				}, 3000);
			  }, function(err) {
				alert('Failed to copy: ', err);
			  });
			}
		  </script>
		</body>
	  </html>
	`;

	  // Default response for all other requests
	  return new Response(html, {
		headers: { "Content-Type": "text/html" }
	  });
	}
  };
  
