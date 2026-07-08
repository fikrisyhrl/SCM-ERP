const { createClient } = require('@supabase/supabase-js');

// Inisialisasi Supabase menggunakan environment variables (dari Vercel .env)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = async (req, res) => {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
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

    if (req.method === 'GET') {
        // MENGAMBIL DATA PENJUALAN (READ)
        const { data, error } = await supabase
            .from('sales')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json(data);
    } 
    
    if (req.method === 'POST') {
        // MENYIMPAN DATA PENJUALAN BARU (CREATE)
        const { customer_name, product, qty, revenue } = req.body;
        
        const { data, error } = await supabase
            .from('sales')
            .insert([
                { user_id: userId, customer_name, product, qty, revenue }
            ])
            .select();

        if (error) return res.status(500).json({ error: error.message });
        return res.status(201).json(data);
    }

    // Jika method tidak didukung
    return res.status(405).json({ message: 'Method Not Allowed' });
};
