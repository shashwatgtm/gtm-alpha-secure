// netlify/functions/mcp.js
export default async (req, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers });
    }

    const url = new URL(req.url);
    const path = url.pathname.replace('/.netlify/functions/mcp', '');
    
    try {
        if (path === '/openai-schema') {
            return new Response(JSON.stringify({
                openapi: "3.0.0",
                info: {
                    title: "GTM Alpha API",
                    version: "2.0.0"
                },
                servers: [{
                    url: "https://gtmalpha.netlify.app/.netlify/functions/mcp"
                }],
                paths: {
                    "/consultation": {
                        post: {
                            summary: "Get GTM consultation",
                            operationId: "getConsultation"
                        }
                    }
                }
            }), { status: 200, headers });
        }
        
        if (path === '/gemini-functions') {
            return new Response(JSON.stringify({
                functions: [{
                    name: "gtm_consultation",
                    description: "GTM strategy analysis"
                }]
            }), { status: 200, headers });
        }
        
        if (path === '/health') {
            return new Response(JSON.stringify({
                status: "operational",
                version: "2.0.0"
            }), { status: 200, headers });
        }
        
        return new Response(JSON.stringify({
            name: "GTM Alpha MCP Server",
            version: "2.0.0",
            endpoints: [
                "/openai-schema",
                "/gemini-functions",
                "/health"
            ]
        }), { status: 200, headers });
        
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers
        });
    }
};

export const config = {
    path: "/api/mcp"
};