<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Live Translator</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @keyframes spin {
            100% { transform: rotate(360deg); }
        }
        .loading-spinner {
            animation: spin 1s linear infinite;
        }
        /* Custom scrollbar for textareas */
        textarea::-webkit-scrollbar {
            width: 8px;
        }
        textarea::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
        }
        textarea::-webkit-scrollbar-thumb {
            background: #c7c7c7;
            border-radius: 4px;
        }
        textarea::-webkit-scrollbar-thumb:hover {
            background: #a0a0a0;
        }
    </style>
</head>
<body class="bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 min-h-screen p-4 md:p-8 font-sans">
    <div class="max-w-7xl mx-auto">
        <div class="text-center mb-8 md:mb-12 pt-6">
            <div class="flex items-center justify-center gap-3 mb-4">
                <svg class="w-10 h-10 md:w-14 md:h-14 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z"></path>
                </svg>
                <h1 class="text-4xl md:text-6xl font-extrabold text-white tracking-tight">Live Translator</h1>
            </div>
            <p class="text-lg md:text-xl text-blue-100 font-light">Real-time translation </p>
        </div>
        
        <div class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-10 border border-white/20">
            <div class="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
                <select id="sourceLang" class="w-full md:flex-1 px-6 py-4 text-lg font-semibold text-gray-700 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all cursor-pointer appearance-none">
                    <option value="en">🇺🇸 English</option>
                    <option value="es">🇲🇽 Spanish</option>
                    <option value="zh">🇨🇳 Chinese</option>
                </select>
                
                <button onclick="swapLanguages()" class="group p-4 bg-blue-100 hover:bg-blue-600 text-blue-600 hover:text-white rounded-full shadow-md hover:shadow-xl transition-all duration-300 transform hover:rotate-180">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                    </svg>
                </button>
                
                <select id="targetLang" class="w-full md:flex-1 px-6 py-4 text-lg font-semibold text-gray-700 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all cursor-pointer appearance-none">
                    <option value="en">🇺🇸 English</option>
                    <option value="es">🇲🇽 Spanish</option>
                    <option value="zh" selected>🇨🇳 Chinese</option>
                </select>
            </div>
            
            <div class="grid md:grid-cols-2 gap-6 md:gap-8">
                <div class="flex flex-col">
                    <div class="flex justify-between items-end mb-2 px-1">
                        <label class="text-sm font-bold text-gray-500 uppercase tracking-wider">Input</label>
                        <button onclick="clearText()" class="text-xs text-red-500 hover:text-red-700 font-medium hover:underline">Clear</button>
                    </div>
                    <div class="relative group">
                        <textarea 
                            id="sourceText" 
                            placeholder="Type here to translate..." 
                            class="w-full h-64 md:h-80 p-5 border-2 border-gray-200 rounded-2xl text-lg leading-relaxed text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 resize-none transition-all shadow-inner bg-white"
                        ></textarea>
                        <div class="absolute bottom-4 right-4 text-xs text-gray-400 pointer-events-none bg-white/80 px-2 rounded">
                            <span id="sourceCount">0</span> chars
                        </div>
                    </div>
                </div>
                
                <div class="flex flex-col" id="translationBox">
                     <div class="flex justify-between items-end mb-2 px-1">
                        <label class="text-sm font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
                           Output
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                        </label>
                        <button onclick="copyTranslation()" class="text-xs text-blue-500 hover:text-blue-700 font-medium hover:underline flex items-center gap-1">
                            <span id="copyBtnText">Copy</span>
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 012-2v-8a2 2 0 01-2-2h-8a2 2 0 01-2 2v8a2 2 0 012 2z"></path></svg>
                        </button>
                    </div>
                    <div class="relative">
                        <textarea 
                            id="translatedText" 
                            readonly 
                            placeholder="Translation will appear here..." 
                            class="w-full h-64 md:h-80 p-5 border-0 bg-blue-50/50 rounded-2xl text-lg leading-relaxed text-gray-800 resize-none focus:outline-none shadow-inner"
                        ></textarea>
                        
                        <div id="loadingSpinner" class="hidden absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-3 rounded-full shadow-lg">
                            <svg class="w-8 h-8 text-blue-600 loading-spinner" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                            </svg>
                        </div>

                        <div class="absolute bottom-4 right-4 text-xs text-gray-400 pointer-events-none">
                            <span id="targetCount">0</span> chars
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="text-center mt-8 text-blue-100/80 text-sm font-medium">
            <p>Powered by PHP & Google Gemini </p>
        </div>
    </div>
    
    <script>
        let translationTimer;
        
        const sourceText = document.getElementById('sourceText');
        const translatedText = document.getElementById('translatedText');
        const sourceLang = document.getElementById('sourceLang');
        const targetLang = document.getElementById('targetLang');
        const loadingSpinner = document.getElementById('loadingSpinner');
        const sourceCount = document.getElementById('sourceCount');
        const targetCount = document.getElementById('targetCount');
        
        // Debounce Logic
        sourceText.addEventListener('input', function() {
            sourceCount.textContent = this.value.length;
            
            clearTimeout(translationTimer);
            
            if (this.value.trim() === '') {
                translatedText.value = '';
                targetCount.textContent = '0';
                return;
            }
            
            // Wait 600ms after typing stops before calling API
            translationTimer = setTimeout(() => {
                translateText();
            }, 600);
        });
        
        async function translateText() {
            const text = sourceText.value.trim();
            if (!text) return;
            
            loadingSpinner.classList.remove('hidden');
            translatedText.classList.add('opacity-50'); // Dim text while loading
            
            try {
                const response = await fetch('translate.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        text: text,
                        sourceLang: sourceLang.value,
                        targetLang: targetLang.value
                    })
                });
                
                const data = await response.json();
                
                if (data.translation) {
                    translatedText.value = data.translation;
                    targetCount.textContent = data.translation.length;
                } else {
                    translatedText.value = 'Error: ' + (data.error || 'Translation failed');
                    console.error('Full Error:', data);
                }
            } catch (error) {
                translatedText.value = 'Error: Could not connect to backend';
                console.error('Network Error:', error);
            } finally {
                loadingSpinner.classList.add('hidden');
                translatedText.classList.remove('opacity-50');
            }
        }
        
        function swapLanguages() {
            // Swap Dropdowns
            const tempLang = sourceLang.value;
            sourceLang.value = targetLang.value;
            targetLang.value = tempLang;
            
            // Swap Text
            const tempText = sourceText.value;
            sourceText.value = translatedText.value;
            translatedText.value = tempText;
            
            // Update Counts
            sourceCount.textContent = sourceText.value.length;
            targetCount.textContent = translatedText.value.length;
            
            // Trigger translation if there is text
            if(sourceText.value.trim()) {
                translateText();
            }
        }

        function clearText() {
            sourceText.value = '';
            translatedText.value = '';
            sourceCount.textContent = '0';
            targetCount.textContent = '0';
            sourceText.focus();
        }

        function copyTranslation() {
            if(!translatedText.value) return;
            navigator.clipboard.writeText(translatedText.value).then(() => {
                const btnText = document.getElementById('copyBtnText');
                const originalText = btnText.innerText;
                btnText.innerText = 'Copied!';
                setTimeout(() => btnText.innerText = originalText, 2000);
            });
        }
        
        // Re-translate when languages change
        sourceLang.addEventListener('change', () => { if (sourceText.value.trim()) translateText(); });
        targetLang.addEventListener('change', () => { if (sourceText.value.trim()) translateText(); });
    </script>
</body>
</html>