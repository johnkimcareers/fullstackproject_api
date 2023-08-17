const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('give password as an argument')
    process.exit(1)
}

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

const url = `mongodb+srv://johnkimcareers:${password}@fullstack.1bl3f9d.mongodb.net/?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)
    .then(response => {
        console.log('connected')
    })

const personSchema = new mongoose.Schema({
    name: String,
    number: String
})

const Person = mongoose.model('Person', personSchema)

if (name && number) {
    const person = new Person({
        name: name,
        number: number
    })
    person.save().then(result => {
        console.log(`added ${result.name} number ${result.number} to phonebook`)
        mongoose.connection.close()

    })
} else {
    Person.find({}).then(result => {
        console.log(result)
        mongoose.connection.close()

    })
}






