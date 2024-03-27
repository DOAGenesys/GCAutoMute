// PureCloud Platform Client and API instances
const platformClient = require('platformClient');
const client = platformClient.ApiClient.instance;

function getConfig() {
    return fetch('/api/getConfig')
        .then(response => {
            if (!response.ok) {
                throw new Error('Environment vars could not be retrieved');
            }
            return response.json();
        });
}

async function start() {
    try {
        const config = await getConfig();
        startGCSDKs(config.clientId);
        getParticipantIds();
    } catch (error) {
        console.error('Error occurred while starting:', error);
    }
}

function getParticipantIds() {
    console.log("getParticipantIds started");
    let apiInstance = new platformClient.ConversationsApi();

    apiInstance.getConversation(window.conversationId)
        .then((data) => {
            console.log("Conversation data:", data);
            let participants = data.participants;
            console.log("Participants:", participants);
            for (let i = 0; i < participants.length; i++) {
                if (participants[i].purpose === 'agent') {
                    agentParticipantId = participants[i].id;
                    console.log("Setting agentParticipantId:", agentParticipantId);
                    muteAgent(agentParticipantId); // Call the muteAgent function when agentParticipantId is known
                } else if (participants[i].purpose === 'customer') {
                    customerParticipantId = participants[i].id;
                    console.log("Setting customerParticipantId:", customerParticipantId);
                }
            }
        })
        .catch((err) => {
            console.log("There was a failure calling getConversation:", err);
        });
}

function muteAgent(agentParticipantId) {
    let apiInstance = new platformClient.ConversationsApi();
    let conversationId = window.conversationId;
    let participantId = agentParticipantId; 
    let body = {"muted": true}; 

    // Update conversation participant
    apiInstance.patchConversationsCallParticipant(conversationId, participantId, body)
        .then(() => {
            console.log("patchConversationsCallParticipant returned successfully.");
        })
        .catch((err) => {
            console.log("There was a failure calling patchConversationsCallParticipant:");
            console.error(err);
        });
}
