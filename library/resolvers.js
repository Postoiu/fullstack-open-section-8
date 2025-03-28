const { GraphQLError } = require('graphql')
const jwt = require('jsonwebtoken')

const Book = require('./models/Book')
const Author = require('./models/Author')
const User = require('./models/User')
const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()

const resolvers = {
  Query: {
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      if (!args.author && !args.genre) {
        return Book.find({}).populate('author')
      }

      const filter = {}

      if (args.author) {
        filter.author = { name: args.author }
      }

      if (args.genre) {
        filter.genres = { $elemMatch: { $eq: args.genre } }
      }

      return Book.find(filter).populate('author')
    },
    allGenres: async () => {
      const books = await Book.find({})
      return [...new Set(books.flatMap((book) => book.genres))]
    },
    allAuthors: async () => Author.find({}),
    me: (root, args, context) => context.currentUser,
  },

  Author: {
    bookCount: async (root) => {
      return Book.collection.countDocuments({ author: root._id })
    },
  },

  Mutation: {
    addBook: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new GraphQLError('Invalid token', {
          extensions: {
            code: 'BAD_USER_INPUT',
          },
        })
      }

      let author = await Author.findOne({ name: args.author })

      if (!author) {
        author = new Author({ name: args.author })
        try {
          await author.save()
        } catch (error) {
          throw new GraphQLError(
            'Author name must be at least 4 characters long',
            {
              extensions: {
                code: 'BAD_USER_INPUT',
                invalidArgs: args.author,
                error,
              },
            }
          )
        }
      }

      const book = new Book({ ...args, author: author._id })
      await book.populate('author')

      try {
        await book.save()
      } catch (error) {
        throw new GraphQLError(
          'Book title must be at least 5 characters long',
          {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.title,
              error,
            },
          }
        )
      }

      pubsub.publish('BOOK_ADDED', { bookAdded: book })

      return book
    },

    editAuthor: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new GraphQLError('Invalid token', {
          extensions: {
            code: 'BAD_USER_INPUT',
          },
        })
      }

      const author = await Author.findOneAndUpdate(
        { name: args.name },
        { born: args.setBornTo },
        { new: true }
      )

      if (!author) {
        return null
      }

      return author
    },

    createUser: async (root, args) => {
      const user = new User({ ...args })

      return user.save().catch((error) => {
        throw new GraphQLError('Creating user failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            error,
          },
        })
      })
    },

    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if (!user || args.password !== 'secret') {
        throw new GraphQLError('Wrong credentials', {
          extensions: 'BAD_USER_INPUT',
        })
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      }

      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }
    },
  },

  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterableIterator('BOOK_ADDED'),
    },
  },
}

module.exports = resolvers
