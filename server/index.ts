import express from 'express';
import { loginRequestSchema } from '../src/lib/schemas';
import { fetchMockEventDetail, fetchMockEvents, fetchMockQuotes, parseEventCategory } from './mockData';
import { clearLocalSession, createLocalSession, getLocalSession, getSessionIdFromCookieHeader } from './sessionStore';

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '16kb' }));
app.use('/api', (_request, response, next) => {
  response.setHeader('Cache-Control', 'no-store');
  next();
});

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', service: 'mock-exchange-api' });
});

app.get('/api/session', (request, response) => {
  const localSession = getLocalSession(getSessionIdFromCookieHeader(request.headers.cookie));

  if (!localSession) {
    response.json({
      status: 'anonymous',
      factor: null,
      expiresAt: null,
      message: 'No active local demo session.',
    });
    return;
  }

  response.json({
    status: 'authenticated',
    factor: 'complete',
    expiresAt: localSession.expiresAt,
    message: 'Restored the active local demo session.',
  });
});

function hasRequiredSession(request: express.Request, response: express.Response) {
  const sessionId = getSessionIdFromCookieHeader(request.headers.cookie);
  const localSession = getLocalSession(sessionId);

  if (!localSession) {
    clearLocalSession(response, sessionId);
    response.status(401).json({ message: 'Log in before loading market data.', errorType: 'AUTHENTICATION_REQUIRED' });
    return false;
  }

  return true;
}

app.post('/api/session', (request, response) => {
  const credentials = loginRequestSchema.safeParse(request.body);

  if (!credentials.success) {
    response.status(400).json({ message: 'Enter a valid email and password.' });
    return;
  }

  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();
  createLocalSession(
    response,
    { token: 'local-demo-session', expiresAt, status: 'authenticated' },
    getSessionIdFromCookieHeader(request.headers.cookie),
  );

  response.status(201).json({
    status: 'authenticated',
    factor: 'complete',
    expiresAt,
    message: 'Logged in to the demo exchange.',
  });
});

app.delete('/api/session', (request, response) => {
  clearLocalSession(response, getSessionIdFromCookieHeader(request.headers.cookie));
  response.json({ status: 'anonymous', message: 'Logged out of the local demo session.' });
});

app.get('/api/events', (request, response) => {
  if (!hasRequiredSession(request, response)) return;
  response.json(fetchMockEvents(parseEventCategory(request.query.category)));
});

app.get('/api/events/:eventId', (request, response) => {
  if (!hasRequiredSession(request, response)) return;
  const data = fetchMockEventDetail(request.params.eventId);

  if (!data) {
    response.status(404).json({ message: 'Demo event not found.' });
    return;
  }

  response.json(data);
});

app.get('/api/quotes', (request, response) => {
  if (!hasRequiredSession(request, response)) return;
  response.json(fetchMockQuotes(request.query.marketIds));
});

app.use((_request, response) => {
  response.status(404).json({ message: 'Route not found' });
});

app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  console.error(error);
  response.status(500).json({ message: 'Unexpected API error' });
});

const port = Number(process.env.PORT ?? 8798);
app.listen(port, () => {
  console.log(`Mock Exchange API listening on http://localhost:${port}`);
});
