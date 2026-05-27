//This file is to connect backend with Database

//Importing the supabase client library
const {createClient} = require('@supabase/supabase-js')



//Reading URL and KEY from .env file
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

// Creating Connection
const supabase = createClient(supabaseUrl,supabaseKey)

module.exports = supabase