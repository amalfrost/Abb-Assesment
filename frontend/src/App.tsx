import { useEffect } from "react"
import * as api from './api'



function App() {

  useEffect(() => {
    api.createGame('TwoPlayer').then(console.log)
    api.makeMove('bad-id', 'X', 0, 0).catch((e) => console.log('error:', e.message))
  }, [])

  return (

    <>
      <div>
        <p className="text-2xl text-red-400" >Hello</p>
      </div>
    </>
  )
}

export default App
