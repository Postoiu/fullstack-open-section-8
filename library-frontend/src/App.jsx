import { useEffect, useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import LoginForm from './components/LoginForm'
import { useApolloClient, useSubscription } from '@apollo/client'
import Recommended from './components/Recommended'
import { BOOK_ADDED } from './queries'

const App = () => {
  const [token, setToken] = useState(null)
  const navigate = useNavigate()
  const client = useApolloClient()

  useEffect(() => {
    const storedToken = localStorage.getItem('library-user-token')

    if (storedToken) {
      setToken(storedToken)
    }
  }, [])

  useSubscription(BOOK_ADDED, {
    onData: ({ data, client }) => {
      const addedBook = data.data.bookAdded
      alert(`${addedBook.title} was added`)

      client.cache.modify({
        fields: {
          allBooks(existingBooks = [], { readField }) {
            if (
              existingBooks.some(
                (book) => readField('id', book) === addedBook.id
              )
            ) {
              return existingBooks
            }

            return [...existingBooks, addedBook]
          },
        },
      })
    },
  })

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  return (
    <div>
      <div>
        <Link style={{ margin: 10 }} to='/authors'>
          authors
        </Link>
        <Link style={{ margin: 10 }} to='/books'>
          books
        </Link>
        {token ? (
          <>
            <Link style={{ margin: 10 }} to='/add'>
              add book
            </Link>
            <Link style={{ margin: 10 }} to='/recommended'>
              recommended
            </Link>
            <button onClick={logout}>logout</button>
          </>
        ) : (
          <button onClick={() => navigate('/login')}>login</button>
        )}
      </div>

      <Routes>
        <Route path='/' element={<Navigate to='/authors' replace />} />
        <Route path='/authors' element={<Authors />} />
        <Route path='/books' element={<Books />} />
        <Route path='/add' element={<NewBook />} />
        <Route path='/login' element={<LoginForm setToken={setToken} />} />
        <Route path='/recommended' element={<Recommended />} />
      </Routes>

      {/* <Authors show={page === "authors"} />

      <Books show={page === "books"} />

      <NewBook show={page === "add"} /> */}
    </div>
  )
}

export default App
