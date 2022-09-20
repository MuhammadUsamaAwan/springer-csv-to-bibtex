import { useState } from 'react'
import Papa from 'papaparse'
import axios from 'axios'
import { saveAs } from 'file-saver'

const App = () => {
  const [inputLength, setInputLength] = useState(0)
  const [outputLength, setOutputLength] = useState(0)
  const [loading, setLoading] = useState(false)

  const handleChange = async e => {
    setLoading(true)
    const file = e.target.files[0]
    if (file.type !== 'text/csv') {
      alert('Please upload a CSV File!')
      return
    }
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async results => {
        const responseData = []
        setInputLength(results?.data.length)
        for (let i = 0; i < results?.data?.length; i++) {
          try {
            const res = await axios.get(
              `https://dx.doi.org/${results?.data[i]['Item DOI']}`,
              {
                headers: {
                  Accept: 'text/bibliography; style=bibtex',
                },
              }
            )
            responseData.push(res?.data)
            setOutputLength(prev => prev + 1)
          } catch (err) {
            console.error(err)
          }
        }
        const blob = new Blob(responseData, {
          type: 'text/plain;charset=utf-8',
        })
        saveAs(blob, 'springer_citations.bib')
        setLoading(false)
        setInputLength(0)
        setOutputLength(0)
      },
    })
  }

  return (
    <section className='grid justify-center mt-20'>
      <h1 className='text-center text-3xl mb-10 font-semibold'>
        Springer SCV To BibTex
      </h1>
      {loading ? (
        <h3 className='text-center'>
          Loading... This might take a while depending on your input file
          (Progress: {outputLength}/{inputLength})
        </h3>
      ) : (
        <input type='file' name='file' accept='.csv' onChange={handleChange} />
      )}
    </section>
  )
}

export default App
