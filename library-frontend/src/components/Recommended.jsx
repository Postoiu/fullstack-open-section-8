import { useLazyQuery, useQuery } from '@apollo/client'
import { ALL_BOOKS, CURRENT_USER } from '../queries'
import { useEffect } from 'react'

const Recommended = () => {
  const userResult = useQuery(CURRENT_USER)
  const [allBooks, result] = useLazyQuery(ALL_BOOKS)

  useEffect(() => {
    if (userResult.data) {
      allBooks({ variables: { genre: userResult.data.me.favoriteGenre } })
    }
  }, [userResult.data])

  if (userResult.loading || !result.data) return <div>loading...</div>

  return (
    <div>
      <h2>recommedations</h2>

      <p>
        books in your favourite genre
        <strong> {userResult.data.me.favoriteGenre}</strong>
      </p>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {result.data.allBooks.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Recommended
