function startGCSDKs(clientId) {
    return new Promise((resolve, reject) => {
        // Configuration parameters
        const appName = 'Auto mute';
        const qParamLanguage = 'langTag';
        const qParamEnvironment = 'gcTargetEnv';
        const qParamConversationId = 'conversationId';
        const redirectUri = 'https://gc-auto-mute.vercel.app';

        // Default configuration values
        let language = '';
        let environment = '';
        let userDetails = null;
        let conversationId = '';

        // Assign configurations from URL parameters or localStorage
        function assignConfiguration() {
            let browser_url = new URL(window.location);
            let searchParams = new URLSearchParams(browser_url.search);
            
            language = searchParams.get(qParamLanguage) || localStorage.getItem(`${appName}_language`) || '';
            environment = searchParams.get(qParamEnvironment) || localStorage.getItem(`${appName}_environment`) || 'mypurecloud.com';
            conversationId = searchParams.get(qParamConversationId) || '';
            
            localStorage.setItem(`${appName}_language`, language);
            localStorage.setItem(`${appName}_environment`, environment);
            window.conversationId = conversationId;
            window.environment = environment;

            console.log('Configuration assigned:', { language, environment, conversationId });
        }

        assignConfiguration();

        // Genesys Cloud SDK and Client App initialization
        const platformClient = require('platformClient');
        const client = platformClient.ApiClient.instance;
        const usersApi = new platformClient.UsersApi();
        let ClientApp = window.purecloud.apps.ClientApp;
        let myClientApp = new ClientApp({ pcEnvironment: window.environment });

        client.setPersistSettings(true, appName);
        client.setEnvironment(window.environment);

        client.loginImplicitGrant(clientId, redirectUri)
            .then(() => usersApi.getUsersMe())
            .then(data => {
                userDetails = data;
                document.getElementById('span_environment').innerText = window.environment;
                document.getElementById('span_language').innerText = language;
                document.getElementById('span_name').innerText = userDetails.name;

                console.log('SDKs initialization complete.');
                resolve(platformClient);
            })
            .catch((err) => {
                console.error("Error during setup:", err);
                reject(err);
            });
    });
}
