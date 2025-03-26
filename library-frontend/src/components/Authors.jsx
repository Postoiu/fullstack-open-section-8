import { useState } from 'react'
import { useMutation, useQuery } from '@apollo/client'

import Select from 'react-select'

import { ALL_AUTHORS, EDIT_AUTHOR } from '../queries'

const Authors = () => {
  const result = useQuery(ALL_AUTHORS)
  const [selectedOption, setSelectedOption] = useState('')
  const [born, setBorn] = useState('')

  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
  })

  if (result.loading) return <div>loading...</div>

  const authors = result.data.allAuthors

  const options = authors.map((a) => ({ value: a.name, label: a.name }))

  const submit = (event) => {
    event.preventDefault()

    editAuthor({
      variables: { name: selectedOption.value, born: Number(born) },
    })

    setSelectedOption('')
    setBorn('')
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Set birthyear</h2>
      <form onSubmit={submit}>
        <div>
          <Select
            defaultValue={selectedOption}
            onChange={setSelectedOption}
            options={options}
          />
        </div>
        <div>
          born
          <input
            type='number'
            value={born}
            onChange={({ target }) => setBorn(target.value)}
          />
        </div>
        <button type='submit'>update author</button>
      </form>
    </div>
  )
}

export default Authors
