const fs = require('fs');
const axios = require('axios');

const JSON_FILE = 'data.json'; // Replace with your JSON file path
const OUTPUT_FILE = 'output.json';
const REQUEST_TIMEOUT = 5000; // Timeout in milliseconds

// Function to check if an image URL is valid
const checkImage = async (url) => {
  try {
    const response = await axios.head(url, { timeout: REQUEST_TIMEOUT });
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

// Function to process the JSON data sequentially
const processImages = async (data) => {
  for (const groupKey in data) {
    const group = data[groupKey];
    for (const itemKey in group) {
      const item = group[itemKey];
      if (item.contentType === 'img' && item.contentData && item.contentData.src && item.contentData.src.startsWith('http')) {
        const imageUrl = item.contentData.src;
        console.log(`Checking image: ${imageUrl}`);
        const isImageValid = await checkImage(imageUrl);
        item.imageLoadStatus = isImageValid ? 'loaded' : 'not_loaded';
        console.log(`Result: ${isImageValid ? 'loaded' : 'not_loaded'}`);
        await new Promise((resolve) => setTimeout(resolve, 1)); // Optional delay between requests
      }
    }
  }
  return data;
};

// Main function
const main = async () => {
  try {
    // Read JSON data
    const rawData = fs.readFileSync(JSON_FILE, 'utf8');
    const jsonData = JSON.parse(rawData);

    // Process images sequentially
    const updatedData = await processImages(jsonData);

    // Write updated data to output file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(updatedData, null, 2), 'utf8');
    console.log(`Processing complete. Output written to ${OUTPUT_FILE}`);
  } catch (error) {
    console.error('Error processing images:', error.message);
  }
};

const filter_json_not_loaded = async () => {
    try {
        // Read JSON data
        const rawData = fs.readFileSync(OUTPUT_FILE, 'utf8');
        const jsonData = JSON.parse(rawData);
    
        // Filter JSON data
        const filteredData = {};
        for (const groupKey in jsonData) {
        const group = jsonData[groupKey];
        const filteredGroup = {};
        for (const itemKey in group) {
            const item = group[itemKey];
            if (item.imageLoadStatus === 'loaded') {
            filteredGroup[itemKey] = item;
            }
        }
        if (Object.keys(filteredGroup).length > 0) {
            filteredData[groupKey] = filteredGroup;
        }
        }
    
        // Write filtered data to output file
        const filteredFile = 'filtered.json';
        fs.writeFileSync(filteredFile, JSON.stringify(filteredData, null, 2), 'utf8');
        console.log(`Filtering complete. Output written to ${filteredFile}`);
    } catch (error) {
        console.error('Error filtering data:', error.message);
    }
    }

// Run the script
filter_json_not_loaded();