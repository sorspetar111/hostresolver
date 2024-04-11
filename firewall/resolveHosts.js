
// Function to resolve IP addresses for hostnames from a given URL
let numberIndex = 1;
let index = 0;
const chunkSize = 5000;

async function resolveIPsFromURL(url) {
    try {
        const infoContainer = document.getElementById('infoContainer');
        
        const response = await fetch(url);        
        const text = await response.text();    
        const lines = text.trim().split('\n');
        const resolvedIPs = [];
        
        for (let i = 0; i < lines.length; i++) {
            const hostname  = lines[i].trim();
                            
            try {
                const ipAddress = await resolveHostname(hostname);
                if (isValidIPAddress(ipAddress)) {
                    resolvedIPs.push(ipAddress);
                
                    if (numberIndex === chunkSize || i === lines.length - 1) {                                                            
                        numberIndex = 0;
                        downloadNextChunk(resolvedIPs);
                    }
                    
                    console.info(`${numberIndex++} ${ipAddress} ${hostname}`);

                    const info = document.createElement('p');
                    info.textContent = `${numberIndex} ${ipAddress} ${hostname}`;
                    infoContainer.appendChild(info);

                
                }
            } catch (error) {
                // console.error(`Error resolving ${hostname}:`, error);
            }
        }

        return resolvedIPs;
    } catch (error) {
        console.error('Error:', error);
        return []; // Return empty array in case of an error
    }
}

// Function to check if a string is a valid IP address
function isValidIPAddress(ip) {
    // Regular expression for IPv4 and IPv6 addresses
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$|^[\da-f]{1,4}(?::[\da-f]{1,4}){7}$/i;
    return ipRegex.test(ip);
}

// Function to resolve IP address for a given hostname using a third-party DNS lookup service
async function resolveHostname(hostname) {
    // Fetch DNS information from a third-party DNS lookup service
    const response = await fetch(`https://dns.google/resolve?name=${hostname}&type=A`);

    // Parse response JSON
    const data = await response.json();

    // Check if there is no answer returned
    if (!data.Answer || data.Answer.length === 0) {
        return '';
    }

    // Extract IP address from the response
    return data.Answer[0].data;
}

// Function to download text as a file
function downloadTextFile(text, filename) {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

function downloadNextChunk(ips) {
    const chunk = ips.slice(index, index + chunkSize);
    const chunkText = chunk.join('\n');
    const filename = `resolved_ips_${index + 1}-${index + chunk.length}.txt`;
    downloadTextFile(chunkText, filename);
    
    // Proceed to the next chunk
    index += chunkSize;
}

/*

const url = 'https://pzprovi.github.io/drop.txt';
resolveIPsFromURL(url)
    .then(ips => {        
        downloadNextChunk(ips);
    })
    .catch(error => console.error('Error:', error));

    */


