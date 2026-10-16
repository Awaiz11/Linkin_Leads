import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// CORS headers zaroori hote hain Extension se connection ke liye
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Yeh OPTIONS block preflight CORS request handle karta hai
export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(request: Request) {
    try {
        const bodyText = await request.text(); // Pehle text mein read karo
        if (!bodyText) {
            return NextResponse.json({ success: false, error: 'Empty request body' }, { status: 400, headers: corsHeaders });
        }

        const body = JSON.parse(bodyText); // Phir JSON mein convert karo
        const { name, headline, location, url, status } = body;

        const { data, error } = await supabase
            .from('leads')
            .insert([
                {
                    name: name || 'Unknown',
                    headline: headline || '',
                    location: location || '',
                    linkedin_url: url || '',
                    status: status || 'New Lead'
                }
            ]);

        if (error) {
            console.error("Supabase Error:", error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500, headers: corsHeaders });
        }

        return NextResponse.json({ success: true, message: 'Lead saved successfully!' }, { headers: corsHeaders });

    } catch (error: any) {
        console.error("API Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500, headers: corsHeaders });
    }
}