"use server";

export interface Token {
  userId: string;
  name: string;
  isAdmin: boolean;
}

export const generateToken = async ({ userId, name, isAdmin }: Token) => {
  try {
    console.log("Generating token for:", { userId, name, isAdmin });

    const streamApiKey = process.env.STREAM_API_KEY;
    const streamApiSecret = process.env.STREAM_API_TOKEN;

    if (!streamApiKey || !streamApiSecret) {
      throw new Error("Stream API credentials are missing");
    }

    if (!userId || !name || isAdmin === undefined) {
      throw new Error("userId, name, and isAdmin are required");
    }

    // Import StreamClient
    const { StreamClient } = await import("@stream-io/node-sdk");
    
    const client = new StreamClient(streamApiKey, streamApiSecret);
    const token = client.generateUserToken({ user_id: userId });

    console.log("Token generated successfully");

    return {
      token,
      user: {
        id: userId,
        name,
        isAdmin,
      },
    };
  } catch (error) {
    console.error("Error generating Stream token:", error);
    throw new Error(
      `Token generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};