import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Card, Container, Row, Text } from "@nextui-org/react";

import { LifterGraph } from "../components/lifter-graph/index.component";
import { HistoryTable } from "../components/history-table/index.components";
import { LifterHistory } from "../models/api_endpoint";

const blankLifterHistory: LifterHistory = {
  name: '',
  graph: {
    labels: [],
    datasets: []
  },
  lifts: []
}

const fetchLifterHistory = async (name: string) => {
  if (name === undefined) return await blankLifterHistory as LifterHistory

  const response = await fetch('http://localhost:8080/history', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ NameStr: name })
  }).then((res) => res.json()).catch(error => console.error('error in fetchLifterHistory', error))

  return await response as LifterHistory
}


const Lifter = () => {
  const router = useRouter()
  const { name } = router.query

  const [lifterHistory, setLifterHistory] = useState({
    name: '',
    graph: {
      labels: [],
      datasets: []
    },
    lifts: []
  } as LifterHistory)

  useEffect(() => {
    async function fetchLifterHistoryFromAPI(name: string) {
      setLifterHistory(await fetchLifterHistory(name))
    }

    fetchLifterHistoryFromAPI(name as string).then()
  }, [name])

  return (
    <div>
      <Container alignContent={'center'} alignItems={'center'}>
        <Card>
          <Card.Body>
            <Row justify="center" align="center">
              <Text h1>{lifterHistory['name']}</Text>
            </Row>
          </Card.Body>
        </Card>
      </Container>
      <LifterGraph lifterHistory={lifterHistory['graph']} />
      <HistoryTable history={lifterHistory['lifts']} />
    </div>
  )
}

export default Lifter