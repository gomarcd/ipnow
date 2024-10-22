export default {
	async fetch(request, env, ctx): Promise<Response> {
	  const ip = request.headers.get("cf-connecting-ip") || "IP not available";
  
	  const html = `
		<!DOCTYPE html>
		<html lang="en">
		  <head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>My IP Fail</title>
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
					cursor:pointer;
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
				svg:hover {
					background-color: #f0f0f0;
					fill: #4e5256;
				}
				svg:active {
					transform: scale(0.95);
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
						fill: #f0f0f0; /* Lighter icon color for dark mode */
					}

					svg:hover {
						background-color: #333; /* Darker background on hover */
						fill: #ffffff; /* White icon on hover */
					}
				}					
			</style>
		  </head>
		  <body>
			<div onclick="copyToClipboard()" class="ip" id="ip">
				<h1>${ip} 
				<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M760-200H320q-33 0-56.5-23.5T240-280v-560q0-33 23.5-56.5T320-920h280l240 240v400q0 33-23.5 56.5T760-200ZM560-640v-200H320v560h440v-360H560ZM160-40q-33 0-56.5-23.5T80-120v-560h80v560h440v80H160Zm160-800v200-200 560-560Z"/></svg>
				</h1>
			</div>
			<div class="notification" id="notification">
			  IP address copied to clipboard!
			</div>
  
			<script>
			  function copyToClipboard() {
				const ipText = document.getElementById('ip').innerText;
				navigator.clipboard.writeText(ipText).then(function() {
				  const notification = document.getElementById('notification');
				  notification.style.display = 'block';
				  setTimeout(() => {
					notification.style.display = 'none';
				  }, 4000);
				}, function(err) {
				  alert('Failed to copy: ', err);
				});
			  }
			</script>
		  </body>
		</html>
	  `;
  
	  return new Response(html, {
		headers: { "content-type": "text/html" },
	  });
	},
  } satisfies ExportedHandler<Env>;
  