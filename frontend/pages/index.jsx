import { useState, useEffect } from 'react'
import { useTheme, Modal } from '@nextui-org/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

import { DataTable } from '../components/data-table/index.component'
import { Filters } from '../components/filters/index.component'
import { LifterGraph } from '../components/lifter-graph/index.component'

const fetchLifterData = async (
  gender = 'male',
  start = 0,
  stop = 500,
  sortby = 'total',
  federation = 'allfeds',
  weightclass = 'allcats'
) => {
  const bodyContent = JSON.stringify({
    gender,
    start,
    stop,
    sortby,
    federation,
    weightclass
  })

  const res = await fetch(`${process.env.API}/leaderboard`, {
    method: 'POST',
    headers: {
      Accept: '*/*',
      'Content-Type': 'application/json',
    },
    body: bodyContent,
  }).catch(error => console.error(error))

  return await res.json()
}

const fetchLifterGraphData = async (lifterName) => {
  const bodyContent = JSON.stringify({
    "NameStr": lifterName
  })

  const res = await fetch(`${process.env.API}/lifter`, {
    method: 'POST',
    headers: {
      Accept: '*/*',
      'Content-Type': 'application/json',
    },
    body: bodyContent,
  }).catch(error => console.error(error))

  return await res.json()
}

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
})

const lightTheme = createTheme({
  palette: {
    mode: 'light',
  },
})

const Home = ({ data }) => {
  const [currentGender, setCurrentGender] = useState('male')
  const [sortBy, setSortBy] = useState('total')
  const [federation, setFederation] = useState('allfeds')
  const [weightclass, setWeightclass] = useState('allcats')
  const [currentLifterList, setCurrentLifterList] = useState(data)
  const [currentLifterName, setCurrentLifterName] = useState()
  const [showLifterGraph, setShowLifterGraph] = useState(false)
  const [currentLifterGraph, setCurrentLifterGraph] = useState()
  const [isGraphLoading, setIsGraphLoading] = useState(true)
  const { isDark } = useTheme()

  useEffect(() => {
    async function callFetchLisfterData() {
      setCurrentLifterList(
        await fetchLifterData(currentGender, 0, 500, sortBy, federation, weightclass),
      )
    }

    callFetchLisfterData()
  }, [currentGender, sortBy, federation, weightclass])

  const handleGenderChange = newFilter => {
    const { type, value } = newFilter
    console.log(type, value)
    switch (type) {
      case 'gender':
        setCurrentGender(value)
        break
      case 'sortBy':
        setSortBy(value)
        break
      case 'weightclass':
        setWeightclass(value)
        break
      default:
        setFederation(value)
    }
  }

  const openLifterGraphHandler = (lifterName) => {
    setIsGraphLoading(true)
    setCurrentLifterName(lifterName)
    fetchLifterGraphData(lifterName)
      .then((data) => setCurrentLifterGraph(data))
      .then(() => setShowLifterGraph(true))
      .then(() => setIsGraphLoading(false))
  }

  const closeLifterGraphHandler = () => setShowLifterGraph(false)

  return (
    <>
      <ThemeProvider theme={isDark ? darkTheme : lightTheme}>
        <CssBaseline />
        <Filters
          currentGender={currentGender}
          sortBy={sortBy}
          federation={federation}
          handleGenderChange={handleGenderChange}
          weightClass={weightclass}
        />
        {currentLifterList && <DataTable lifters={currentLifterList} openLifterGraphHandler={openLifterGraphHandler} />}
      </ThemeProvider>
      <Modal closeButton blur open={showLifterGraph} onClose={closeLifterGraphHandler} width={1000}>
        <h3>{currentLifterName}: History (Total)</h3>
        {isGraphLoading ? (
          <h4>Loading...</h4>
        ) : (
          <LifterGraph data={currentLifterGraph} lifterName={currentLifterName} />
        )}
      </Modal>
    </>
  )
}

export async function getServerSideProps() {
  let data;
  try {
    data = await fetchLifterData()
  } catch {
    data = []
  }

  return { props: { data } }
}

export default Home
