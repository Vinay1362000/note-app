import React from 'react'
import Notes from './Notes';

const Home = (props) => {
  const {showAlert} = props  // desctructuring 
  return (
    <div>
         
      <Notes showAlert={showAlert} />
    </div>

  )
}

export default Home
