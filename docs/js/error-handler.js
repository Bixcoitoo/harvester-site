// Configuração do Lockdown
if (window.lockdown) {
    window.lockdown({
        errorTaming: 'unsafe',
        consoleTaming: 'unsafe',
        mathTaming: 'unsafe',
        dateTaming: 'unsafe',
        intrinsicsGuard: 'unsafe',
        overrideTaming: 'severe'
    });
}

// Manipulador global de erros
window.addEventListener('error', function(event) {
    // Lista de erros para ignorar
    const ignoredErrors = [
        'css_text',
        'message channel closed',
        'Removing unpermitted intrinsics',
        'lockdown-install',
        'AdBlock detectado'
    ];

    if (ignoredErrors.some(err => event.message.includes(err))) {
        event.preventDefault();
        return true;
    }
});

// Manipulador de promessas rejeitadas
window.addEventListener('unhandledrejection', function(event) {
    if (event.reason && event.reason.message && (
        event.reason.message.includes('message channel closed') ||
        event.reason.message.includes('css_text') ||
        event.reason.message.includes('unpermitted intrinsics')
    )) {
        event.preventDefault();
    }
}); 