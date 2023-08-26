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


// const generateId = () => {
//     const id = Math.max(...persons.map(person => person.id))
//     return id + 1
// }

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        if (response) {
            response.send(persons)
        } else {
            response.status(404).end()
        }
    })
        .catch(error => {
            console.log(error)
            response.status(500).end()
        })
})

app.get('/info', (request, response) => {
    const date = new Date()
    Person.find({}).then(people => {
        response.send(`Phonebook has info for ${people.length} people
    ${date}`)
    })
})

// app.get('/api/persons/:id', (request, response) => {
//     const id = Number(request.params.id)
//     const person = Person.find({id: id})
//
//     if (!person) {
//         response.status(404).end()
//     } else {
//         response.status(200).send(person)
//     }
// })

app.delete('/api/persons/:id', (request, response, next) => {
    const id = request.params.id
    console.log(`delete ${id}`)
    Person.findByIdAndRemove(id)
        .then(deletedObject => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body
    const id = request.params.id

    if (!body.name && !body.number) {
        response.status(400).send('missing both name and number')
    } else if (!body.name) {
        response.status(400).send('missing name')
    } else if (!body.number) {
        response.status(400).send('missing number')
    }

    Person.findByIdAndUpdate(id, body)
        .then(person => {
            response.status(200).send(person)
        })
        .catch(error => {
            next(error)
        })
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

app.post('/api/persons', (request, response, next) => {
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

    newPerson.save()
        .then(newPerson => {
            response.status(200).json(newPerson)
        })
        .catch(error => {
            next(error)
        })
})

const unknownEndPoint = (request, response) => {
    response.status(404).send({error:'unknown endpoint'})
}

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
    if (error.name === 'CastError') {
        return response.status(400).send({error: 'malformatted id'})
    }

    next(error)
}

app.use(unknownEndPoint)
app.use(errorHandler)
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

