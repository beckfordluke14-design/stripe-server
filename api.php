<?php
// Set the content type to JSON so the browser understands the response
header('Content-Type: application/json');

// The name of the file where your product data will be stored
$dataFile = 'offer.json';

// --- This part handles SAVING the data from your admin panel ---
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // SECURITY CHECK: Make sure the request is from an admin.
    // We check for a password sent in a special header from the JavaScript.
    $headers = getallheaders();
    $adminPassword = isset($headers['X-Admin-Password']) ? $headers['X-Admin-Password'] : '';

    // IMPORTANT: This password MUST match the one in your promo.html file
    if ($adminPassword !== 'e55c3p') { 
        http_response_code(403); // Forbidden
        echo json_encode(['message' => 'Error: Authentication failed.']);
        exit();
    }

    // Get the new product data sent from the browser
    $newData = file_get_contents('php://input');
    
    // Save the new data to the offer.json file
    if (file_put_contents($dataFile, $newData)) {
        echo json_encode(['message' => 'Offer updated successfully!']);
    } else {
        http_response_code(500); // Internal Server Error
        echo json_encode(['message' => 'Error: Could not save offer data.']);
    }
    exit();
}

// --- This part handles LOADING the data for all visitors ---
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (file_exists($dataFile)) {
        // Read the data from offer.json and send it to the browser
        echo file_get_contents($dataFile);
    } else {
        http_response_code(404); // Not Found
        echo json_encode(['message' => 'Error: Offer data file not found.']);
    }
    exit();
}
?>
