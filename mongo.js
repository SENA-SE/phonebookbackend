const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('give password as argument')
    process.exit(1)
}
if ((process.argv.length > 3 && process.argv.length < 5) || process.argv.length > 5) {
    console.log('give name and number as two arguments')
    process.exit(1)
}

const password = process.argv[2]
const url =
    `mongodb+srv://runjie:${password}@fullstack.k9exxlp.mongodb.net/phonebook?retryWrites=true&w=majority`

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})
const Person = mongoose.model('Person', personSchema)

mongoose.set('strictQuery', false)
mongoose.connect(url)

if (process.argv.length == 3) {
    Person.find({}).then(result => {
        result.forEach(person => {
            console.log(person)
        })
        mongoose.connection.close()
    })
} else {
    const name = process.argv[3]
    const number = process.argv[4]
    const person = new Person({
        name: name,
        number: number,
    })

    person.save().then(result => {
        console.log(`added ${name} number ${number} to phonebook`)
        mongoose.connection.close()
    })
}


