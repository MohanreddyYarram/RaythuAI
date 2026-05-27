
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
require ('dotenv').config()
const {createClient} = require('@supabase/supabase-js')

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
)

async function test() {
    const {data,error} = await supabase
     .from('farmers')
     .select("*")
    
    console.log("Data",data)
    console.log("Error", error)

    
}

test()