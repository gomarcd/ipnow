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

		if (url.protocol === "http:" && !userAgent.includes("curl") && !url.hostname.includes("localhost")) {
			const httpsUrl = url.href.replace("http:", "https:");
			return Response.redirect(httpsUrl, 301);
		}

		if (url.pathname === "/robots.txt") {
			const robotsTxt = `
				User-agent: *
				Allow: /
			`;
			return new Response(robotsTxt, {
				headers: { "Content-Type": "text/plain" },
			});
		}

		if (url.pathname.length > 1 && (
		    /^\/\d+\.\d+\.\d+\.\d+$/.test(url.pathname) || // IPv4
		    /^\/[a-zA-Z0-9][a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(url.pathname) || // Domain
		    /^\/[0-9a-fA-F:]+$/.test(url.pathname) // IPv6
		)) {
		  const target = url.pathname.substring(1);
		  
		  try {
		    const whoisResponse = await fetch(`http://ip-api.com/json/${target}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query,reverse,mobile,proxy,hosting`);
		    const whoisData = await whoisResponse.json();
		    
		    const formattedData = {
		      query: whoisData.query || target,
		      status: whoisData.status,
		      country: whoisData.country,
		      countryCode: whoisData.countryCode,
		      region: whoisData.region,
		      regionName: whoisData.regionName,
		      city: whoisData.city,
		      zip: whoisData.zip,
		      lat: whoisData.lat,
		      lon: whoisData.lon,
		      timezone: whoisData.timezone,
		      isp: whoisData.isp,
		      org: whoisData.org,
		      as: whoisData.as
		    };

			if (whoisData.reverse) {
			  formattedData.hostname = whoisData.reverse;
			}		    
					try {
					  const rdapBootstrapUrl = /^\d+\.\d+\.\d+\.\d+$/.test(target) ? 
					    `https://rdap.org/ip/${target}` : 
					    `https://rdap.org/domain/${target}`;
					  
					  const bootstrapResponse = await fetch(rdapBootstrapUrl, {redirect: 'manual'});
					  
					  if (bootstrapResponse.status === 302) {
					    const actualRdapUrl = bootstrapResponse.headers.get('Location');
					    if (actualRdapUrl) {
					      const rdapResponse = await fetch(actualRdapUrl);
					      if (rdapResponse.ok) {
					        const rdapData = await rdapResponse.json();
					        
					        if (rdapData.objectClassName === "domain") {
					          if (rdapData.nameservers && rdapData.nameservers.length > 0) {
					            formattedData.nameservers = rdapData.nameservers.map(ns => ns.ldhName);
					          }
					          if (rdapData.events) {
					            rdapData.events.forEach(event => {
					              if (event.eventAction === "registration") {
					                formattedData.registered = event.eventDate;
					              }
					              if (event.eventAction === "expiration") {
					                formattedData.expires = event.eventDate;
					              }
					              if (event.eventAction === "last changed") {
					                formattedData.updated = event.eventDate;
					              }
					            });
					          }
					          if (rdapData.entities && rdapData.entities.length > 0) {
					            const registrarEntity = rdapData.entities.find(e => e.roles && e.roles.includes("registrar"));
					            if (registrarEntity) {
					              if (registrarEntity.vcardArray && registrarEntity.vcardArray[1]) {
					                const vcardData = registrarEntity.vcardArray[1];
					                const nameField = vcardData.find(f => f[0] === "fn");
					                if (nameField && nameField[3]) {
					                  formattedData.registrar = nameField[3];
					                }
					              }
					              
					              if (registrarEntity.entities && registrarEntity.entities.length > 0) {
					                const abuseEntity = registrarEntity.entities.find(e => e.roles && e.roles.includes("abuse"));
					                if (abuseEntity && abuseEntity.vcardArray && abuseEntity.vcardArray[1]) {
					                  const vcardData = abuseEntity.vcardArray[1];
					                  
					                  formattedData.abuseContact = {};
					                  
					                  const nameField = vcardData.find(f => f[0] === "fn");
					                  if (nameField && nameField[3]) {
					                    formattedData.abuseContact.name = nameField[3];
					                  }
					                  
					                  const emailField = vcardData.find(f => f[0] === "email");
					                  if (emailField && emailField[3]) {
					                    formattedData.abuseContact.email = emailField[3];
					                  }
					                  
					                  const telField = vcardData.find(f => f[0] === "tel");
					                  if (telField && telField[3]) {
					                    formattedData.abuseContact.phone = telField[3].replace('tel:', '');
					                  }
					                }
					              }
					            }
					            
					            const registrantEntity = rdapData.entities.find(e => e.roles && e.roles.includes("registrant"));
					            if (registrantEntity && registrantEntity.vcardArray && registrantEntity.vcardArray[1]) {
					              const vcardData = registrantEntity.vcardArray[1];
					              
					              formattedData.registrant = {};
					              
					              const nameField = vcardData.find(f => f[0] === "fn");
					              if (nameField && nameField[3]) {
					                formattedData.registrant.name = nameField[3];
					              }
					              
					              const emailField = vcardData.find(f => f[0] === "email");
					              if (emailField && emailField[3]) {
					                formattedData.registrant.email = emailField[3];
					              }
					              
					              const telField = vcardData.find(f => f[0] === "tel" && f[1].type === "voice");
					              if (telField && telField[3]) {
					                formattedData.registrant.phone = telField[3];
					              }
					              
					              const adrField = vcardData.find(f => f[0] === "adr");
					              if (adrField && adrField[1].label) {
					                formattedData.registrant.address = adrField[1].label;
					              }
					            }
					          }
					        }
					        
					        if (rdapData.objectClassName === "ip network") {
					          if (rdapData.startAddress && rdapData.endAddress) {
					            formattedData.ipRange = `${rdapData.startAddress} - ${rdapData.endAddress}`;
					          }
					          
					          if (rdapData.remarks) {
					            const descriptions = rdapData.remarks.flatMap(r => r.description || []);
					            if (descriptions.length > 0) {
					              formattedData.remarks = descriptions;
					            }
					          }
					          
					          if (rdapData.events) {
					            rdapData.events.forEach(event => {
					              if (event.eventAction === "registration") {
					                formattedData.registered = event.eventDate;
					              }
					              if (event.eventAction === "last changed") {
					                formattedData.updated = event.eventDate;
					              }
					            });
					          }
					          
					          if (rdapData.entities && rdapData.entities.length > 0) {
					            const registrant = rdapData.entities.find(e => e.roles && e.roles.includes("registrant"));
					            if (registrant && registrant.vcardArray && registrant.vcardArray[1]) {
					              const vcardData = registrant.vcardArray[1];
					              
					              const nameField = vcardData.find(f => f[0] === "fn");
					              if (nameField && nameField[3]) {
					                formattedData.registrant = {
					                  name: nameField[3]
					                };
					                
					                const emailField = vcardData.find(f => f[0] === "email");
					                if (emailField && emailField[3]) {
					                  formattedData.registrant.email = emailField[3];
					                }
					                
					                const telField = vcardData.find(f => f[0] === "tel" && f[1].type === "voice");
					                if (telField && telField[3]) {
					                  formattedData.registrant.phone = telField[3];
					                }
					                
					                const adrField = vcardData.find(f => f[0] === "adr");
					                if (adrField && adrField[1].label) {
					                  formattedData.registrant.address = adrField[1].label;
					                }
					              }
					            }
					            
					            const abuseContact = rdapData.entities.find(e => e.roles && e.roles.includes("abuse"));
					            if (abuseContact && abuseContact.vcardArray && abuseContact.vcardArray[1]) {
					              const vcardData = abuseContact.vcardArray[1];
					              
					              const nameField = vcardData.find(f => f[0] === "fn");
					              if (nameField && nameField[3]) {
					                formattedData.abuseContact = {
					                  name: nameField[3]
					                };
					                
					                const emailField = vcardData.find(f => f[0] === "email");
					                if (emailField && emailField[3]) {
					                  formattedData.abuseContact.email = emailField[3];
					                }
					                
					                const telField = vcardData.find(f => f[0] === "tel" && f[1].type === "voice");
					                if (telField && telField[3]) {
					                  formattedData.abuseContact.phone = telField[3];
					                }
					                
					                const adrField = vcardData.find(f => f[0] === "adr");
					                if (adrField && adrField[1].label) {
					                  formattedData.abuseContact.address = adrField[1].label;
					                }
					              }
					            }
					          }
					        }
					      }
					    }
					  }
					} catch (rdapError) {
					  console.error("RDAP lookup failed:", rdapError);
					}



		    return new Response(JSON.stringify(formattedData, null, 2) + "\n", {
		      headers: { "Content-Type": "text/plain" }
		    });
		  } catch (error) {
		    console.error("Lookup error:", error);
		    return new Response("Error fetching data\n", {
		      status: 500, 
		      headers: { "Content-Type": "text/plain" }
		    });
		  }
		}

		if (url.pathname.startsWith("/whois")) {
			let targetIp = "";
			
			const ipPathMatch = url.pathname.match(/^\/whois\/([0-9.]+)$/);
			if (ipPathMatch && ipPathMatch[1]) {
				targetIp = ipPathMatch[1];
				console.log("Found IP in path:", targetIp);
			} else {
				targetIp = url.searchParams.get("ip") || ip;
				console.log("Using IP from param or visitor:", targetIp);
			}
			
			try {
				console.log("Fetching data for:", targetIp);
				const whoisResponse = await fetch(`http://ip-api.com/json/${targetIp}`);
				const whoisData = await whoisResponse.json();
				
				return new Response(JSON.stringify(whoisData, null, 2) + "\n", {
					headers: { "Content-Type": "text/plain" },
				});
			} catch (error) {
				console.error("WHOIS lookup error:", error);
				return new Response("Error fetching WHOIS data\n", {
					status: 500,
					headers: { "Content-Type": "text/plain" },
				});
			}
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

		const html = `
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
						<div class="ipcard" id="ip-card">
						    <div class="search-container">
						        <div class="search-input-container" id="search-input-container">
						            <input type="text" class="search-input" id="search-input" placeholder="IP or domain...">
						        </div>
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="search-icon" id="search-icon">
								  <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
								</svg>
						    </div>

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

							${(isp || asn) ? `
							<h3>Provider</h3>
							<p>${isp || ''} ${asn ? `ASN${asn}` : ''}</p>
							` : ''}

							${(city || region || country) ? `
							<h3>Location</h3>
							<p>${[city, region, country].filter(Boolean).join(', ')}</p>
							` : ''}

							<div id="device-section" class="hidden">
								<h3>Device</h3>
								<span id="browser-info"></span>, <span id="os-info"></span><BR>
							</div>

							<div class="footer">
								<div class="info" id="infobutton">
									<span><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
									</span>
								</div>

								<div class="social-links">
									<a href="https://github.com/gomarcd/ipnow" target="_blank" aria-label="GitHub">
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512"><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3 .3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5 .3-6.2 2.3zm44.2-1.7c-2.9 .7-4.9 2.6-4.6 4.9 .3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3 .7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3 .3 2.9 2.3 3.9 1.6 1 3.6 .7 4.3-.7 .7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3 .7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3 .7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"/></svg>
									</a>
									<a href="https://plausible.io/ip.now" target="_blank" aria-label="Plausible Analytics">
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
											<path d="M45.2456 22.6028c-1.0911 10.4558-10.2327 18.2273-20.7453 18.2273h-4.0478v9.57c0 5.302-4.2981 9.6-9.6 9.6H3.36c-1.8557 0-3.36-1.5043-3.36-3.36V36.9346l5.0381-7.0686c.9118-1.2793 2.588-1.7567 4.037-1.1498l2.8657 1.2003c1.4445.605 3.1154.1294 4.0248-1.1455l6.7172-9.4172c.9071-1.2717 2.5744-1.7451 4.0144-1.1397l5.5199 2.3204c1.443.6066 3.1138.132 4.0223-1.1427l6.4594-9.0626c2.0248 3.5598 3.0145 7.7888 2.5468 12.2707Z"/>
											<path d="M3.2921 28.8726c.8233-1.1551 2.0209-2.0435 3.4139-2.3114 1.0862-.2089 2.1569-.0993 3.1472.3155l2.865 1.2c.1651.0691.3389.1042.5165.1042.4366 0 .8488-.2125 1.1027-.5684l6.5942-9.2448c.8232-1.154 2.0204-2.041 3.4125-2.3083 1.0821-.2078 2.1464-.0989 3.1283.3138l5.5198 2.3204c.1666.0701.3418.1055.5207.1055.4352 0 .8456-.2114 1.098-.5654l6.9193-9.7078C37.8272 3.3644 31.7802 0 24.945 0H3.36C1.5043 0 0 1.5043 0 3.36v30.1317l3.2921-4.619Z"/>
										</svg>
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
										<div class="dimmed" id="modalTitle">JSON</div>
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
						infoButton.addEventListener('click', () => {
							document.getElementById('modalTitle').textContent = 'JSON';
							document.getElementById('curltext').textContent = ${JSON.stringify(JSON.stringify(details, null, 2))};
							toggleModal();
						});

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
								browser = "Safari";
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

					window.onclick = function(event) {
						const modalBackground = document.getElementById('infomodalBackground');
						if (event.target === modalBackground) {
							toggleModal();
						}
					}
					window.ontouchstart = function(event) {
						const modalBackground = document.getElementById('infomodalBackground');
						if (event.target === modalBackground) {
							toggleModal();
						}
					}
					window.addEventListener("keydown", function(event) {
						const modalBackground = document.getElementById("infomodalBackground");
						if (event.key === "Escape" && modalBackground.style.display === "flex") {
							toggleModal();
						}
					});
					const searchIcon = document.getElementById('search-icon');
					const searchInputContainer = document.getElementById('search-input-container');
					const searchInput = document.getElementById('search-input');
					const modalTitle = document.getElementById('modalTitle');
					const curltext = document.getElementById('curltext');

					searchIcon.addEventListener('click', () => {
						searchInputContainer.classList.toggle('expanded');
						if (searchInputContainer.classList.contains('expanded')) {
							searchInput.focus();
						}
					});

					searchInput.addEventListener('keypress', async (event) => {
						if (event.key === 'Enter') {
							const query = searchInput.value.trim();
							if (query) {
								searchForIpOrDomain(query);
							}
						}
					});

					async function searchForIpOrDomain(query) {
						try {
							modalTitle.textContent = 'WHOIS: ' + query;
							curltext.textContent = 'Loading...';
							toggleModal();
							
							const response = await fetch('/' + encodeURIComponent(query));
							
							if (!response.ok) {
								throw new Error('Failed to fetch data');
							}
							
							const data = await response.text();
							
							try {
								// Try to parse as JSON for formatted display
								const jsonData = JSON.parse(data);
								curltext.textContent = JSON.stringify(jsonData, null, 2);
							} catch (e) {
								// If not valid JSON, display as plain text
								curltext.textContent = data;
							}
							
						} catch (error) {
							curltext.textContent = 'Error: ' + error.message;
						}
					}
					document.addEventListener('click', (event) => {
					  if (!searchIcon.contains(event.target) && 
					      !searchInputContainer.contains(event.target) && 
					      searchInputContainer.classList.contains('expanded')) {
					    searchInputContainer.classList.remove('expanded');
					  }
					});
					searchInput.addEventListener('keydown', (event) => {
					  if (event.key === 'Escape' && searchInputContainer.classList.contains('expanded')) {
					    searchInputContainer.classList.remove('expanded');
					  }
					});
					document.addEventListener('keydown', (event) => {
					  // Check if Command (Mac) or Ctrl (Windows/Linux) + K is pressed
					  if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
					    event.preventDefault(); // Prevent browser's default behavior
					    searchInputContainer.classList.add('expanded');
					    searchInput.focus();
					  }
					});
				</script>
				</body>
			</html>	  
		`;

		const notFoundResponse = `
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

         if (url.pathname !== "/" && url.pathname !== "/details") {
           return new Response(notFoundResponse, {
             status: 404,
             headers: { "Content-Type": "text/html" },
           });
         }

         return new Response(html, {
           headers: { 
             "Content-Type": "text/html",
             "Content-Security-Policy": `default-src 'self'; script-src 'self' 'nonce-${nonce}' https://plausible.io; style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self'; connect-src 'self' https://plausible.io http://ip-api.com;`
           }
         });
   }
};