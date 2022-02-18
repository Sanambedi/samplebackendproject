const  mongoose  = require("mongoose");

const productSchema = new mongoose.Schema({

    name:{
        type: String,
        required:[true,'Please provide product name'],
        trim: true,
        maxlength:[200,"Product name should not be more then 200 characters"]    
    },
    price:{
        type: Number,
        required:[true,'Please provide product price'],
        maxlength:[6,"Product Price shall not exceed 999999"]    
    },
    description:{
        type: String,
        required:[true,'Please provide product description'],
    },
    photos:[
        {
            id: {
                type: String,
                required: true
            },
            secure_url: {
                type: String,
                required: true
            }
        }
    ],
    category:{
        type: String,
        required:[true,'Please Select category from- short-sleeves, long-sleeves,sweat-shirts and hoodies'],
        enum:{
            values:[
                'shortsleeves',
                'longsleeves',
                'sweatshirt',
                'hoodies'
            ],
            message:"Please Select category only from- short-sleeves, long-sleeves,sweat-shirts and hoodies"
        }
    },
    brand:{
        type: String,
        required:[true,"Please add a brand for clothing"],
    },
    ratings:{
        type: Number,
        default: 0,
    },
    numberOfReviews:{
        type: Number,
        default: 0
    },
    reviews:[
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
                required: true
            },
            name:{
                type: String,
                required: true
            },
            rating:{
                type: Number,
                required: true
            },
            comment:{
                type: String,
                required: true
            }
        }
    ],
    user:{
        type: mongoose.Schema.ObjectId,
        ref:'User',
        required: true
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Product',productSchema)