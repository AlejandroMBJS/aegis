    </main>

    <!-- Footer -->
    <footer class="bg-gray-800 text-white py-6 mt-12">
        <div class="container mx-auto px-4 text-center">
            <p class="text-sm">&copy; <?php echo date('Y'); ?> DMT System. All rights reserved.</p>
            <p class="text-xs text-gray-400 mt-2">Version 1.0.0</p>
        </div>
    </footer>

    <!-- Toast Notification Container -->
    <div id="toast-container" class="fixed top-4 right-4 z-50"></div>

    <!-- Loading Overlay -->
    <div id="loading-overlay" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div class="bg-white p-6 rounded-lg shadow-xl">
            <div class="flex items-center space-x-3">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span class="text-gray-700 font-semibold">Loading...</span>
            </div>
        </div>
    </div>

    <script>
        // Global Toast Notification Function
        function showToast(message, type = 'info') {
            const toast = document.createElement('div');
            const config = {
                success: {
                    bg: 'bg-gradient-to-r from-green-500 to-green-600',
                    icon: 'check-circle',
                    iconBg: 'bg-green-400'
                },
                error: {
                    bg: 'bg-gradient-to-r from-red-500 to-red-600',
                    icon: 'exclamation-circle',
                    iconBg: 'bg-red-400'
                },
                warning: {
                    bg: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
                    icon: 'exclamation-triangle',
                    iconBg: 'bg-yellow-400'
                },
                info: {
                    bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
                    icon: 'info-circle',
                    iconBg: 'bg-blue-400'
                }
            };

            const typeConfig = config[type];
            toast.className = `${typeConfig.bg} text-white px-5 py-4 rounded-xl shadow-2xl mb-3 transform transition-all duration-300 translate-x-full opacity-0 flex items-center space-x-3 min-w-[300px] max-w-md border border-white border-opacity-20`;
            toast.innerHTML = `
                <div class="${typeConfig.iconBg} rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-${typeConfig.icon} text-white text-lg"></i>
                </div>
                <span class="font-medium flex-1">${message}</span>
                <button onclick="this.parentElement.remove()" class="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-1.5 transition-colors">
                    <i class="fas fa-times"></i>
                </button>
            `;

            document.getElementById('toast-container').appendChild(toast);

            // Trigger animation
            setTimeout(() => {
                toast.classList.remove('translate-x-full', 'opacity-0');
                toast.classList.add('translate-x-0', 'opacity-100');
            }, 10);

            setTimeout(() => {
                toast.classList.add('translate-x-full', 'opacity-0');
                setTimeout(() => toast.remove(), 300);
            }, 4000);
        }

        // Global Loading Overlay Functions
        function showLoading() {
            document.getElementById('loading-overlay').classList.remove('hidden');
        }

        function hideLoading() {
            document.getElementById('loading-overlay').classList.add('hidden');
        }
    </script>
</body>
</html>
