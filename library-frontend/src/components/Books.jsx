import { useLazyQuery, useQuery } from '@apollo/client'
import { ALL_BOOKS, ALL_GENRE } from '../queries'
import { useEffect, useState } from 'react'

const Books = () => {
  const genresResult = useQuery(ALL_GENRE)
  const [allBooks, result] = useLazyQuery(ALL_BOOKS)
  const [genre, setGenre] = useState(null)

  useEffect(() => {
    allBooks()
  }, [])

  if (result.loading) return <div>loading...</div>

  if (!result.data) return <div>No data available</div>

  const books = result.data.allBooks

  return (
    <div>
      <h2>books</h2>

      {genre && (
        <p>
          in genre <strong>{genre}</strong>
        </p>
      )}

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!genresResult.loading &&
        genresResult.data &&
        genresResult.data.allGenres.map((genre) => (
          <button
            key={genre}
            onClick={() => {
              allBooks({ variables: { genre: genre } })
              setGenre(genre)
            }}
          >
            {genre}
          </button>
        ))}
      <button
        onClick={() => {
          allBooks()
          setGenre(null)
        }}
      >
        all genres
      </button>
    </div>
  )
}

export default Books
