require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const PORT = process.env.PORT

app.use(cors())
app.use(express.static('build'))


app.use(express.json())

let persons = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": 3,
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": 4,
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]

const generateId = () => {
    const id = Math.max(...persons.map(person => person.id))
    return id + 1
}

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.send(persons)
    })
})

app.get('/info', (request, response) => {
    const date = new Date()
    console.log(date)

    response.send(`Phonebook has info for ${persons.length} people
    ${date}`)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = Person.find({id: id})

    console.log(person)

    if (!person) {
        response.status(404).end()
    } else {
        response.status(200).send(person)
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    console.log(`delete ${id}`)
    Person.deleteOne({id: id}).then(deletedObject => {
        response.status(204).end()
    })

    // persons = persons.filter(person => person.id !== id)

})

const customMorgan = morgan((tokens, req, res) => {
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms',
        JSON.stringify(req.body)
    ].join(' ')
})

app.use(customMorgan)


app.post('/api/persons', (request, response) => {
    const body = request.body
    if (!body.name) {
        response.status(400).send('Missing name')
    } else if (!body.number) {
        response.status(400).send('Missing number')
    }

    const newPerson = new Person({
        name: body.name,
        number: body.number
    })

    newPerson.save().then(newPerson => {
        response.status(200).json(newPerson)
    })
    // persons.concat(newPerson)
})


// const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

