
const express = require('express')
const router = express.Router()
const supabase = require('../services/supabase')
const { captureOwnerStack } = require('react')

//GET all active stores
router.get('/stores',async(req,res)=>{
    const {district} = req.query
    try{
        let query = supabase
            .from('stores')
            .select('*')
            .eq('is_active',true)

        if(district) query = query.eq('district',district)

        const {data,error} = await query
        if(error) return res.status(400).json({message:error.message})
        res.status(200).json({stores:data})  
    }catch(err){
        res.status(500).json({message:err.message})
    }
})

//GET products from stores
router.get('/products/:store_id',async(req,res)=>{
    const {store_id} = req.params
    const{category} = req.query

    try{
        let query = supabase
            .from('products')
            .select('*')
            .eq('store_id',store_id)
            .eq('is_available',true)
            .order('category')
        if(category && category !== 'All'){
            query = query.eq('category',category)
        }

        const {data,error} = await query
        if(error) return res.status(400).json({message:error.message})
        res.status(200).json({products:data})
    }catch(err){
        res.status(500).json({message:err.message})
    }
})

//POST place orders
router.post('/orders',async(req,res)=>{
    const{
        farmer_id, farmer_name,farmer_phone,
        store_id,items,total_amount,
        delivery_address,notes
    }=req.body

    if(!farmer_id || !store_id || !items || !total_amount){
        return res.status(400).json({
            message:'farmer_id,store_id,items and total_amount are required'
        })
    }
    try{
        const {data,error} = await supabase
            .from('orders')
            .insert({
                farmer_id,farmer_name,farmer_phone,
                store_id,items,
                total_amount:parseFloat(total_amount),
                delivery_address,notes,
                status:'pending'
            })
            .select()
        
        if(error) return res.status(400).json({message:error.message})
        
        //Auto add to tracker
        try{

            var itemsArray = typeof items === 'string' ? JSON.parse(items) : items

            var itemNames = itemsArray.map(function(i){
                return i.name
            }).join(', ')

            var {data:storeData} = await supabase
                .from('stores')
                .select('name')
                .eq('id',store_id)
                .single()

            var storeName = storeData ? storeData.name:'Rytu Shop'

           var {error:trackerError} = await supabase.from('activities').insert({
                farmer_id: farmer_id,
                date: date || new Date().toISOString().split('T')[0],
                type:'shop',
                title:'Ordered from ' +storeName,
                description : 'Ordered: '+ itemNames,
                cost: parseFloat(total_amount),
                source: 'shop'
            })
            if(trackerError){
                console.log('Tracker insert error: ',trackerError.message)
            }else{
                console.log('Tracker auto-add success')
            }

        }catch (trackerErr){
            console.log('Tracker auto-add error:',trackerErr.message)
        }

        res.status(201).json({
            message:'Order placed successfully!',
            order:data[0]
        })

            
    }catch(err){
        res.status(500).json({message:err.message})
    }
})

//GET orders for a farmer

router.get('/orders/:farmer_id',async(req,res)=>{
    const {farmer_id} = req.params

    try{
        const {data, error} = await supabase
            .from('orders')
            .select('*,stores(name,phone,address)')
            .eq('farmer_id', farmer_id)
            .order('date',{ascending:false})

        if(error) return res.status(400).json({message:error.message})

        res.status(200).json({orders:data})
    }catch (err){
        res.status(500).json({message:err.message})
    }
})

// HOP OWNER ROUTES

router.get('/owner/:phone',async(req,res)=>{
    const{phone} = req.params

    try{
        const {data,error} = await supabase
            .from(-shop_owners)
            .select('*,stores(*)')
            .eq('phone',phone)
            .eq('is_active',true)
            .single()
        
        if(error || !data){
            return res.status(404).json({message:'Not a registered shop owner'})
        }
        res.status(200).json({owner:data})


    }catch(err){
        res.status(500).json({message:err.message})
    }
})

//Getting all orders from stores
route.get('/orders/store/:store_id',async(req,res)=>{
    const{store_id} = req.params

    try{
        const {data,error} = await supabase
            .from('orders')
            .select('*')
            .eq('store_id',store_id)
            .order('created_at',{ascending:false})
        if(error)return res.status(400).json({message:error.message})
        res.status(200).json({orders:data})

    }catch(err){
        res.status(500).json({message:err.message})
    }
})

//PUT update order status
router.put('/prders/:id/status',async(req,res)=>{
    const{id} = req.params
    const {status} = req.body

    const validStatuses = ['pending','confirmed','out_for_delivery','delivered','cancelled']
    if(!validStatuses.includes(status)){
        return res.status(400).json({message:'Invalid Status'})
    }

    try{
        const {data,error} = await supabase
            .from('orders')
            .update({status:status})
            .eq('id',id)
            .select()

        if(error) return res.status(400).json({message:error.message})
        res.status(200).json({message:'Status Updated.',order:data[0]})

    }catch(err){
        res.status(500).json({message:err.message})
    }
})

//POST add product (shop Owner)

router.post('/products',async(req,res)=>{
    const{store_id,name,brand,category,unit,pricr,mrp,stock,description}= req.body

    if(!store_id || !name || !price){
        return res.status(400).json({message:'store_id'})
    }
    try{
        const {data, error} = await supabase
            .from('products')
            .insert({
                store_id,name,brand,category,unit,
                price:parseFloat(price),
                mrp: mrp? parseFloat(mrp):null,
                stock:parseInt(stock) || 100,
                description,is_available:true
           })
            .select()
        if(error) return res.status(400).json({message:error.message})
        res.status(201).json({product:data[0]})
    }catch(err){
        res.status(500).json({message:err.message})
    }
})

//PUT update product

router.put('/products/:id',async(req,res)=>{
    const{id} = req.params
    const updates = req.body

    try{
        const {data,error} = await supabase
            .from('products')
            .update(updates)
            .eq('id',id)
            .select()
        if(error) return res.status(400).json({message:error.message})
        res.status(200).json({product:data[0]})

    }catch(err){
        res.status(500).json({message:err.message})
    }
})

//Delete product
router.delete('/products/:id',async(req,res)=>{
    const{id}= res.params
    try{
        const {error} = await supabase
            .from('products')
            .delete()
            .eq('id',id)
        if(error) return res.status(400).json({message:error.message})

        res.status(200).json({message:'Product deleted'})

    }catch(err){
        res.status(500).json({message:err.message})
    }

})


module.exports = router