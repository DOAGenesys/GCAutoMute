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
        await startGCSDKs(config.GCclientId);
        console.log("Auto-mute: retrieved clientId in start: ", config.GCclientId);
        getParticipantIds();
    } catch (error) {
        console.error('Auto-mute: Error occurred while starting:', error);
    }
}


function getParticipantIds() {
    console.log("Auto-mute: getParticipantIds started");
    let apiInstance = new platformClient.ConversationsApi();

    apiInstance.getConversation(window.conversationId)
        .then((data) => {
            console.log("Auto-mute: Conversation data:", data);
            let participants = data.participants;
            console.log("Auto-mute: Participants:", participants);
            for (let i = 0; i < participants.length; i++) {
                if (participants[i].purpose === 'agent') {
                    agentParticipantId = participants[i].id;
                    console.log("Auto-mute: Setting agentParticipantId:", agentParticipantId);
                    muteAgent(agentParticipantId); // Call the muteAgent function when agentParticipantId is known
                } else if (participants[i].purpose === 'customer') {
                    customerParticipantId = participants[i].id;
                    console.log("Auto-mute: Setting customerParticipantId:", customerParticipantId);
                }
            }
        })
        .catch((err) => {
            console.log("Auto-mute: There was a failure calling getConversation:", err);
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
            console.log("Auto-mute: patchConversationsCallParticipant returned successfully.");
            document.getElementById('statusMessage').style.display = 'block';
            document.getElementById('statusMessage').innerText = 'Call muted'; 
        })
        .catch((err) => {
            console.log("Auto-mute: There was a failure calling patchConversationsCallParticipant:");
            console.error(err);
        });
}
