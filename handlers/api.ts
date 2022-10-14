const routes = {
    ping: new URLPattern({ pathname: '/api/v1/ping' }),
    info: new URLPattern({ pathname: '/api/v1/info' }),
}

export async function handler(req: Request): Promise<Response> {
    
    if (routes.ping.test(req.url)) {
        return new Response('pong');
    }

    if (routes.info.test(req.url)) {
        return new Response(JSON.stringify({
            version: Deno.version,
            build: Deno.build,
            uptimeSeconds: Math.round((Number(new Date()) - performance.timeOrigin) / 1000),
        }), 
        { headers: {'content-type': 'application/json'} },
        );
    }

    return new Response('not found', { status: 404 });
}
