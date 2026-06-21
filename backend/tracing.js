/**
 * MediGuide OpenTelemetry Tracing Initialization
 * 
 * This file MUST be loaded before any other imports via:
 *   node --require ./tracing.js server.js
 *
 * In production, set OTEL_EXPORTER_OTLP_ENDPOINT to your collector (e.g. Jaeger, Tempo).
 * When the env var is absent the SDK still creates spans but does not export them,
 * so there is zero overhead in local development.
 */

const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { Resource } = require('@opentelemetry/resources');

const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

const sdk = new NodeSDK({
    resource: new Resource({
        'service.name': 'mediguide-backend',
        'service.version': '7.0.0',
        'deployment.environment': process.env.NODE_ENV || 'development',
    }),
    traceExporter: endpoint
        ? new OTLPTraceExporter({ url: `${endpoint}/v1/traces` })
        : undefined,
    instrumentations: [
        getNodeAutoInstrumentations({
            // Disable noisy fs instrumentation
            '@opentelemetry/instrumentation-fs': { enabled: false },
        }),
    ],
});

sdk.start();
console.log(`📡 OpenTelemetry tracing initialized${endpoint ? ` → ${endpoint}` : ' (no exporter, local mode)'}`);

process.on('SIGTERM', () => {
    sdk.shutdown()
        .then(() => console.log('OpenTelemetry SDK shut down.'))
        .catch((err) => console.error('Error shutting down OpenTelemetry SDK', err))
        .finally(() => process.exit(0));
});
