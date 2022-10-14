import { serve, ConnInfo } from "./deps.ts";
import { handler as proxyHandler } from "./handlers/proxy.ts";
import { handler as apiHandler } from "./handlers/api.ts";

let ztIpAddress = '';

async function handler(req: Request, connInfo: ConnInfo): Promise<Response> {
    const { hostname } = new URL(req.url);
    if (hostname === ztIpAddress) {
        return apiHandler(req, connInfo);
    }

    return proxyHandler(req, connInfo);
}

function getZtIpAddress() {
    const interfaces = Deno.networkInterfaces();
    const ztIface = interfaces.find(iface => iface.address.startsWith('172.29.'));
    return ztIface?.address;
}

function sleep(seconds: number){
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000))
}

async function run() {
    for (let i = 0; i < 6; i++) {
        ztIpAddress = getZtIpAddress();
        if (ztIpAddress) {
            await serve(handler, { hostname: ztIpAddress, port: 31280 });
            return
        }
        console.log('Waiting for ZeroTier goro network...')
        await sleep(5);
    }
    console.error('ZeroTier goro network not found! Please refer to install instructions for troubleshooting.');
    Deno.exit(1)
}

run()
