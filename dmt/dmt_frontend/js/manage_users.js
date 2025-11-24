
document.addEventListener('DOMContentLoaded', function() {
    const usersTableBody = document.getElementById('users-table-body');
    const addUserBtn = document.getElementById('add-user-btn');
    const userModal = document.getElementById('user-modal');
    const cancelBtn = document.getElementById('cancel-btn');
    const userForm = document.getElementById('user-form');
    const modalTitle = document.getElementById('modal-title-text');
    const passwordInput = document.getElementById('password');
    const passwordHint = passwordInput.nextElementSibling;

    if (!window.API_TOKEN) {
        console.error('API Token is missing. Please ensure you are logged in.');
        alert('Authentication error: API Token is missing. Please log in again.');
        return; // Stop execution if token is missing
    }
    const api = new API(window.API_TOKEN);
    console.log('API Token:', window.API_TOKEN); // Add this line for debugging

    function openModal(title, user = null) {
        userForm.reset();
        document.getElementById('user-id').value = '';
        passwordInput.setAttribute('required', 'required');

        // Set modal title with translation support
        if (user) {
            modalTitle.setAttribute('data-i18n', 'manageUsers.modal.editUserTitle');
            modalTitle.textContent = 'Edit User';
            passwordHint.setAttribute('data-i18n', 'manageUsers.form.passwordHintEdit');
            passwordHint.textContent = 'Leave blank to keep current password.';
        } else {
            modalTitle.setAttribute('data-i18n', 'manageUsers.modal.addUserTitle');
            modalTitle.textContent = 'Add New User';
            passwordHint.setAttribute('data-i18n', 'manageUsers.form.passwordHintNew');
            passwordHint.textContent = 'Password is required for new users.';
        }

        if (user) {
            document.getElementById('user-id').value = user.id;
            document.getElementById('full_name').value = user.full_name;
            document.getElementById('username').value = user.username;
            document.getElementById('email').value = user.email;
            document.getElementById('role').value = user.role;
            passwordInput.removeAttribute('required');
        }

        userModal.classList.remove('hidden');

        // Re-apply translations to modal content
        if (typeof window.i18n !== 'undefined' && typeof window.i18n.translatePage === 'function') {
            window.i18n.translatePage();
        }
    }

    function closeModal() {
        userModal.classList.add('hidden');
    }

    async function fetchUsers() {
        try {
            const users = await api.getUsers();
            renderUsers(users);
        } catch (error) {
            console.error('Error fetching users:', error);
            alert('Failed to fetch users. Please try again.');
        }
    }

    function renderUsers(users) {
        usersTableBody.innerHTML = '';
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${user.full_name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${user.username}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${user.email}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${user.role}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button class="text-indigo-600 hover:text-indigo-900 edit-btn" data-id="${user.id}">Edit</button>
                    <button class="text-red-600 hover:text-red-900 ml-4 delete-btn" data-id="${user.id}">Delete</button>
                </td>
            `;
            usersTableBody.appendChild(row);
        });
    }

    addUserBtn.addEventListener('click', () => openModal('Add New User'));
    cancelBtn.addEventListener('click', closeModal);

    userForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const userId = formData.get('id');
        const data = Object.fromEntries(formData.entries());

        // For editing: if password is empty, don't include it in the update payload
        // For creating: password is required
        if (!data.password || data.password.trim() === '') {
            if (userId) {
                // Editing: remove password to keep existing one
                delete data.password;
            } else {
                // Creating: password is required
                alert('Password is required for new users');
                return;
            }
        } else {
            // Trim password to remove accidental spaces
            data.password = data.password.trim();
        }

        try {
            if (userId) {
                await api.updateUser(userId, data);
            } else {
                await api.createUser(data);
            }
            closeModal();
            fetchUsers();
        } catch (error) {
            console.error('Error saving user:', error);
            alert('Failed to save user. Please check the details and try again.');
        }
    });

    usersTableBody.addEventListener('click', async function(e) {
        const target = e.target;
        const userId = target.dataset.id;

        if (target.classList.contains('edit-btn')) {
            try {
                const user = await api.getUser(userId);
                openModal('Edit User', user);
            } catch (error) {
                console.error('Error fetching user details:', error);
                alert('Failed to fetch user details.');
            }
        }

        if (target.classList.contains('delete-btn')) {
            if (confirm('Are you sure you want to delete this user?')) {
                try {
                    await api.deleteUser(userId);
                    fetchUsers();
                } catch (error) {
                    console.error('Error deleting user:', error);
                    alert('Failed to delete user.');
                }
            }
        }
    });

    // Initial fetch
    fetchUsers();
});
