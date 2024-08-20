const axios = require('axios');
const { SignatureV4 } = require('@aws-sdk/signature-v4');
const { Sha256 } = require('@aws-crypto/sha256-js');
const { CognitoJwtVerifier } = require('aws-jwt-verify');

const {
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    AWS_SESSION_TOKEN,
} = process.env;

const COGNITO_USER_POOL_ID = "eu-central-1_DMCvrI0JY";
const COGNITO_CLIENT_ID = "2kpv50fubmasfahl5m6hv3lchd";

const sigv4 = new SignatureV4({
    service: 'lambda',
    region: 'eu-central-1',
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
      sessionToken: AWS_SESSION_TOKEN,
    },
    sha256: Sha256,
  });

module.exports.handler = async (event) => {
    console.log('Event: ' + JSON.stringify(event));
    const cfRequest = event.Records[0].cf.request;

    let headers = cfRequest.headers;

    // Check for the authorization header
    const authHeader = headers['authorization'];
    console.log('Headers: ' + authHeader);
    if (!authHeader || !authHeader[0] || !authHeader[0].value.startsWith('Bearer ')) {
        return {
            status: '403',
            statusDescription: 'Forbidden',
            body: 'Unauthorized',
        };
    }

    const token = authHeader[0].value.split(' ')[1];

    // Verify the token with Cognito
    try {
        const verifier = CognitoJwtVerifier.create({
            userPoolId: COGNITO_USER_POOL_ID,
            tokenUse: "id",
            clientId: COGNITO_CLIENT_ID,
        });

        await verifier.verify(token);
    } catch (err) {
        console.error('Token verification failed:', err);
        return {
            status: '403',
            statusDescription: 'Forbidden',
            body: 'Unauthorized',
        };
    }

    const apiUrl = new URL(`https://${cfRequest.origin.custom.domainName}${cfRequest.uri}`);

    const signV4Options = {
        method: cfRequest.method,
        hostname: apiUrl.host,
        path: apiUrl.pathname + (cfRequest.querystring ? `?${cfRequest.querystring}` : ''),
        protocol: apiUrl.protocol,
        query: cfRequest.querystring,
        headers: {
            'Content-Type': headers['content-type'][0].value,
            host: apiUrl.hostname, // compulsory
        },
    };
    
    try {
    
        // This was added to add a body and fix the signature not matching but now the request hangs until timeout
        //
        // if (cfRequest.body && cfRequest.body.data) {
        //     let body = cfRequest.body.data;
        //     if (cfRequest.body.encoding === 'base64') {
        //         body = Buffer.from(body, 'base64').toString('utf-8');
        //     }
        //     signV4Options.body = body;

        //     signV4Options.headers['Content-Length'] = Buffer.byteLength(body).toString();
        //     // signV4Options.headers['Content-Length'] = "50";
        // }

        console.log('Signing request with options: ', signV4Options);
        
        const signed = await sigv4.sign(signV4Options);
        const result = await axios({
            ...signed,
            url: apiUrl.href, // compulsory,
            timeout: 5000,
        });

        console.log('Result of axios call: ', result);
        console.log('Successfully received data: ', result.data);
        return {
            status: '200',
            statusDescription: 'OK',
            body: JSON.stringify(data),
        };
    } catch (error) {
        console.error('An error occurred', error);
        return {
            status: '500',
            statusDescription: 'Internal Server Error',
            body: 'Internal Server Error',
        };
    }
};
