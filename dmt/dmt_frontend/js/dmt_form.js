document.addEventListener("DOMContentLoaded", async () => {

    currentUserRole = getUserRole();

    await loadAllCatalogs();

    if (isEditMode) {
        await loadRecord(recordId);
    }

    applyRolePermissions(currentUserRole);
    applySectionBasedRBAC(currentUserRole);

    setupFormSubmission();
});
