import { copy, writeAll } from "https://deno.land/std@0.159.0/streams/conversion.ts";
import { ConnInfo } from "../deps.ts";

export async function handler(req: Request, connInfo: ConnInfo): Promise<Response> {

    const remoteIP = connInfo.remoteAddr.transport === 'tcp' ? connInfo.remoteAddr.hostname : '';
    const logLine = `${remoteIP} ${req.method} ${req.headers.get('Host')}`;
    // console.log(logLine);
    if (req.method !== 'CONNECT') {
        const res = fetch(req)
        return res
    }

    // console.log(req.headers.get('Host'))
    // const x = await Deno.connect({ hostname: 'ifconfig.co', port: 443})
    // ;(await x).readable
    // x.writable
    if (!req.body) {
      return new Response(null, {
        status: 400,
      })
    }

    try {
        const request = req;
        // assert(request);
        const { port, hostname } = new URL(req.url);

        const connect_port = port ? Number(port) : 80;
        // const socket: Deno.TcpConn = isIP(hostname)
        //     ? await Deno.connect({
        //           port: connect_port,
        //           hostname,
        //       })
        //     : await connect4or6_conn(hostname, connect_port);
        const socket: Deno.TcpConn = await Deno.connect({
                      port: connect_port,
                      hostname,
                  })

        Deno.upgradeHttp(request)
            .then(async ([conn, firstPacket]) => {
                let nbytes = firstPacket.byteLength;
                try {
                    
                    await writeAll(conn, firstPacket);
                    nbytes += await Promise.race([
                        copy(conn, socket),
                        copy(socket, conn),
                    ]);
                    
                } catch (error) {
                    console.error(error);
                } finally {
                    socket.close();
                    conn.close();
                    // console.log(`${logLine}: ${nbytes}`);
                }
            })
            .catch(console.error);

        return new Response(null, { status: 200 });
    } catch (e) {
        console.error(String(e));
        return new Response(String(e), { status: 503 });
    }
  
}
