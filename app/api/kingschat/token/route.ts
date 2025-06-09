// app/api/kingschat/token/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { code } = await req.json();

    const response = await fetch("https://connect.kingsch.at/developer/oauth2/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            grant_type: "code",
            client_id: process.env.KINGSCHAT_CLIENT_ID, // REPLACE with actual client ID
            code,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        return NextResponse.json({ error: data }, { status: 400 });
    }

    return NextResponse.json(data);
}
