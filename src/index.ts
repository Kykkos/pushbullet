import WebSocket from 'ws';
import axios from 'axios';

// Charger les variables d'environnement
const ACCESS_TOKEN = process.env.ACCESS_TOKEN || '<votre_access_token>';
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || '<votre_n8n_webhook_url>';

// Connexion au WebSocket Pushbullet
const ws = new WebSocket(`wss://stream.pushbullet.com/websocket/${ACCESS_TOKEN}`);

ws.on('open', () => {
    console.log('Connecté au WebSocket Pushbullet');
});

ws.on('message', (data: string) => {
    const message = JSON.parse(data);

    // Filtrer les messages de type "push" avec "type: mirror" pour les SMS
    if (message.type === 'push' && message.push?.type === 'mirror' && message.push.package_name === 'com.google.android.apps.messaging') {
        console.log('Notification SMS reçue :', message.push);

        // Envoyer la notification à n8n via webhook
        axios.post(N8N_WEBHOOK_URL, message.push)
            .then(() => console.log('Notification envoyée à n8n'))
            .catch((error) => console.error('Erreur lors de l\'envoi à n8n :', error.message));
    }
});

ws.on('error', (error) => {
    console.error('Erreur WebSocket :', error);
});

ws.on('close', () => {
    console.log('Connexion WebSocket fermée. Reconnexion dans 5 secondes...');
    setTimeout(() => {
        const ws = new WebSocket(`wss://stream.pushbullet.com/websocket/${ACCESS_TOKEN}`);
    }, 5000);
});

// Garder le serveur actif
console.log('Serveur démarré');
