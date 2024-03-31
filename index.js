// const http = require('http')
const express = require("express")
const morgan = require("morgan")
const cors = require("cors")
const Person = require("./models/person")

const app = express()

app.use(cors())

morgan.token("post", function (req) { return JSON.stringify(req.body) })
app.use(morgan(":method :url :status :res[content-length] - :response-time ms :post"))

app.use(express.json())
app.use(express.static("dist"))



let persons = []
Person.find({}).then(response => persons = response)


app.get("/", (request, response) => {
	response.send("<h1>Hello World!</h1>")
})

app.get("/api/persons", (request, response) => {
	Person.find({}).then(persons => {
		response.json(persons)
	})
})

app.get("/info", (request, response) => {
	response.send(`<p>Phonebook has info for ${persons.length} people</p><p>${new Date()}</p>`)
})

app.get("/api/persons/:id", (request, response, next) => {
	const id = Number(request.params.id)
	console.log(id)

	Person.findById(request.params.id).then(person => {
		if (person) {
			response.json(person)
		} else {
			response.status(404).end()
		}
	})
		.catch(error => next(error))
})


app.delete("/api/persons/:id", (request, response, next) => {
	Person.findByIdAndDelete(request.params.id)
		.then(() => {
			Person.find({}).then(response => persons = response)
			response.status(204).end()
		})
		.catch(error => next(error))
})


app.post("/api/persons", (request, response, next) => {
	const body = request.body
	console.log(body)
	if (!body.name || !body.number) {
		return response.status(400).json({
			error: "name or number is missing"
		})
	}
	const person = new Person({
		name: body.name,
		number: body.number || "",
	})

	person.save().then(savedPerson => {
		response.json(savedPerson)
		Person.find({}).then(response => persons = response)
	})
		.catch(error => next(error))
})

app.put("/api/persons/:id", (request, response, next) => {
	const body = request.body
	const id = request.params.id


	if (!body.name || !body.number) {
		return response.status(400).json({
			error: "name or number is missing"
		})
	}

	if (persons.find(p => p.id == id)) {
		console.log(11)
		const person = {
			name: body.name,
			number: body.number,
		}

		Person.findByIdAndUpdate(request.params.id, person, { new: true, runValidators: true, context: "query" }).then(updatedNote => {
			Person.find({}).then(response => persons = response)
			response.json(updatedNote)
		})
			.catch(error => next(error))

	} else {
		return response.status(400).json({
			error: `${body.name} has already been removed from phonebook`
		})
	}

})

const unknownEndpoint = (request, response) => {
	response.status(404).send({ error: "unknown endpoint" })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
	console.error(error.message)

	if (error.name === "CastError") {
		return response.status(400).send({ error: "malformatted id" })
	} else if (error.name === "ValidationError") {
		return response.status(400).json({ error: error.message })
	}

	next(error)
}

// this has to be the last loaded middleware.
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})