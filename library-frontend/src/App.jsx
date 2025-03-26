import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import { Link, Navigate, Route, Routes } from 'react-router-dom'

const App = () => {
  return (
    <div>
      <div>
        <Link style={{ margin: 10 }} to='/authors'>
          authors
        </Link>
        <Link style={{ margin: 10 }} to='/books'>
          books
        </Link>
        <Link style={{ margin: 10 }} to='/add'>
          add book
        </Link>
      </div>

      <Routes>
        <Route path='/' element={<Navigate to='/authors' replace />} />
        <Route path='/authors' element={<Authors />} />
        <Route path='/books' element={<Books />} />
        <Route path='/add' element={<NewBook />} />
      </Routes>

      {/* <Authors show={page === "authors"} />

      <Books show={page === "books"} />

      <NewBook show={page === "add"} /> */}
    </div>
  )
}

export default App
