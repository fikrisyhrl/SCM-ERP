const { createClient } = require('@supabase/supabase-js');

// Inisialisasi Supabase menggunakan environment variables (dari Vercel .env)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = async (req, res) => {
    // Handle CORS (Izinkan akses dari domain manapun jika di-host terpisah)
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
    const userEmail = user.email;
    const isAdmin = userEmail === 'admin@unagi.com';

    if (req.method === 'GET') {
        // MENGAMBIL DATA MATERIAL (READ)
        let query = supabase
            .from('materials')
            .select('*')
            .order('created_at', { ascending: false });
            
        // Jika bukan admin, filter berdasarkan user_id
        if (!isAdmin) {
            query = query.eq('user_id', userId);
        }

        const { data, error } = await query;

        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json(data);
    } 
    
    if (req.method === 'POST') {
        // MENYIMPAN DATA MATERIAL BARU (CREATE)
        let bodyData = req.body;
        if (typeof bodyData === 'string') {
            try { bodyData = JSON.parse(bodyData); } catch (e) { }
        }
        
        const { name, type, qty, entry_date, exp_date, cost } = bodyData;
        
        const { data, error } = await supabase
            .from('materials')
            .insert([
                { user_id: userId, name, type, qty, entry_date, exp_date, cost }
            ])
            .select();

        if (error) return res.status(500).json({ error: error.message });
        return res.status(201).json(data);
    }
    
    if (req.method === 'DELETE') {
        // MENGHAPUS DATA MATERIAL (DELETE)
        let bodyData = req.body;
        if (typeof bodyData === 'string') {
            try { bodyData = JSON.parse(bodyData); } catch (e) { }
        }
        
        // ID bisa didapat dari query url (?id=...) atau dari body JSON
        const id = req.query.id || (bodyData && bodyData.id);
        
        if (!id) return res.status(400).json({ error: 'Missing id parameter' });
        
        let query = supabase.from('materials').delete().eq('id', id);
        
        // Jika bukan admin, pastikan dia hanya bisa menghapus datanya sendiri
        if (!isAdmin) {
            query = query.eq('user_id', userId);
        }
        
        const { data, error } = await query;
        if (error) return res.status(500).json({ error: error.message });
        
        return res.status(200).json({ success: true, message: 'Data deleted' });
    }

    // Jika method tidak didukung
    return res.status(405).json({ message: 'Method Not Allowed' });
};
