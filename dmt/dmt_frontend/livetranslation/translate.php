<?php
// translate.php - Live Translation API Endpoint using Gemini 2.0
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// 1. CONFIGURATION
// ⚠️ REPLACE WITH YOUR NEW API KEY. Do not use the one you posted publicly.
$apiKey = 'AIzaSyDTWzGvL1cmfUfa1XtNLOxgVZnakMmFDPg'; 

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $text = $data['text'] ?? '';
    $sourceLang = $data['sourceLang'] ?? 'en';
    $targetLang = $data['targetLang'] ?? 'zh';
    
    if (empty($text)) {
        echo json_encode(['error' => 'No text provided']);
        exit;
    }

    // Language Mapping
    $languages = [
        'en' => 'English',
        'es' => 'Spanish',
        'zh' => 'Chinese',
    ];
    
    $sLangName = $languages[$sourceLang] ?? 'English';
    $tLangName = $languages[$targetLang] ?? 'Chinese';

    // 2. PREPARE API REQUEST
    // Using Gemini 2.0 Flash as per your curl example
    $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
    
    $prompt = "Translate the following text from {$sLangName} to {$tLangName}. Return ONLY the translation, no explanations:\n\n" . $text;

    $body = [
        'contents' => [
            [
                'parts' => [
                    ['text' => $prompt]
                ]
            ]
        ],
        'generationConfig' => [
            'temperature' => 0.1 // Low temperature for accurate translation
        ]
    ];

    // 3. EXECUTE CURL
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
    
    // IMPORTANT: SSL Verification
    // If you are on local XAMPP/WAMP and get SSL errors, uncomment the line below (Not recommended for production)
    // curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

    // Headers matching your working curl command
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'X-goog-api-key: ' . $apiKey
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    // 4. HANDLE RESPONSE
    if ($httpCode === 200) {
        $result = json_decode($response, true);
        
        if (isset($result['candidates'][0]['content']['parts'][0]['text'])) {
            $translation = $result['candidates'][0]['content']['parts'][0]['text'];
            echo json_encode(['translation' => trim($translation)]);
        } else {
            echo json_encode(['error' => 'API returned valid JSON but no text', 'debug' => $result]);
        }
    } else {
        // Return detailed error info for debugging
        echo json_encode([
            'error' => 'API Error', 
            'http_code' => $httpCode, 
            'curl_error' => $curlError,
            'response_body' => $response
        ]);
    }
}
?>