const mongoose = require("mongoose")
require("dotenv").config()

const url = process.env.MONGODB_URI

console.log("connecting to MongoDB")
mongoose.connect(url)
	.then(() => {
		console.log("connected to MongoDB")
	})
	.catch((error) => {
		console.log("error connecting to MongoDB:", error.message)
	})

const personSchema = new mongoose.Schema({
	name: {
		type: String, 
		minLength: 3, 
		required: [true, "Name required"]
	},
	number: {
		type: String,
		minLength: 8,
		validate:{
			validator: function(v) {
				return /^\d{2,3}-\d+$/.test(v)
			},
			message: props => `${props.value} is not a valid phone number!`
		},
		required: [true, "Phone number required"]
	},
})

personSchema.set("toJSON", {
	transform: (document, returnedObject) => {
		returnedObject.id = returnedObject._id.toString()
		delete returnedObject._id
		delete returnedObject.__v
	}
})

const Person = mongoose.model("Person", personSchema)

mongoose.set("strictQuery", false)

module.exports = Person

