export interface SFMCConfig {
    subdomain: string;
    clientId: string;
    clientSecret: string;
    accountId?: string;
}

export interface SFMCDataExtension {
    Name: string;
    CustomerKey: string;
    Fields: SFMCField[];
}

export interface SFMCField {
    Name: string;
    FieldType: string;
    MaxLength?: number;
    IsPrimaryKey?: boolean;
}

export interface SFMCQueryActivity {
    Name: string;
    CustomerKey: string;
    QueryText: string;
    Status?: string;
}

interface TokenCache {
    accessToken: string;
    expiresAt: number;
    soapUrl: string;
}

import { extractTag, splitResultBlocks } from './xmlUtils';

// ─── SFMCClient ───────────────────────────────────────────────────────────────

export class SFMCClient {
    private config: SFMCConfig;
    private tokenCache: TokenCache | null = null;

    constructor(config: SFMCConfig) {
        this.config = config;
    }

    private get authUrl(): string {
        return `https://${this.config.subdomain}.auth.marketingcloudapis.com/v2/token`;
    }

    private get soapEndpoint(): string {
        return (
            this.tokenCache?.soapUrl ??
            `https://${this.config.subdomain}.soap.marketingcloudapis.com/Service.asmx`
        );
    }

    async getToken(): Promise<string> {
        if (this.tokenCache && Date.now() < this.tokenCache.expiresAt - 60_000) {
            return this.tokenCache.accessToken;
        }

        const body: Record<string, string> = {
            grant_type: 'client_credentials',
            client_id: this.config.clientId,
            client_secret: this.config.clientSecret,
        };
        if (this.config.accountId) {
            body.account_id = this.config.accountId;
        }

        const res = await fetch(this.authUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            throw new Error(`SFMC auth failed (${res.status}): ${await res.text()}`);
        }

        const data = await res.json() as {
            access_token: string;
            expires_in: number;
            soap_instance_url?: string;
        };

        const rawSoap = data.soap_instance_url ?? `https://${this.config.subdomain}.soap.marketingcloudapis.com/`;
        this.tokenCache = {
            accessToken: data.access_token,
            expiresAt: Date.now() + data.expires_in * 1000,
            soapUrl: rawSoap.replace(/\/$/, '') + '/Service.asmx',
        };

        return this.tokenCache.accessToken;
    }

    // ── SOAP plumbing ──────────────────────────────────────────────────────────

    private buildEnvelope(token: string, bodyXml: string): string {
        return `<?xml version="1.0" encoding="UTF-8"?>
<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope"
            xmlns:a="http://schemas.xmlsoap.org/ws/2004/08/addressing">
  <s:Header>
    <a:Action s:mustUnderstand="1">Retrieve</a:Action>
    <a:To s:mustUnderstand="1">${this.soapEndpoint}</a:To>
    <fueloauth xmlns="http://exacttarget.com">${token}</fueloauth>
  </s:Header>
  <s:Body>${bodyXml}
  </s:Body>
</s:Envelope>`;
    }

    private async postSoap(envelope: string): Promise<string> {
        const res = await fetch(this.soapEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/xml; charset=utf-8',
                'SOAPAction': 'Retrieve',
            },
            body: envelope,
        });
        if (!res.ok) {
            throw new Error(`SFMC SOAP error (${res.status}): ${await res.text()}`);
        }
        return res.text();
    }

    private async retrieveAll(objectType: string, properties: string[]): Promise<string[]> {
        const token = await this.getToken();
        const propsXml = properties.map(p => `<Properties>${p}</Properties>`).join('\n          ');

        const firstEnvelope = this.buildEnvelope(token, `
    <RetrieveRequestMsg xmlns="http://exacttarget.com/wsdl/partnerAPI">
      <RetrieveRequest>
        <ObjectType>${objectType}</ObjectType>
        ${propsXml}
      </RetrieveRequest>
    </RetrieveRequestMsg>`);

        const rawBlocks: string[] = [];

        let xml = await this.postSoap(firstEnvelope);
        rawBlocks.push(...splitResultBlocks(xml));

        // Paginate through MoreDataAvailable responses
        while (extractTag(xml, 'OverallStatus') === 'MoreDataAvailable') {
            const requestId = extractTag(xml, 'RequestID');
            const contEnvelope = this.buildEnvelope(token, `
    <RetrieveRequestMsg xmlns="http://exacttarget.com/wsdl/partnerAPI">
      <RetrieveRequest>
        <ObjectType>${objectType}</ObjectType>
        <ContinueRequest>${requestId}</ContinueRequest>
      </RetrieveRequest>
    </RetrieveRequestMsg>`);
            xml = await this.postSoap(contEnvelope);
            rawBlocks.push(...splitResultBlocks(xml));
        }

        const status = extractTag(xml, 'OverallStatus');
        if (status !== 'OK' && status !== 'MoreDataAvailable') {
            const detail = extractTag(xml, 'StatusMessage') || status;
            throw new Error(`SFMC SOAP retrieve failed: ${detail}`);
        }

        return rawBlocks;
    }

    // ── Public API ─────────────────────────────────────────────────────────────

    async getDataExtensions(): Promise<SFMCDataExtension[]> {
        const [deBlocks, fieldBlocks] = await Promise.all([
            this.retrieveAll('DataExtension', ['CustomerKey', 'Name']),
            this.retrieveAll('DataExtensionField', [
                'Name', 'FieldType', 'MaxLength', 'IsPrimaryKey', 'DataExtension.CustomerKey',
            ]),
        ]);

        // Group fields by DE CustomerKey
        const fieldsByDE = new Map<string, SFMCField[]>();
        for (const block of fieldBlocks) {
            const deBlock = extractTag(block, 'DataExtension');
            const deKey = extractTag(deBlock, 'CustomerKey');
            if (!deKey) { continue; }

            const field: SFMCField = {
                Name: extractTag(block, 'Name'),
                FieldType: extractTag(block, 'FieldType'),
            };
            const maxLen = extractTag(block, 'MaxLength');
            if (maxLen) { field.MaxLength = Number(maxLen); }
            const isPk = extractTag(block, 'IsPrimaryKey');
            if (isPk === 'true') { field.IsPrimaryKey = true; }

            if (!fieldsByDE.has(deKey)) { fieldsByDE.set(deKey, []); }
            fieldsByDE.get(deKey)!.push(field);
        }

        return deBlocks
            .map(block => ({
                Name: extractTag(block, 'Name'),
                CustomerKey: extractTag(block, 'CustomerKey'),
                Fields: fieldsByDE.get(extractTag(block, 'CustomerKey')) ?? [],
            }))
            .filter(de => de.Name && de.CustomerKey);
    }

    async getQueryActivities(): Promise<SFMCQueryActivity[]> {
        const blocks = await this.retrieveAll('QueryDefinition', [
            'Name', 'CustomerKey', 'QueryText', 'Status',
        ]);

        return blocks
            .map(block => ({
                Name: extractTag(block, 'Name'),
                CustomerKey: extractTag(block, 'CustomerKey'),
                QueryText: extractTag(block, 'QueryText'),
                Status: extractTag(block, 'Status'),
            }))
            .filter(q => q.Name && q.QueryText);
    }
}
