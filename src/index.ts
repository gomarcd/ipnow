interface Env {
	ASSETS: {
		fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
	};
}
  
export default {
	async fetch(request: Request, env: Env): Promise<Response> {		
		const { headers } = request;
		console.log("Request received:");
		console.log("User-Agent:", headers.get("user-agent"));
		console.log("Accept Header:", headers.get("accept"));
		const url = new URL(request.url);
		const ip = headers.get("cf-connecting-ip") || "Unknown";
		const userAgent = headers.get("user-agent") || "";
		const acceptHeader = headers.get("accept") || "";
		const cf = request.cf || {};
		const isp = cf.asOrganization || "Unknown";
		const asn = cf.asn || "Not available";
		const city = cf.city;
		const region = cf.region;
		const country = cf.country;
		const postalcode = cf.postalCode;
		const latitude = cf.latitude;
		const longitude = cf.longitude;
		const datacenter = cf.colo;
		const timezone = cf.timezone;
		const tlscipher = cf.tlsCipher;
		const locationParts = [city, region, country, postalcode].filter(Boolean);
		const location = locationParts.length > 0 ? locationParts.join(', ') : null;

		const details = { ip, isp, asn, location, latitude, longitude, datacenter, userAgent, timezone, tlscipher };

		// Redirect HTTP to HTTPS
		if (url.protocol === "http:" && !userAgent.includes("curl") && !url.hostname.includes("localhost")) {
			const httpsUrl = url.href.replace("http:", "https:");
			return Response.redirect(httpsUrl, 301);
		}

		// Handle specific routes with custom responses
		if (url.pathname === "/robots.txt") {
			const robotsTxt = `
				User-agent: *
				Allow: /
			`;
			return new Response(robotsTxt, {
				headers: { "Content-Type": "text/plain" },
			});
		}

		if (url.pathname === "/details") {
			const ip = headers.get("cf-connecting-ip") || "Unknown";
			const cf = request.cf || {};
			const isp = cf.asOrganization || "Unknown";
			const asn = cf.asn || "Not available";
			const city = cf.city || "";
			const region = cf.region || "";
			const country = cf.country || "";
			const postalcode = cf.postalCode || "";
			const latitude = cf.latitude || "";
			const longitude = cf.longitude || "";
			const datacenter = cf.colo || "";
			const timezone = cf.timezone || "";
			const tlscipher = cf.tlsCipher || "";
			const locationParts = [city, region, country, postalcode].filter(Boolean);
			const location = locationParts.length > 0 ? locationParts.join(", ") : null;

			const details = { ip, isp, asn, location, latitude, longitude, datacenter, userAgent, timezone, tlscipher };

			return new Response(`${JSON.stringify(details, null, 2)}\n`, {
				headers: { "Content-Type": "application/json" },
			});
		}
				
		// Handle valid curl requests
		if (
			(url.pathname === "/" || url.pathname === "/details") &&
			(userAgent.toLowerCase().includes("curl") ||
				userAgent.toLowerCase().includes("wget") ||
				acceptHeader.includes("text/plain"))
		) {
			console.log("Request processed by curl or wget");
			const ip = headers.get("cf-connecting-ip") || "Unknown";
			return new Response(`${ip}\n`, {
				headers: { "Content-Type": "text/plain" },
			});
		}

		// Handle unmatched routes for curl-like requests
		if (
			userAgent.toLowerCase().includes("curl") ||
			userAgent.toLowerCase().includes("wget") ||
			acceptHeader.includes("text/plain")
		) {
			return new Response("404 Not Found\n", {
				status: 404,
				headers: { "Content-Type": "text/plain" },
			});
		}

		// For Bing verification file
		if (url.pathname === "/b65bf7dc1b0348b587fa70578b445f59.txt") {
			return new Response("b65bf7dc1b0348b587fa70578b445f59", {
				headers: { "Content-Type": "text/plain", "Cache-Control": "max-age=3600" },
			});
		}

		try {
			const assetResponse = await env.ASSETS.fetch(request);
			if (assetResponse.status === 200) {
				return assetResponse;
			} 
		} catch (err) {
			console.log(err);
		}

		const array = new Uint8Array(16);
		crypto.getRandomValues(array);
		const nonce = btoa(String.fromCharCode(...array));

		const html = /* html */`
			<!DOCTYPE html>
			<html lang="en">
				<head>
					<script async defer data-domain="ip.now" src="https://plausible.io/js/script.js"></script>
					<link rel="canonical" href="https://ip.now">
					<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
					<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
					<link rel="shortcut icon" href="/favicon.ico">
					<link rel="apple-touch-icon" href="/apple-touch-icon.png">
					<link rel="manifest" href="/site.webmanifest">
					<link rel="icon" sizes="192x192" href="/android-chrome-192x192.png">
					<link rel="icon" sizes="512x512" href="/android-chrome-512x512.png">
					<link rel="stylesheet" href="/main.css">
					<meta charset="UTF-8">
					<meta name="viewport" content="width=device-width, initial-scale=1.0">
					<meta name="description" content="Find your public IP address instantly with ip.now. View and copy your IP quickly and easily, no registration or extra steps required!" />
					<meta name="keywords" content="What is my IP, IP address lookup, find my IP address, check my IP, IP location" />
					<title>ip.now | Quick & Easy IP Lookup – Find Your IP Address Instantly</title>
				</head>

				<body>
					<div class="container">
						<div class="ipcard">
							<div class="ip" id="ip">
								<h3>IP address</h3>
								<span id="ipvalue">${ip}</span> 
								<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="hidden">
									<defs>
										<symbol id="copyToClipboard" viewBox="0 -960 960 960">
											<path d="M760-200H320q-33 0-56.5-23.5T240-280v-560q0-33 23.5-56.5T320-920h280l240 240v400q0 33-23.5 56.5T760-200ZM560-640v-200H320v560h440v-360H560ZM160-40q-33 0-56.5-23.5T80-120v-560h80v560h440v80H160Zm160-800v200-200 560-560Z" />
										</symbol>
										<symbol id="copyToClipboardCheckmark" fill="#28a745" viewBox="0 -960 960 960">
											<path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/>
										</symbol>
									</defs>
								</svg>
								<svg height="24px" width="24px" fill="#5f6368">
									<use href="#copyToClipboard"></use>
								</svg>
							</div>

							<!-- Display Provider info, if any -->
							${(isp || asn) ? `
							<h3>Provider</h3>
							<p>${isp || ''} ${asn ? `ASN${asn}` : ''}</p>
							` : ''}

							<!-- Display Location info, if any -->
							${(city || region || country) ? `
							<h3>Location</h3>
							<p>${[city, region, country].filter(Boolean).join(', ')}</p>
							` : ''}

							<!-- Display Device info, if any -->
							<div id="device-section" class="hidden">
								<h3>Device</h3>
								<span id="browser-info"></span>, <span id="os-info"></span><BR>
							</div>

							<div class="footer">
								<div class="info" id="infobutton">
									<span ><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
								</div>

								<div class="social-links">
									<a href="https://gomarcd.featurebase.app" target="_blank" aria-label="Feedback">
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M480 32c0-12.9-7.8-24.6-19.8-29.6s-25.7-2.2-34.9 6.9L381.7 53c-48 48-113.1 75-181 75l-8.7 0-32 0-96 0c-35.3 0-64 28.7-64 64l0 96c0 35.3 28.7 64 64 64l0 128c0 17.7 14.3 32 32 32l64 0c17.7 0 32-14.3 32-32l0-128 8.7 0c67.9 0 133 27 181 75l43.6 43.6c9.2 9.2 22.9 11.9 34.9 6.9s19.8-16.6 19.8-29.6l0-147.6c18.6-8.8 32-32.5 32-60.4s-13.4-51.6-32-60.4L480 32zm-64 76.7L416 240l0 131.3C357.2 317.8 280.5 288 200.7 288l-8.7 0 0-96 8.7 0c79.8 0 156.5-29.8 215.3-83.3z"/></svg>
									</a>
									<a href="https://twitter.com/gomarcd" target="_blank" aria-label="Twitter">
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M459.4 151.7c.3 4.5 .3 9.1 .3 13.6 0 138.7-105.6 298.6-298.6 298.6-59.5 0-114.7-17.2-161.1-47.1 8.4 1 16.6 1.3 25.3 1.3 49.1 0 94.2-16.6 130.3-44.8-46.1-1-84.8-31.2-98.1-72.8 6.5 1 13 1.6 19.8 1.6 9.4 0 18.8-1.3 27.6-3.6-48.1-9.7-84.1-52-84.1-103v-1.3c14 7.8 30.2 12.7 47.4 13.3-28.3-18.8-46.8-51-46.8-87.4 0-19.5 5.2-37.4 14.3-53 51.7 63.7 129.3 105.3 216.4 109.8-1.6-7.8-2.6-15.9-2.6-24 0-57.8 46.8-104.9 104.9-104.9 30.2 0 57.5 12.7 76.7 33.1 23.7-4.5 46.5-13.3 66.6-25.3-7.8 24.4-24.4 44.8-46.1 57.8 21.1-2.3 41.6-8.1 60.4-16.2-14.3 20.8-32.2 39.3-52.6 54.3z"/></svg>
									</a>
									<a href="https://github.com/gomarcd/ipnow" target="_blank" aria-label="GitHub">
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512"><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3 .3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5 .3-6.2 2.3zm44.2-1.7c-2.9 .7-4.9 2.6-4.6 4.9 .3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3 .7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3 .3 2.9 2.3 3.9 1.6 1 3.6 .7 4.3-.7 .7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3 .7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3 .7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"/></svg>
									</a>
									<a href="https://reddit.com/r/ipnow" target="_blank" aria-label="Reddit">
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M0 256C0 114.6 114.6 0 256 0S512 114.6 512 256s-114.6 256-256 256L37.1 512c-13.7 0-20.5-16.5-10.9-26.2L75 437C28.7 390.7 0 326.7 0 256zM349.6 153.6c23.6 0 42.7-19.1 42.7-42.7s-19.1-42.7-42.7-42.7c-20.6 0-37.8 14.6-41.8 34c-34.5 3.7-61.4 33-61.4 68.4l0 .2c-37.5 1.6-71.8 12.3-99 29.1c-10.1-7.8-22.8-12.5-36.5-12.5c-33 0-59.8 26.8-59.8 59.8c0 24 14.1 44.6 34.4 54.1c2 69.4 77.6 125.2 170.6 125.2s168.7-55.9 170.6-125.3c20.2-9.6 34.1-30.2 34.1-54c0-33-26.8-59.8-59.8-59.8c-13.7 0-26.3 4.6-36.4 12.4c-27.4-17-62.1-27.7-100-29.1l0-.2c0-25.4 18.9-46.5 43.4-49.9l0 0c4.4 18.8 21.3 32.8 41.5 32.8zM177.1 246.9c16.7 0 29.5 17.6 28.5 39.3s-13.5 29.6-30.3 29.6s-31.4-8.8-30.4-30.5s15.4-38.3 32.1-38.3zm190.1 38.3c1 21.7-13.7 30.5-30.4 30.5s-29.3-7.9-30.3-29.6c-1-21.7 11.8-39.3 28.5-39.3s31.2 16.6 32.1 38.3zm-48.1 56.7c-10.3 24.6-34.6 41.9-63 41.9s-52.7-17.3-63-41.9c-1.2-2.9 .8-6.2 3.9-6.5c18.4-1.9 38.3-2.9 59.1-2.9s40.7 1 59.1 2.9c3.1 .3 5.1 3.6 3.9 6.5z"/></svg>
									</a>
									<a href="https://buymeacoffee.com/gomarcd" target="_blank" aria-label="Buy me a coffee">
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M127.1 146.5c1.3 7.7 8 13.5 16 13.5h16.5c9.8 0 17.6-8.5 16.3-18-3.8-28.2-16.4-54.2-36.6-74.7-14.4-14.7-23.6-33.3-26.4-53.5C111.8 5.9 105 0 96.8 0H80.4C70.6 0 63 8.5 64.1 18c3.9 31.9 18 61.3 40.6 84.4 12 12.2 19.7 27.5 22.4 44.1zm112 0c1.3 7.7 8 13.5 16 13.5h16.5c9.8 0 17.6-8.5 16.3-18-3.8-28.2-16.4-54.2-36.6-74.7-14.4-14.7-23.6-33.3-26.4-53.5C223.8 5.9 217 0 208.8 0h-16.4c-9.8 0-17.5 8.5-16.3 18 3.9 31.9 18 61.3 40.6 84.4 12 12.2 19.7 27.5 22.4 44.1zM400 192H32c-17.7 0-32 14.3-32 32v192c0 53 43 96 96 96h192c53 0 96-43 96-96h16c61.8 0 112-50.2 112-112s-50.2-112-112-112zm0 160h-16v-96h16c26.5 0 48 21.5 48 48s-21.5 48-48 48z"/></svg>
									</a>
								</div>
							</div>
						</div>
						<div class="notification" id="notification">
						Copied to clipboard!
						</div>

						<div class="infomodalBackground" id="infomodalBackground">
								<div class="detailsCodeBlock" id="copyDetailsButton">
									<div class="copyDetailsHeader">
										<div class="dimmed">JSON</div>
										<div class="copyDetailsButton" id="copyDetailsButton">
											<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="hidden">
												<defs>
													<symbol id="copyToClipboard" viewBox="0 -960 960 960">
														<path d="M760-200H320q-33 0-56.5-23.5T240-280v-560q0-33 23.5-56.5T320-920h280l240 240v400q0 33-23.5 56.5T760-200ZM560-640v-200H320v560h440v-360H560ZM160-40q-33 0-56.5-23.5T80-120v-560h80v560h440v80H160Zm160-800v200-200 560-560Z" />
													</symbol>
													<symbol id="copyToClipboardCheckmark" fill="#28a745" viewBox="0 -960 960 960">
														<path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q65 0 123 19t107 53l-58 59q-38-24-81-37.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160q133 0 226.5-93.5T800-480q0-18-2-36t-6-35l65-65q11 32 17 66t6 70q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm-56-216L254-466l56-56 114 114 400-401 56 56-456 457Z"/>
													</symbol>
												</defs>
											</svg>
											<svg height="24px" width="24px" fill="#5f6368">
												<use href="#copyToClipboard"></use>
											</svg>
										</div>
									</div>
									<span id="curltext">${JSON.stringify(details, null, 2)}</span>
								</div>
						</div>
					</div>

				<script nonce="${nonce}">
					document.addEventListener('DOMContentLoaded', () => {
						const infoButton = document.getElementById('infobutton');
						infoButton.addEventListener('click', toggleModal);

						const copyIpButton = document.getElementById('ip');
						copyIpButton.addEventListener('click', () => {
							copyToClipboard('ipvalue', '#ip svg use');
						});

						const copyDetailsButton = document.getElementById('copyDetailsButton');
						copyDetailsButton.addEventListener('click', () => {
							copyToClipboard('curltext', '#copyDetailsButton svg use');
						});

						const osInfoElement = document.getElementById('os-info');
						const browserInfoElement = document.getElementById('browser-info');
						const deviceSection = document.getElementById('device-section');

						let platform = "Unknown platform";
						let browser = "Unknown browser";

						// Platform detection
						if (navigator.userAgentData?.platform) {
							platform = navigator.userAgentData.platform;
						} else {
							const userAgent = navigator.userAgent;
							if (/iPad|iPhone|iPod/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
								platform = "iOS";
							} else if (userAgent.includes("Mac")) {
								platform = "macOS";
							} else if (userAgent.includes("Win")) {
								platform = "Windows";
							} else if (userAgent.includes("Linux")) {
								platform = "Linux";
							}
						}

						// Browser detection
						const userAgent = navigator.userAgent;

						if (navigator.brave) {
							browser = "Brave"; // Direct Brave detection
						} else if (/iPad|iPhone|iPod/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
							// **iOS Browser Detection**
							if (userAgent.includes("CriOS")) {
								browser = "Chrome";
							} else if (userAgent.includes("FxiOS")) {
								browser = "Firefox";
							} else if (userAgent.includes("Brave")) {
								browser = "Brave";
							} else {
								browser = "Safari"; // Default for all WebKit browsers on iOS
							}
						} else if (navigator.userAgentData?.brands) {
							const brands = navigator.userAgentData.brands.map(b => b.brand);
							
							if (brands.includes("Microsoft Edge")) {
								browser = "Edge";
							} else if (brands.includes("Google Chrome")) {
								browser = "Chrome";
							} else if (brands.includes("Brave")) {
								browser = "Brave";
							} else if (brands.includes("Chromium") && !brands.includes("Google Chrome") && userAgent.includes("Brave")) {
								browser = "Brave";
							} else if (brands.includes("Firefox")) {
								browser = "Firefox";
							} else if (brands.includes("Safari")) {
								browser = "Safari";
							}
						} else {
							if (userAgent.includes("Edg")) {
								browser = "Edge";
							} else if (userAgent.includes("Brave")) {
								browser = "Brave";
							} else if (userAgent.includes("Chrome")) {
								browser = "Chrome";
							} else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
								browser = "Safari";
							} else if (userAgent.includes("Firefox")) {
								browser = "Firefox";
							}
						}
						osInfoElement.textContent = platform;
						browserInfoElement.textContent = browser;

						if (platform !== "Unknown platform" && browser !== "Unknown browser") {
							deviceSection.classList.remove('hidden');
						}
					});

					function copyToClipboard(elementId, iconId) {
						const element = document.getElementById(elementId);
						const textToCopy = element.textContent || element.innerText;
						const copyToClipboardIcon = document.querySelector(iconId);
						navigator.clipboard.writeText(textToCopy).then(() => {
								copyToClipboardIcon.setAttribute('href', '#copyToClipboardCheckmark');
								setTimeout(() => {
									copyToClipboardIcon.setAttribute('href', '#copyToClipboard');
									copyToClipboardIcon.parentNode.setAttribute('fill', '#5f6368');
								}, 1500);						
						});
					}

					function toggleModal() {
						const modalBackground = document.getElementById("infomodalBackground");
						if (modalBackground.style.display === "flex") {
							modalBackground.style.display = "none";
						} else {
							modalBackground.style.display = "flex";
						}
					}

					// Close modal if user clicks outside of it (works on desktop)
					window.onclick = function(event) {
						const modal = document.getElementById('infomodal');
						const modalBackground = document.getElementById('infomodalBackground');
						if (event.target === modalBackground) {
							toggleModal();
						}
					}
					// Close modal if user taps outside of it (for mobile)
					window.ontouchstart = function(event) {
						const modal = document.getElementById('infomodal');
						const modalBackground = document.getElementById('infomodalBackground');
						if (event.target === modalBackground) {
							toggleModal();
						}
					}
					// Close modal if user presses ESC
					window.addEventListener("keydown", function(event) {
						const modalBackground = document.getElementById("infomodalBackground");
						if (event.key === "Escape" && modalBackground.style.display === "flex") {
							toggleModal();
						}
					});
				</script>
				</body>
			</html>	  
		`;

		// If the asset or route doesn't exist, serve a 404 page
		const notFoundResponse = /* html */`
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>404 Not Found</title>
			<style>
				body {
					display: flex;
					align-items: center;
					justify-content: center;
					height: 100vh;
					margin: 0;
					font-family: 'Ubuntu Mono', monospace;
					background-color: #f4f4f4;
				}

				.detailsCodeBlock {
					border: none;
					border-radius: 5px;
					padding-top: 20px;
					padding-bottom: 25px;
					padding-left: 25px;
					padding-right: 25px;
					white-space: pre-wrap;
					overflow-x: auto;
					font-family: 'Ubuntu Mono', monospace;
					font-size: 0.9em;
					width: 60vw;
					display: flex;
					flex-direction: column;
					align-self: center;
					backdrop-filter: blur(6px);
					background-color: rgba(255, 255, 255, 0.9);
					color: #2D2D2D;
					box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
				}

				@media (prefers-color-scheme: dark) {
					body {
						background-color: #0d0d0d;
					}
					.detailsCodeBlock {
						border: 1px solid #6c757d;
						backdrop-filter: blur(6px);
						background-color: rgba(0, 0, 0, 0.5);
						color: #e9ecef;
						box-shadow: 0 4px 8px rgba(255, 255, 255, 0.1);
					}
				}
			</style>

			</head>
			<body>
				<div class="detailsCodeBlock">
					<h1>404 Not Found</h1>
					<p>Sorry, the page you're looking for does not exist.</p>
				</div>
			</body>
			</html>	  
		`;

		if (request.url.startsWith('http://') && !userAgent.includes('curl') && !url.hostname.includes('localhost')) {
			const httpsUrl = request.url.replace('http://', 'https://');
			return Response.redirect(httpsUrl, 301);
		}

		if (url.pathname !== "/" && url.pathname !== "/details") {
			return new Response(notFoundResponse, {
				status: 404,
				headers: { "Content-Type": "text/html" },
			});
		}

		return new Response(html, {
			headers: { 
				"Content-Type": "text/html",
				"Content-Security-Policy": `default-src 'self'; script-src 'self' 'nonce-${nonce}' https://plausible.io; style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self'; connect-src 'self' https://plausible.io;`
			}
		});
	}
};