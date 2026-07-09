const { createClient } = require('@supabase/supabase-js');

// Inisialisasi Supabase menggunakan environment variables (dari Vercel .env) atau fallback
const supabaseUrl = process.env.SUPABASE_URL || 'https://tapklrbygapkxsksltgw.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'sb_publishable_ud69cPdqZTKPBfCESXVWdA_miQUfzeZ';
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Verifikasi Token JWT
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized: No token provided' });
    const token = authHeader.replace('Bearer ', '');

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return res.status(401).json({ error: 'Unauthorized: Invalid token' });

    const userId = user.id;
    const userEmail = user.email;
    const isAdmin = userEmail === 'admin@unagi.com';

    if (req.method === 'GET') {
        // Hanya Admin yang bisa melihat feedback
        if (!isAdmin) return res.status(403).json({ error: 'Forbidden: Admin access only' });

        const { data, error } = await supabase
            .from('feedback')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json(data);
    } 
    
    if (req.method === 'POST') {
        // MENYIMPAN FEEDBACK BARU
        let bodyData = req.body || {};
        if (typeof bodyData === 'string') {
            try { bodyData = JSON.parse(bodyData); } catch (e) { }
        }
        
        const { message } = bodyData;
        if (!message || !message.trim()) {
            return res.status(400).json({ error: 'Message cannot be empty' });
        }
        
        const { data, error } = await supabase
            .from('feedback')
            .insert([
                { user_id: userId, email: userEmail, message }
            ])
            .select();

        if (error) return res.status(500).json({ error: error.message });
        return res.status(201).json(data);
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
};
