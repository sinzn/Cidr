 // Get DOM elements
 const octet1Input = document.getElementById('octet1');
 const octet2Input = document.getElementById('octet2');
 const octet3Input = document.getElementById('octet3');
 const octet4Input = document.getElementById('octet4');
 const cidrPrefixInput = document.getElementById('cidrPrefix');
 const binaryContainer = document.getElementById('binaryContainer');
 const netmaskElement = document.getElementById('netmask');
 const cidrBaseIpElement = document.getElementById('cidrBaseIp');
 const broadcastIpElement = document.getElementById('broadcastIp');
 const countElement = document.getElementById('count');
 const firstUsableIpElement = document.getElementById('firstUsableIp');
 const lastUsableIpElement = document.getElementById('lastUsableIp');
 const copyCidrButton = document.getElementById('copyCidr');
 const copyShareLinkButton = document.getElementById('copyShareLink');

 // Add event listeners
 octet1Input.addEventListener('input', handleInputChange);
 octet2Input.addEventListener('input', handleInputChange);
 octet3Input.addEventListener('input', handleInputChange);
 octet4Input.addEventListener('input', handleInputChange);
 cidrPrefixInput.addEventListener('input', handleInputChange);
 copyCidrButton.addEventListener('click', copyCidr);
 copyShareLinkButton.addEventListener('click', copyShareLink);

 // Initialize the calculator
 calculateCIDR();

 // Handle input changes
 function handleInputChange(event) {
   const input = event.target;
   const value = parseInt(input.value) || 0;
   const min = parseInt(input.min);
   const max = parseInt(input.max);
   
   // Clamp value between min and max
   input.value = Math.min(max, Math.max(min, value));
   
   calculateCIDR();
 }

 // Calculate CIDR information
 function calculateCIDR() {
   // Get IP octets and CIDR prefix
   const ipOctets = [
     parseInt(octet1Input.value) || 0,
     parseInt(octet2Input.value) || 0,
     parseInt(octet3Input.value) || 0,
     parseInt(octet4Input.value) || 0
   ];
   const cidrPrefix = parseInt(cidrPrefixInput.value) || 0;

   // Calculate netmask
   const fullMask = 0xffffffff >>> (32 - cidrPrefix) << (32 - cidrPrefix);
   const netmaskOctets = [
     (fullMask >>> 24) & 255,
     (fullMask >>> 16) & 255,
     (fullMask >>> 8) & 255,
     fullMask & 255
   ];
   const netmask = netmaskOctets.join('.');

   // Calculate network address (CIDR Base IP)
   const ipNumber = (ipOctets[0] << 24) | (ipOctets[1] << 16) | (ipOctets[2] << 8) | ipOctets[3];
   const networkNumber = ipNumber & fullMask;
   const networkOctets = [
     (networkNumber >>> 24) & 255,
     (networkNumber >>> 16) & 255,
     (networkNumber >>> 8) & 255,
     networkNumber & 255
   ];
   const cidrBaseIp = networkOctets.join('.');

   // Calculate broadcast address
   const broadcastNumber = networkNumber | (~fullMask & 0xffffffff);
   const broadcastOctets = [
     (broadcastNumber >>> 24) & 255,
     (broadcastNumber >>> 16) & 255,
     (broadcastNumber >>> 8) & 255,
     broadcastNumber & 255
   ];
   const broadcastIp = broadcastOctets.join('.');

   // Calculate count of usable IPs
   const count = Math.pow(2, 32 - cidrPrefix);

   // Calculate first and last usable IPs
   let firstUsableIp = cidrBaseIp;
   let lastUsableIp = broadcastIp;

   if (count > 2) {
     const firstUsableNumber = networkNumber + 1;
     const firstUsableOctets = [
       (firstUsableNumber >>> 24) & 255,
       (firstUsableNumber >>> 16) & 255,
       (firstUsableNumber >>> 8) & 255,
       firstUsableNumber & 255
     ];
     firstUsableIp = firstUsableOctets.join('.');

     const lastUsableNumber = broadcastNumber - 1;
     const lastUsableOctets = [
       (lastUsableNumber >>> 24) & 255,
       (lastUsableNumber >>> 16) & 255,
       (lastUsableNumber >>> 8) & 255,
       lastUsableNumber & 255
     ];
     lastUsableIp = lastUsableOctets.join('.');
   }

   // Calculate binary representation of IP octets
   const binaryOctets = ipOctets.map(octet => 
     octet.toString(2).padStart(8, '0')
   );

   // Update the UI
   updateBinaryDisplay(binaryOctets);
   netmaskElement.textContent = netmask;
   cidrBaseIpElement.textContent = cidrBaseIp;
   broadcastIpElement.textContent = broadcastIp;
   countElement.textContent = count;
   firstUsableIpElement.textContent = firstUsableIp;
   lastUsableIpElement.textContent = lastUsableIp;
 }

 // Update binary display
 function updateBinaryDisplay(binaryOctets) {
   binaryContainer.innerHTML = '';

   binaryOctets.forEach((binary, octetIndex) => {
     const binaryOctetElement = document.createElement('div');
     binaryOctetElement.className = 'binary-octet';

     binary.split('').forEach((bit, bitIndex) => {
       const bitElement = document.createElement('div');
       bitElement.className = `binary-bit ${bit === '1' ? `bit-1-${octetIndex + 1}` : 'bit-0'}`;
       bitElement.textContent = bit;
       binaryOctetElement.appendChild(bitElement);
     });

     binaryContainer.appendChild(binaryOctetElement);
   });
 }

 // Copy CIDR to clipboard
 function copyCidr() {
   const ipOctets = [
     octet1Input.value,
     octet2Input.value,
     octet3Input.value,
     octet4Input.value
   ].join('.');
   const cidrPrefix = cidrPrefixInput.value;
   const cidrNotation = `${ipOctets}/${cidrPrefix}`;
   
   navigator.clipboard.writeText(cidrNotation)
     .then(() => {
       alert('CIDR notation copied to clipboard!');
     })
     .catch(err => {
       console.error('Failed to copy: ', err);
     });
 }

 // Copy share link to clipboard
 function copyShareLink() {
   const ipOctets = [
     octet1Input.value,
     octet2Input.value,
     octet3Input.value,
     octet4Input.value
   ].join('.');
   const cidrPrefix = cidrPrefixInput.value;
   
   const url = new URL(window.location.href);
   url.search = `?ip=${ipOctets}&cidr=${cidrPrefix}`;
   
   navigator.clipboard.writeText(url.toString())
     .then(() => {
       alert('Share link copied to clipboard!');
     })
     .catch(err => {
       console.error('Failed to copy: ', err);
     });
 }

 // Parse URL parameters on page load
 function parseUrlParams() {
   const urlParams = new URLSearchParams(window.location.search);
   const ipParam = urlParams.get('ip');
   const cidrParam = urlParams.get('cidr');
   
   if (ipParam) {
     const ipParts = ipParam.split('.');
     if (ipParts.length === 4) {
       octet1Input.value = parseInt(ipParts[0]) || 0;
       octet2Input.value = parseInt(ipParts[1]) || 0;
       octet3Input.value = parseInt(ipParts[2]) || 0;
       octet4Input.value = parseInt(ipParts[3]) || 0;
     }
   }
   
   if (cidrParam) {
     cidrPrefixInput.value = parseInt(cidrParam) || 0;
   }
   
   calculateCIDR();
 }

 // Run on page load
 parseUrlParams();
