import { NextResponse } from 'next/server';
import { AgentDispatchClient } from 'livekit-server-sdk';
import { generateRandomString } from '@/lib/utils';

const API_KEY = process.env.LIVEKIT_API_KEY;
const API_SECRET = process.env.LIVEKIT_API_SECRET;
const LIVEKIT_URL = process.env.LIVEKIT_URL;

export async function POST(req: Request) {
  try {
    if (LIVEKIT_URL === undefined) {
      throw new Error('LIVEKIT_URL is not defined');
    }
    if (API_KEY === undefined) {
      throw new Error('LIVEKIT_API_KEY is not defined');
    }
    if (API_SECRET === undefined) {
      throw new Error('LIVEKIT_API_SECRET is not defined');
    }

    // Parse phone numberfrom request body
    const body = await req.json();
    const phoneNumber: string = body?.phoneNumber;
    console.log('🚀 ~ POST ~ phoneNumber:', phoneNumber);

    await createExplicitDispatch({
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      livekitUrl: LIVEKIT_URL,
      phoneNumber,
    });

    return NextResponse.json({ message: 'Dispatch created' });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
      return new NextResponse(error.message, { status: 500 });
    }
  }
}

async function createExplicitDispatch({
  apiKey,
  apiSecret,
  livekitUrl,
  phoneNumber,
}: {
  apiKey: string;
  apiSecret: string;
  livekitUrl: string;
  phoneNumber: string;
}) {
  const roomName = `room-${generateRandomString()}`;
  const agentName = 'outbound-caller';

  const agentDispatchClient = new AgentDispatchClient(livekitUrl, apiKey, apiSecret);

  const dispatch = await agentDispatchClient.createDispatch(roomName, agentName, {
    metadata: phoneNumber,
  });
  console.log('created dispatch', dispatch);
}
