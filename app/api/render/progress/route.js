let progressClients = new Set();

export async function GET() {
    const stream = new ReadableStream({
        start(controller) {
            const client = {
                controller,
                send: (data) => {
                    const chunk = `data: ${JSON.stringify(data)}\n\n`;
                    controller.enqueue(new TextEncoder().encode(chunk));
                }
            };

            progressClients.add(client);

            // Send initial connection message
            client.send({ type: 'connected', message: 'Progress stream connected' });
        },
        cancel() {
            // Clean up when client disconnects
            progressClients.forEach(client => {
                if (client.controller === this.controller) {
                    progressClients.delete(client);
                }
            });
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}

// Export function to broadcast progress updates
export function broadcastProgress(data) {
    progressClients.forEach(client => {
        try {
            client.send(data);
        } catch (error) {
            console.error('Error sending progress update:', error);
            progressClients.delete(client);
        }
    });
}