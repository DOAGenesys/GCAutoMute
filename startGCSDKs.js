function startGCSDKs(clientId) {
    return new Promise((resolve, reject) => {
        console.log('Auto-mute: startGCSDKs function started.');

        // Configuration parameters
        const appName = 'Auto mute';
        const qParamLanguage = 'langTag';
        const qParamEnvironment = 'gcTargetEnv';
        const qParamConversationId = 'conversationId';
        const redirectUri = 'https://gc-auto-mute.vercel.app';

        console.log('Auto-mute: Default configuration values being set.');
        let language = '';
        let environment = '';
        let userDetails = null;
        let conversationId = '';

        // Assign configurations from URL parameters or localStorage
        function assignConfiguration() {
            console.log('Auto-mute: Assigning configuration.');
            let browser_url = new URL(window.location);
            let searchParams = new URLSearchParams(browser_url.search);
            
            language = searchParams.get(qParamLanguage) || localStorage.getItem(`${appName}_language`) || '';
            environment = searchParams.get(qParamEnvironment) || localStorage.getItem(`${appName}_environment`) || 'mypurecloud.com';
            conversationId = searchParams.get(qParamConversationId) || '';
            
            localStorage.setItem(`${appName}_language`, language);
            localStorage.setItem(`${appName}_environment`, environment);
            window.conversationId = conversationId;
            window.environment = environment;

            console.log('Auto-mute: Configuration assigned:', { language, environment, conversationId });
        }

        assignConfiguration(); // Ensure configuration is assigned before proceeding

        console.log('Auto-mute: Beginning Genesys Cloud SDK and Client App initialization.');
        const platformClient = require('platformClient');
        const client = platformClient.ApiClient.instance;
        const usersApi = new platformClient.UsersApi();
        let ClientApp = window.purecloud.apps.ClientApp;
        let myClientApp = new ClientApp({ pcEnvironment: window.environment });

        client.setPersistSettings(true, appName);
        client.setEnvironment(window.environment);

        console.log('Auto-mute: Attempting to log in using implicit grant.');
        client.loginImplicitGrant(clientId, redirectUri)
            .then(() => {
                console.log('Auto-mute: Logged in successfully, attempting to fetch user details.');
                return usersApi.getUsersMe();
            })
            .then(data => {
                userDetails = data;
                console.log('Auto-mute: User details fetched successfully:', userDetails);

                document.getElementById('span_environment').innerText = window.environment;
                document.getElementById('span_language').innerText = language;
                document.getElementById('span_name').innerText = userDetails.name;

                console.log('Auto-mute: SDKs initialization complete.');
                resolve(platformClient);
            })
            .catch((err) => {
                console.error("Auto-mute: Error during setup:", err);
                reject(err);
            });
    });
}
